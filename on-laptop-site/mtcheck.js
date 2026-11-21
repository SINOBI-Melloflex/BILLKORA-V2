'use strict';
/* BillKora mtcheck.js - MikroTik migration check + live customer status.
   SAFETY: the only thing ever written to the router is ONE temporary secret named
   "bk-test-xxxxxx" carrying a BillKora marker comment. It is created, changed,
   disabled, enabled and deleted again. Every other step only READS. */
const RouterOS = require('./mt.js');
const MARK = 'BillKora migration test (auto-deleted)';
const PREFIX = 'bk-test-';
let getDb = null, job = null, busy = false, timer = null;
const live = { ts: 0, ok: false, err: '', sec: null, secTs: 0, act: {} };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const L = v => String(v == null ? '' : v).toLowerCase();
const rand = n => require('crypto').randomBytes(n).toString('hex').slice(0, n);

const STEPS = [
  ['conn', 'Connect to your MikroTik'],
  ['prof', 'Check packages and PPPoE profiles'],
  ['pool', 'Check IP pools'],
  ['t_add', 'Create a temporary test user'],
  ['t_pkg', 'Change the test user package'],
  ['t_dis', 'Disconnect the test user'],
  ['t_con', 'Reconnect the test user'],
  ['t_del', 'Remove the test user'],
  ['cust', 'Check all existing customers (read only)'],
  ['done', 'Final result']
];

function mk(c) { return new RouterOS({ host: c.ip, port: Number(c.port) || (c.ssl ? 8729 : 8728), user: c.user, pass: c.pass, ssl: !!c.ssl, timeout: 8000 }); }
async function open(c) {
  const r = mk(c);
  await r.connect();
  try { await r.login(); } catch (e) { r.close(); throw e; }
  return r;
}
function idx(rows) { const m = {}; rows.forEach(x => { if (x.name) m[L(x.name)] = x; }); return m; }
function poolSize(ranges) {
  let n = 0;
  String(ranges || '').split(',').forEach(s => {
    s = s.trim();
    let m = /^(\d+)\.(\d+)\.(\d+)\.(\d+)\s*-\s*(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(s);
    if (m) {
      const a = ((+m[1] * 256 + +m[2]) * 256 + +m[3]) * 256 + +m[4], b = ((+m[5] * 256 + +m[6]) * 256 + +m[7]) * 256 + +m[8];
      if (b >= a) n += b - a + 1;
    } else if ((m = /^\d+\.\d+\.\d+\.\d+\/(\d+)$/.exec(s))) n += Math.pow(2, 32 - Number(m[1]));
    else if (/^\d+\.\d+\.\d+\.\d+$/.test(s)) n++;
  });
  return n;
}
function pkgKey(db, x) { const p = db.packages.find(q => q.id === x.packageId); return p ? (p.profile || p.name) : ''; }

/* removes only OUR test secret(s): name starts with bk-test- AND carries the marker comment */
async function delTest(r, name) {
  if (!name || name.indexOf(PREFIX) !== 0) return;
  const rows = await r.print('/ppp/secret', { q: { name: name }, props: '.id,name,comment' });
  for (const x of rows) if (x.comment === MARK && L(x.name).indexOf(PREFIX) === 0) await r.remove('/ppp/secret', x['.id']);
  const act = await r.print('/ppp/active', { q: { name: name }, props: '.id,name' });
  for (const a of act) await r.remove('/ppp/active', a['.id']);
}
async function sweep(r) {
  try {
    const rows = await r.print('/ppp/secret', { props: '.id,name,comment' });
    for (const x of rows) if (L(x.name).indexOf(PREFIX) === 0 && x.comment === MARK) await r.remove('/ppp/secret', x['.id']);
  } catch (e) { /* ignore: read-only users cannot remove, the add step will report it */ }
}

function newJob(opts) {
  const steps = STEPS.filter(s => opts.test || s[0].indexOf('t_') !== 0).map(s => ({ id: s[0], title: s[1], state: 'wait', detail: '' }));
  return { id: 'j' + Date.now().toString(36), state: 'running', started: Date.now(), steps: steps, log: [], total: 0, items: [],
    counts: { online: 0, offline: 0, disabled: 0, missing: 0, mismatch: 0, issues: 0 }, extra: 0, verdict: null, error: '', cancel: false, opts: opts };
}

async function run(j, db, saveQ) {
  const c = db.mt, o = j.opts;
  let r = null, tname = '', tid = '', deleted = false;
  const st = (id, state, detail) => { const s = j.steps.find(x => x.id === id); if (s) { s.state = state; if (detail !== undefined) s.detail = detail; } };
  const lg = m => { j.log.push(new Date().toLocaleTimeString('en-GB') + '  ' + m); if (j.log.length > 200) j.log.shift(); };
  const skipRest = why => j.steps.forEach(s => { if (s.state === 'wait') { s.state = 'skip'; s.detail = why; } });
  async function soft(id, fn) {
    if (j.cancel) throw new Error('Stopped by you');
    st(id, 'run', ''); await sleep(320);
    try { const x = (await fn()) || {}; st(id, x.state || 'ok', x.detail || ''); lg(((j.steps.find(s => s.id === id) || {}).title || id) + ': ' + (x.detail || 'ok')); return true; }
    catch (e) { st(id, 'fail', e.message); lg('PROBLEM - ' + e.message); return false; }
  }
  try {
    lg('Starting check. Everything is read-only except one temporary test user.');
    const okc = await soft('conn', async () => {
      r = await open(c);
      const idn = (await r.print('/system/identity'))[0] || {}, rs = (await r.print('/system/resource'))[0] || {};
      return { detail: (idn.name || 'Router') + ' - RouterOS ' + (rs.version || '?') + ' (' + (rs['board-name'] || rs.platform || 'MikroTik') + ')' };
    });
    if (!okc) {
      skipRest('Skipped because the router could not be reached');
      j.verdict = { ok: false, title: 'Could not connect to the router', lines: [j.steps[0].detail, 'Nothing was changed on the router.'] };
      j.state = 'done'; return;
    }

    const profs = {}; let have = [];
    await soft('prof', async () => {
      const rows = await r.print('/ppp/profile', { props: 'name,remote-address,local-address' });
      rows.forEach(p => { profs[L(p.name)] = p; });
      const pk = db.packages.map(p => ({ p: p, key: p.profile || p.name, n: db.customers.filter(x => x.packageId === p.id).length }));
      have = pk.filter(x => profs[L(x.key)]).map(x => x.key);
      const bad = pk.filter(x => x.n > 0 && !profs[L(x.key)]);
      if (bad.length) return { state: 'warn', detail: 'Router has no PPPoE profile named ' + bad.map(x => "'" + x.key + "' (package " + x.p.name + ', ' + x.n + ' customers)').join(', ') + '. Set the exact router profile name in Package Management.' };
      return { detail: rows.length + ' profiles on the router. All packages in use match a router profile.' };
    });

    await soft('pool', async () => {
      const used = []; db.packages.forEach(p => { const k = p.profile || p.name; if (db.customers.some(x => x.packageId === p.id) && profs[L(k)] && used.indexOf(k) < 0) used.push(k); });
      const pm = idx(await r.print('/ip/pool', { props: 'name,ranges' })), lines = []; let warn = false;
      for (const k of used) {
        const ra = profs[L(k)]['remote-address'];
        if (!ra) { lines.push(k + ': address set per user'); continue; }
        const pl = pm[L(ra)];
        if (!pl) { if (/^\d+\.\d+\.\d+\.\d+$/.test(ra)) { lines.push(k + ': fixed address ' + ra); continue; } lines.push(k + ": pool '" + ra + "' NOT FOUND"); warn = true; continue; }
        const size = poolSize(pl.ranges); let un = 0;
        try { un = await r.count('/ip/pool/used', { pool: pl.name }); } catch (e) {}
        const cu = db.customers.filter(x => pkgKey(db, x) === k).length;
        if (size && size < cu) { warn = true; lines.push(k + ": pool '" + pl.name + "' has only " + size + ' addresses for ' + cu + ' customers'); }
        else lines.push(k + ": pool '" + pl.name + "' " + size + ' addresses, ' + un + ' in use');
      }
      if (!lines.length) return { detail: 'No pool needed (nothing to check)' };
      return { state: warn ? 'warn' : 'ok', detail: lines.join(' | ') };
    });

    if (o.test) {
      const cand = have.slice();
      Object.keys(profs).forEach(k => { const n = profs[k].name; if (L(n) !== 'default-encryption' && cand.map(L).indexOf(L(n)) < 0) cand.push(n); });
      const p1 = cand[0] || '';
      let p2 = cand.find(x => L(x) !== L(p1)) || '';
      const skipT = (id, why) => st(id, 'skip', why);
      const good = await soft('t_add', async () => {
        if (!p1) throw new Error('The router has no PPPoE profile to use for the test.');
        await sweep(r);
        tname = PREFIX + rand(6);
        if ((await r.print('/ppp/secret', { q: { name: tname }, props: '.id' })).length) throw new Error('Test name already exists, try again.');
        try { await r.add('/ppp/secret', { name: tname, password: rand(12), service: 'pppoe', profile: p1, comment: MARK }); }
        catch (e) { tname = ''; throw new Error(/permission|not enough/i.test(e.message) ? 'This API user cannot write. Give it a group with read, write and api policies, or untick the test-user option.' : e.message); }
        const rb = await r.print('/ppp/secret', { q: { name: tname }, props: '.id,name,profile,comment,disabled' });
        if (!rb.length || rb[0].comment !== MARK) throw new Error('The router accepted the command but the test user was not found.');
        tid = rb[0]['.id'];
        return { detail: "Created '" + tname + "' on profile '" + p1 + "' and confirmed it on the router" };
      });
      const rd = async () => (await r.print('/ppp/secret', { q: { name: tname }, props: '.id,name,profile,disabled' }))[0];
      if (good) {
        await soft('t_pkg', async () => {
          if (!p2) return { detail: 'The router has only one usable profile, so the package change could not be tested (not a problem).' };
          await r.set('/ppp/secret', tid, { profile: p2 });
          const x = await rd();
          if (!x || L(x.profile) !== L(p2)) throw new Error('The package did not change on the router.');
          return { detail: 'Changed profile ' + p1 + ' to ' + p2 + ' and confirmed it' };
        });
        await soft('t_dis', async () => {
          const act = await r.print('/ppp/active', { q: { name: tname }, props: '.id,name' });
          for (const a of act) await r.remove('/ppp/active', a['.id']);
          await r.set('/ppp/secret', tid, { disabled: 'yes' });
          const x = await rd();
          if (!x || !/^(true|yes)$/.test(x.disabled)) throw new Error('The user was not disabled on the router.');
          return { detail: 'Disabled the test user and cleared its session (' + act.length + ' active sessions closed)' };
        });
        await soft('t_con', async () => {
          await r.set('/ppp/secret', tid, { disabled: 'no' });
          const x = await rd();
          if (!x || !/^(false|no)$/.test(x.disabled)) throw new Error('The user was not re-enabled on the router.');
          return { detail: 'Enabled the test user again and confirmed it' };
        });
        await soft('t_del', async () => {
          await delTest(r, tname);
          if ((await r.print('/ppp/secret', { q: { name: tname }, props: '.id' })).length) throw new Error('Test user still exists on the router. Remove ' + tname + ' by hand.');
          deleted = true;
          return { detail: 'Test user removed. The router is exactly as before.' };
        });
      } else { ['t_pkg', 't_dis', 't_con', 't_del'].forEach(id => skipT(id, 'Skipped because the test user could not be created')); }
    }

    await soft('cust', async () => {
      const sec = idx(await r.print('/ppp/secret', { props: '.id,name,profile,disabled,service' }));
      const act = idx(await r.print('/ppp/active', { props: 'name,address,uptime' }));
      live.sec = sec; live.secTs = Date.now(); live.act = act; live.ts = Date.now(); live.ok = true; live.err = '';
      const cs = db.customers.slice(), known = {};
      j.total = cs.length;
      const per = cs.length ? Math.max(0, Math.min(25, Math.floor(5000 / cs.length))) : 0;
      for (const x of cs) {
        if (j.cancel) break;
        const u = L(x.username); known[u] = 1;
        const se = sec[u]; let s, m = 0, a = '';
        if (!se) s = 'missing'; else if (/^(true|yes)$/.test(se.disabled)) s = 'disabled'; else if (act[u]) { s = 'online'; a = act[u].address || ''; } else s = 'offline';
        if (se) { const key = pkgKey(db, x); if (key && L(se.profile) !== L(key)) m = 1; }
        j.items.push({ u: x.username, n: x.name, s: s, m: m, a: a });
        j.counts[s]++; j.counts.mismatch += m;
        if (x.status !== 'disconnected' && (s === 'missing' || m)) j.counts.issues++;
        if (per) await sleep(per);
      }
      if (!j.cancel) { /* remember what the router has, so later BillKora changes can be synced safely */
        db.mtsnap = db.mtsnap || {};
        cs.forEach(x => { const se = sec[L(x.username)]; if (se) db.mtsnap[x.id] = { r: snapOf(se), b: want(db, x) }; });
        saveQ();
      }
      j.extra = Object.keys(sec).filter(k => !known[k] && k.indexOf(PREFIX) !== 0).length;
      const k = j.counts;
      return { state: k.issues ? 'warn' : 'ok', detail: cs.length + ' customers checked: ' + k.online + ' online, ' + k.offline + ' offline, ' + k.disabled + ' disabled on router, ' + k.missing + ' not found on router, ' + k.mismatch + ' on a different profile' + (j.extra ? '. ' + j.extra + (j.extra === 1 ? ' router user is' : ' router users are') + ' not in BillKora (left untouched).' : '') };
    });
    if (j.cancel) throw new Error('Stopped by you');

    const fails = j.steps.filter(s => s.state === 'fail'), warns = j.steps.filter(s => s.state === 'warn');
    const ok = !fails.length && !warns.length && !j.counts.issues;
    const lines = [];
    fails.concat(warns).forEach(s => lines.push(s.title + ': ' + s.detail));
    if (!o.test) lines.push('The temporary test-user check was switched off for this run.');
    j.verdict = ok
      ? { ok: true, title: 'Congratulations! Migration successful', lines: ['Your MikroTik, packages, IP pools and all ' + j.total + ' customers were checked with no conflict.', o.test ? 'The test user was created, changed, disconnected, reconnected and removed.' : 'Test-user check was skipped by choice.'] }
      : { ok: false, title: 'Migration check finished - needs attention', lines: lines.length ? lines : ['Review the customers listed below.'] };
    st('done', ok ? 'ok' : 'warn', j.verdict.title);
    j.state = 'done';
  } catch (e) {
    j.error = e.message; j.state = j.cancel ? 'stopped' : 'failed';
    skipRest('Stopped');
    j.verdict = { ok: false, title: j.cancel ? 'Check stopped' : 'Check stopped by an error', lines: [e.message] };
  } finally {
    if (r) {
      if (tname && !deleted) { try { await delTest(r, tname); lg('Cleaned up the test user.'); } catch (e) { lg('Could not remove test user ' + tname + ' - delete it by hand in Winbox > PPP > Secrets.'); } }
      r.close();
    }
    if (j.state === 'running') j.state = 'done';
  }
}

/* ---------- live status ---------- */
async function tick() {
  const db = getDb && getDb(), c = db && db.mt;
  if (!c || !c.ip || busy || (job && job.state === 'running')) return;
  busy = true; let r;
  try {
    r = await open(c);
    const now = Date.now();
    if (!live.sec || now - live.secTs > 60000) { live.sec = idx(await r.print('/ppp/secret', { props: 'name,disabled,profile' })); live.secTs = now; }
    live.act = idx(await r.print('/ppp/active', { props: 'name,address,uptime' }));
    live.ts = Date.now(); live.err = ''; live.ok = true;
  } catch (e) { live.err = e.message; live.ok = false; }
  finally { if (r) r.close(); busy = false; }
  if (Date.now() - lastFail > 60000) syncTick();
}
function startPoller() { if (timer) return; timer = setInterval(tick, 10000); setTimeout(tick, 1500); }
function liveView(db) {
  const counts = { online: 0, offline: 0, disabled: 0, missing: 0 }, items = [];
  db.customers.forEach(x => {
    const u = L(x.username), se = live.sec && live.sec[u]; let s, a = '', up = '';
    if (!live.sec) s = 'unknown'; else if (!se) s = 'missing'; else if (/^(true|yes)$/.test(se.disabled)) s = 'disabled'; else if (live.act[u]) { s = 'online'; a = live.act[u].address || ''; up = live.act[u].uptime || ''; } else s = 'offline';
    if (counts[s] !== undefined) counts[s]++;
    items.push({ u: x.username, n: x.name, s: s, a: a, up: up });
  });
  return { ts: live.ts, ok: live.ok, err: live.err, configured: !!(db.mt && db.mt.ip), counts: counts, items: items };
}

function snapshot(j, from) {
  return { none: false, id: j.id, state: j.state, steps: j.steps, log: j.log.slice(-60), total: j.total, counts: j.counts, extra: j.extra,
    items: j.items.slice(Math.max(0, Number(from) || 0)), verdict: j.verdict, error: j.error, test: !!j.opts.test };
}


/* ---------- sync BillKora changes to MikroTik ----------
   Only customers the check found on the router (db.mtsnap) are ever touched, one at a time, by exact
   username. Nothing is deleted from the router. A change is applied only if the router still has what
   BillKora last saw. Small changes you make yourself can go automatically; bulk or "drift" waits for OK. */
let saveFn = null, syncBusy = false, quiet = false, syncTimer = null, lastFail = 0;
const isOff = v => /^(true|yes)$/.test(String(v));
const want = (db, x) => ({ n: L(x.username), p: pkgKey(db, x), d: x.status !== 'active' });
const snapOf = se => ({ n: se.name, p: se.profile || '', d: isOff(se.disabled) });
function saveQuiet() { quiet = true; try { if (saveFn) saveFn(); } finally { quiet = false; } }
function slog(db, u, what, ok, err) { db.mtlog = db.mtlog || []; db.mtlog.unshift({ t: new Date().toISOString(), u: u, what: what, ok: !!ok, err: err || '' }); if (db.mtlog.length > 100) db.mtlog.length = 100; }
function label(f) {
  if (f.f === 'n') return 'Rename user ' + f.from + ' to ' + f.to;
  if (f.f === 'p') return 'Package ' + (f.from || '?') + ' to ' + f.to;
  return f.to ? 'Disconnect (disable on router)' : 'Reconnect (enable on router)';
}
function plan(db) {
  const snap = db.mtsnap || {}, items = [];
  Object.keys(snap).forEach(id => {
    const s = snap[id], x = db.customers.find(c => c.id === id);
    if (!x) { if (!s.r.d) items.push({ cid: id, u: s.r.n, n: '(deleted in BillKora)', gone: true, fields: [{ f: 'd', from: false, to: true, user: false }] }); return; } /* deleting never goes automatically */
    const w = want(db, x), f = [];
    if (w.n !== L(s.r.n)) f.push({ f: 'n', from: s.r.n, to: w.n, user: w.n !== L(s.b.n) });
    if (w.p && L(w.p) !== L(s.r.p)) f.push({ f: 'p', from: s.r.p, to: w.p, user: L(w.p) !== L(s.b.p) });
    if (w.d !== s.r.d) f.push({ f: 'd', from: s.r.d, to: w.d, user: w.d !== s.b.d });
    if (f.length) items.push({ cid: id, u: x.username, n: x.name, fields: f });
  });
  return items;
}
async function applyOne(r, db, it, onlyUser) {
  const snap = db.mtsnap[it.cid], fields = it.fields.filter(f => !onlyUser || f.user), res = { cid: it.cid, u: it.u, ok: false, err: '' };
  const what = fields.map(label).join(', ');
  try {
    if (!fields.length) throw new Error('Nothing to do');
    const cur = (await r.print('/ppp/secret', { q: { name: snap.r.n }, props: '.id,name,profile,disabled' }))[0];
    if (!cur) throw new Error("User '" + snap.r.n + "' is not on the router any more. Run the check again.");
    if (L(cur.name).indexOf(PREFIX) === 0) throw new Error('Refused: that is a BillKora test user');
    const now = snapOf(cur);
    for (const f of fields) {
      if (f.f === 'p' && L(now.p) !== L(snap.r.p)) throw new Error('The router profile was changed outside BillKora (now ' + now.p + '). Run the check again.');
      if (f.f === 'd' && now.d !== snap.r.d) throw new Error('The user was enabled/disabled on the router outside BillKora. Run the check again.');
    }
    const set = {};
    fields.forEach(f => { if (f.f === 'n') set.name = f.to; if (f.f === 'p') set.profile = f.to; if (f.f === 'd') set.disabled = f.to ? 'yes' : 'no'; });
    if (set.name && (await r.print('/ppp/secret', { q: { name: set.name }, props: '.id' })).length) throw new Error("A user named '" + set.name + "' already exists on the router.");
    if (set.profile && !(await r.print('/ppp/profile', { q: { name: set.profile }, props: 'name' })).length) throw new Error("The router has no PPPoE profile named '" + set.profile + "'.");
    await r.set('/ppp/secret', cur['.id'], set);
    const rb = (await r.print('/ppp/secret', { q: { '.id': cur['.id'] }, props: '.id,name,profile,disabled' }))[0];
    if (!rb || (set.name && rb.name !== set.name) || (set.profile && L(rb.profile) !== L(set.profile)) || (set.disabled && isOff(rb.disabled) !== (set.disabled === 'yes'))) throw new Error('The router did not confirm the change.');
    let kicked = 0;
    if (fields.some(f => f.f !== 'd' || f.to === true)) { /* active session keeps old settings until it reconnects, so close it */
      const act = await r.print('/ppp/active', { q: { name: rb.name }, props: '.id,name' });
      for (const a of act) { await r.remove('/ppp/active', a['.id']); kicked++; }
    }
    fields.forEach(f => { if (f.f === 'n') { snap.r.n = f.to; snap.b.n = f.to; } if (f.f === 'p') { snap.r.p = f.to; snap.b.p = f.to; } if (f.f === 'd') { snap.r.d = f.to; snap.b.d = f.to; } });
    if (it.gone) delete db.mtsnap[it.cid];
    res.ok = true; res.what = what; slog(db, it.u, what + (kicked ? ' (session reconnects)' : ''), true);
  } catch (e) { res.err = e.message; slog(db, it.u, what, false, e.message); }
  return res;
}
async function applyBatch(db, items, onlyUser) {
  let r;
  try { r = await open(db.mt); } catch (e) { lastFail = Date.now(); return items.map(it => ({ cid: it.cid, u: it.u, ok: false, err: e.message })); }
  const out = [];
  try { for (const it of items) out.push(await applyOne(r, db, it, onlyUser)); } finally { r.close(); }
  if (out.some(o => !o.ok)) lastFail = Date.now();
  live.secTs = 0;
  saveQuiet();
  return out;
}
async function syncTick() {
  const db = getDb && getDb();
  if (!db || !db.mt || !db.mtsnap || syncBusy || (job && job.state === 'running') || (db.mt.sync || 'auto') !== 'auto') return;
  const items = plan(db).filter(i => i.fields.some(f => f.user));
  if (!items.length || items.length > 3) return; /* bulk changes wait for your OK */
  syncBusy = true;
  try { await applyBatch(db, items, true); } finally { syncBusy = false; }
}
function schedSync() { clearTimeout(syncTimer); syncTimer = setTimeout(syncTick, 900); }
function syncView(db) {
  const items = plan(db), snapN = Object.keys(db.mtsnap || {}).length, auto = (db.mt && db.mt.sync) || 'auto';
  const um = [];
  if (live.sec) db.customers.forEach(x => { if (!(db.mtsnap || {})[x.id]) um.push({ id: x.id, u: x.username, n: x.name, onRouter: !!live.sec[L(x.username)] }); });
  return { configured: !!(db.mt && db.mt.ip), mode: auto, baseline: snapN,
    pending: items.map(i => ({ cid: i.cid, u: i.u, n: i.n, gone: !!i.gone, fields: i.fields.map(f => ({ text: label(f), user: f.user })), user: i.fields.some(f => f.user) })),
    waiting: auto === 'auto' && items.filter(i => i.fields.some(f => f.user)).length > 3,
    unmanaged: um.slice(0, 200), log: (db.mtlog || []).slice(0, 40) };
}
async function createOnRouter(db, cid, pass) {
  const x = db.customers.find(c => c.id === cid);
  if (!x) throw new Error('Customer not found');
  if ((db.mtsnap || {})[cid]) throw new Error('This customer is already linked to the router');
  if (!pass) throw new Error('Enter a PPPoE password for this customer');
  const w = want(db, x); if (!w.p) throw new Error('This customer has no package');
  const r = await open(db.mt);
  try {
    if ((await r.print('/ppp/secret', { q: { name: w.n }, props: '.id' })).length) throw new Error("A user named '" + w.n + "' is already on the router. Run the check to link it.");
    if (!(await r.print('/ppp/profile', { q: { name: w.p }, props: 'name' })).length) throw new Error("The router has no PPPoE profile named '" + w.p + "'. Set it in Package Management.");
    await r.add('/ppp/secret', { name: w.n, password: pass, service: 'pppoe', profile: w.p, comment: 'BillKora', disabled: w.d ? 'yes' : 'no' });
    const rb = (await r.print('/ppp/secret', { q: { name: w.n }, props: '.id,name,profile,disabled' }))[0];
    if (!rb) throw new Error('The router did not keep the new user');
    db.mtsnap = db.mtsnap || {}; db.mtsnap[cid] = { r: snapOf(rb), b: w };
    slog(db, x.username, 'Created on router (profile ' + w.p + (w.d ? ', disabled' : '') + ')', true);
    live.secTs = 0; saveQuiet();
  } finally { r.close(); }
}

const IPOK = /^[A-Za-z0-9.\-:]{1,100}$/;
function handler(col, id, act, M, b, ok, bad, db, save, uid, now, str) {
  if (col !== 'mt') return false;
  b = b || {};
  saveFn = save;
  if (id === 'config') {
    if (M === 'GET') { const c = db.mt || {}; ok({ ip: c.ip || '', port: c.port || '', user: c.user || '', ssl: !!c.ssl, hasPass: !!c.pass, configured: !!(c.ip && c.user && c.pass) }); return true; }
    if (M === 'POST') {
      const old = db.mt || {}, ip = str(b.ip, 100), port = Number(b.port) || (b.ssl ? 8729 : 8728), user = str(b.user, 100), pass = String(b.pass || '') || old.pass || '';
      if (!ip || !IPOK.test(ip)) { bad('Enter the MikroTik IP address, for example 192.168.88.1'); return true; }
      if (port < 1 || port > 65535) { bad('Port must be 1 to 65535'); return true; }
      if (!user) { bad('Enter the API username'); return true; }
      if (!pass) { bad('Enter the API password'); return true; }
      db.mt = { ip: ip, port: port, user: user, pass: pass, ssl: !!b.ssl, saved: now() };
      live.sec = null; live.secTs = 0; live.act = {}; live.ts = 0; live.ok = false; live.err = '';
      const arr = db.netdevices = db.netdevices || [];
      let d = arr.find(x => x.kind === 'MikroTik' && x.ip === ip);
      if (!d) { d = { id: uid('nd'), name: 'MikroTik Router', kind: 'MikroTik', method: 'api', ip: ip, port: String(port), user: user, pass: pass, status: 'unknown', note: 'Added by the migration check' }; arr.push(d); }
      else { d.port = String(port); d.user = user; d.pass = pass; }
      save(); startPoller(); ok({ ok: true }); return true;
    }
    return false;
  }

  if (id === 'sync') {
    if (M === 'GET' && !act) { ok(syncView(db)); return true; }
    if (!db.mt) { bad('Save the MikroTik details first'); return true; }
    if (M === 'POST' && act === 'mode') { if (['off', 'ask', 'auto'].indexOf(b.mode) < 0) { bad('Unknown mode'); return true; } db.mt.sync = b.mode; save(); ok({ ok: true }); return true; }
    if (M === 'POST' && act === 'apply') {
      if (syncBusy || (job && job.state === 'running')) { bad('Please wait, the router is busy with another task'); return true; }
      const ids = Array.isArray(b.ids) ? b.ids : null, items = plan(db).filter(i => b.all || (ids && ids.indexOf(i.cid) > -1));
      if (!items.length) { ok({ ok: true, results: [] }); return true; }
      syncBusy = true;
      applyBatch(db, items, false).then(r => ok({ ok: true, results: r })).catch(e => bad(e.message)).then(() => { syncBusy = false; });
      return true;
    }
    if (M === 'POST' && act === 'create') {
      if (syncBusy || (job && job.state === 'running')) { bad('Please wait, the router is busy with another task'); return true; }
      syncBusy = true;
      createOnRouter(db, String(b.customerId || ''), String(b.password || '')).then(() => ok({ ok: true })).catch(e => bad(e.message)).then(() => { syncBusy = false; });
      return true;
    }
    return false;
  }
  if (id === 'test' && M === 'POST') {
    const old = db.mt || {}, ip = str(b.ip, 100) || old.ip, user = str(b.user, 100) || old.user, pass = String(b.pass || '') || old.pass, ssl = b.ssl !== undefined ? !!b.ssl : !!old.ssl, port = Number(b.port) || old.port || (ssl ? 8729 : 8728);
    if (!ip || !IPOK.test(ip) || !user || !pass) { ok({ ok: false, msg: 'Fill in IP, username and password first.' }); return true; }
    open({ ip: ip, port: port, user: user, pass: pass, ssl: ssl }).then(async r => {
      try { const i = (await r.print('/system/identity'))[0] || {}, s = (await r.print('/system/resource'))[0] || {}; ok({ ok: true, msg: 'Connected to ' + (i.name || ip) + ' - RouterOS ' + (s.version || '?') }); }
      catch (e) { ok({ ok: false, msg: e.message }); } finally { r.close(); }
    }).catch(e => ok({ ok: false, msg: e.message }));
    return true;
  }
  if (id === 'start' && M === 'POST') {
    const c = db.mt;
    if (!c || !c.ip || !c.user || !c.pass) { bad('Save the MikroTik details first'); return true; }
    if (job && job.state === 'running') { ok({ ok: true, id: job.id, already: true }); return true; }
    job = newJob({ test: b.test !== false });
    run(job, db, saveQuiet).then(() => startPoller()).catch(e => { job.state = 'failed'; job.error = e.message; });
    ok({ ok: true, id: job.id }); return true;
  }
  if (id === 'job' && M === 'POST') { ok(job ? snapshot(job, b.from) : { none: true }); return true; }
  if (id === 'stop' && M === 'POST') { if (job && job.state === 'running') job.cancel = true; ok({ ok: true }); return true; }
  if (id === 'live' && M === 'GET') { ok(liveView(db)); return true; }
  return false;
}
handler.afterSave = function (s) { if (s) saveFn = s; if (!quiet) schedSync(); };
handler.boot = function (g) { getDb = g; const d = g(); if (d && d.mt && d.mt.ip) startPoller(); };
module.exports = handler;
