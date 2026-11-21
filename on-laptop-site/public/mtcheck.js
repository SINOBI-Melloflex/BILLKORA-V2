/* BillKora public/mtcheck.js - MikroTik Check & Live Status page. Loads after the other admin scripts. */
(function () {
if (typeof V === 'undefined' || typeof api !== 'function') return;
var css = document.createElement('style');
css.textContent = [
'.mt-row{display:grid;grid-template-columns:2fr 1fr 1.4fr 1.4fr;gap:12px;margin:12px 0}@media(max-width:900px){.mt-row{grid-template-columns:1fr 1fr}}',
'.mt-row label{display:block;font-size:13px;color:#6b7a99}.mt-row input{width:100%;margin-top:4px}',
'.mt-chk{display:flex!important;gap:10px;align-items:flex-start;justify-content:flex-start;text-align:left;margin:8px 0;font-size:14px;color:inherit;width:auto}.mt-chk input{width:auto!important;flex:none;margin:3px 0 0}.mt-chk span,.mt-chk b{color:inherit!important;text-align:left;display:inline}',
'.mt-help{background:#f4f7ff;border:1px solid #d9e2f3;border-radius:12px;padding:12px 14px;margin:10px 0;font-size:13px;line-height:1.7}',
'.mt-help code{display:block;background:#0e1b3d;color:#cfe0ff;border-radius:8px;padding:8px 10px;margin:6px 0;font-size:12px;overflow:auto;white-space:pre}',
'body.dark .mt-help{background:#14213d;border-color:#2a3a5c}',
'.mt-msg{margin-top:8px;font-size:14px;min-height:20px}.mt-msg.er{color:#e5484d}.mt-msg.ok{color:#22b45a}',
'.mt-pulse{animation:mtPulse 1.6s ease-in-out infinite}@keyframes mtPulse{0%,100%{box-shadow:0 0 0 0 rgba(30,107,255,.45)}50%{box-shadow:0 0 0 12px rgba(30,107,255,0)}}',
'.mt-bar{height:10px;background:#e6ecfa;border-radius:20px;overflow:hidden;margin:6px 0 16px}.mt-bar i{display:block;height:100%;width:0;border-radius:20px;background:linear-gradient(90deg,#1e6bff,#5aa0ff,#1e6bff);background-size:200% 100%;animation:mtFlow 1.4s linear infinite;transition:width .5s ease}',
'.mt-bar.done i{animation:none;background:#22b45a}@keyframes mtFlow{to{background-position:-200% 0}}',
'.mt-steps{list-style:none;margin:0;padding:0}.mt-steps li{display:flex;gap:12px;align-items:flex-start;padding:10px 12px;border-radius:12px;margin-bottom:6px;border:1px solid transparent;animation:mtIn .4s ease both;transition:background .3s}',
'.mt-steps li.run{background:#eef3ff;border-color:#c9d8ff}.mt-steps li.fail{background:#fff0f0;border-color:#f3c3c5}.mt-steps li.warn{background:#fff8ea;border-color:#f6dba5}',
'body.dark .mt-steps li.run{background:#14213d;border-color:#2a3a5c}',
'.mt-ic{flex:none;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;background:#e6ecfa;color:#7b8bb0}',
'.mt-steps li.run .mt-ic{background:transparent;border:3px solid #cfe0ff;border-top-color:#1e6bff;animation:mtSpin .8s linear infinite;color:transparent}',
'.mt-steps li.ok .mt-ic{background:#22b45a;color:#fff;animation:mtPop .45s ease}.mt-steps li.warn .mt-ic{background:#f5a623;color:#fff;animation:mtPop .45s ease}.mt-steps li.fail .mt-ic{background:#e5484d;color:#fff;animation:mtPop .45s ease}.mt-steps li.skip .mt-ic{background:#c7cfe2;color:#fff}',
'.mt-steps b{display:block;font-size:15px}.mt-steps small{display:block;color:#6b7a99;line-height:1.5;margin-top:2px;word-break:break-word}',
'.mt-steps li.wait{opacity:.55}',
'@keyframes mtSpin{to{transform:rotate(360deg)}}@keyframes mtPop{0%{transform:scale(.3)}70%{transform:scale(1.25)}100%{transform:scale(1)}}@keyframes mtIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}',
'.mt-grid{display:flex;flex-wrap:wrap;gap:3px;margin:10px 0;max-height:190px;overflow:auto;padding:2px}.mt-grid i{width:11px;height:11px;border-radius:3px;background:#dfe6f6;display:block}',
'.mt-grid i.s{animation:mtPop .35s ease}.mt-grid i.online{background:#22b45a}.mt-grid i.offline{background:#f5a623}.mt-grid i.disabled{background:#8b93a8}.mt-grid i.missing{background:#e5484d}.mt-grid i.m{outline:2px solid #1e6bff}',
'.mt-leg{display:flex;gap:14px;flex-wrap:wrap;font-size:13px;color:#6b7a99}.mt-leg span:before{content:"";display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;background:var(--c)}',
'.mt-chips{display:flex;gap:10px;flex-wrap:wrap;margin:10px 0}.mt-chip{padding:8px 14px;border-radius:12px;background:#f4f7ff;border:1px solid #d9e2f3;cursor:pointer;font-size:14px;transition:.2s}.mt-chip:hover{transform:translateY(-2px)}.mt-chip.on{background:#1e6bff;color:#fff;border-color:#1e6bff}.mt-chip b{margin-left:6px}',
'body.dark .mt-chip{background:#14213d;border-color:#2a3a5c;color:#dbe6ff}',
'.mt-log{background:#0e1b3d;color:#a9c4ff;border-radius:10px;padding:10px 12px;font:12px/1.6 Consolas,monospace;max-height:130px;overflow:auto;margin-top:12px;white-space:pre-wrap}',
'.mt-res{text-align:center;padding:26px 18px;border-radius:16px;margin-top:16px;position:relative;overflow:hidden;animation:mtIn .5s ease both}',
'.mt-res.good{background:linear-gradient(135deg,#e9fbf0,#f2fff7);border:1px solid #a8e6c0}.mt-res.warnb{background:#fff8ea;border:1px solid #f6dba5}.mt-res.badb{background:#fff0f0;border:1px solid #f3c3c5}',
'body.dark .mt-res.good{background:#10301f}body.dark .mt-res.warnb{background:#33290f}body.dark .mt-res.badb{background:#341515}',
'.mt-res h2{margin:10px 0 6px}.mt-res p{margin:4px 0;color:#52607f}',
'.mt-ok{width:84px;height:84px}.mt-ok .c{stroke-dasharray:151;stroke-dashoffset:151;animation:mtDraw .7s ease forwards}.mt-ok .k{stroke-dasharray:50;stroke-dashoffset:50;animation:mtDraw .45s .6s ease forwards}@keyframes mtDraw{to{stroke-dashoffset:0}}',
'.mt-cf{position:absolute;top:-12px;width:8px;height:14px;border-radius:2px;opacity:0;animation:mtFall 2.6s ease-in forwards}@keyframes mtFall{0%{opacity:1;transform:translateY(0) rotate(0)}100%{opacity:0;transform:translateY(300px) rotate(540deg)}}',
'.mt-dot{display:inline-block;width:10px;height:10px;border-radius:50%;background:#22b45a;margin-right:8px;animation:mtBeat 1.4s ease-in-out infinite}.mt-dot.off{background:#e5484d;animation:none}@keyframes mtBeat{0%,100%{box-shadow:0 0 0 0 rgba(34,180,90,.55)}50%{box-shadow:0 0 0 8px rgba(34,180,90,0)}}',
'.mt-st{display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600}.mt-st.online{background:#e3f8ea;color:#12843f}.mt-st.offline{background:#fff1d6;color:#a8690a}.mt-st.disabled{background:#e6e9f1;color:#5b6479}.mt-st.missing{background:#ffe3e4;color:#c02a30}.mt-st.unknown{background:#e6ecfa;color:#4c5f8f}',
'.mt-hide{display:none}',
'.mt-tag{display:inline-block;padding:2px 9px;border-radius:20px;font-size:12px;font-weight:600;margin:2px 4px 2px 0}.mt-tag.u{background:#e3eeff;color:#1e56c8}.mt-tag.d{background:#fff1d6;color:#a8690a}.mt-slg li{padding:6px 0;border-bottom:1px solid #eef1f8;font-size:13px;list-style:none}.mt-slg{padding:0;margin:8px 0}.mt-slg .bad{color:#e5484d}',
'@media (prefers-reduced-motion:reduce){.mt-steps li,.mt-bar i,.mt-dot,.mt-pulse,.mt-res,.mt-grid i.s,.mt-cf{animation:none!important}}'
].join('');
document.head.appendChild(css);

var G = { jt: 0, lt: 0, from: 0, all: [], sd: {}, filter: 'all', q: '', live: null, total: 0, shown: 0 };
function $$(i) { return document.getElementById(i); }
function alive() { return location.hash === '#mtcheck' && $$('mtr'); }
function stopAll() { clearTimeout(G.jt); clearTimeout(G.lt); G.jt = 0; G.lt = 0; }
function msg(t, kind) { var m = $$('mt-msg'); if (!m) return; m.className = 'mt-msg ' + (kind || ''); m.textContent = t || ''; }
var ICON = { wait: '', run: '', ok: '&#10003;', warn: '!', fail: '&#10005;', skip: '&ndash;' };

function view(c) {
  return '<div id="mtr">'
  + '<div class="card" id="mt-cfg"><h3>1. Connect your MikroTik</h3>'
  + '<p class="muted" style="margin-top:6px">BillKora talks to your router through the MikroTik API. MikroTik has no &quot;API key&quot;: the key is an <b>API username and password</b> that you create on the router.</p>'
  + '<div class="mt-row"><label>Router IP address<input id="mt-ip" placeholder="192.168.88.1" value="' + esc(c.ip || '') + '"></label>'
  + '<label>API port<input id="mt-port" placeholder="8728" value="' + esc(c.port || '') + '"></label>'
  + '<label>API username<input id="mt-user" placeholder="billkora" value="' + esc(c.user || '') + '"></label>'
  + '<label>API password<input id="mt-pass" type="password" placeholder="' + (c.hasPass ? 'saved - leave blank to keep' : 'password') + '"></label></div>'
  + '<label class="mt-chk"><input type="checkbox" id="mt-test" checked><span><b>Run the test-user check</b> - creates ONE temporary user (named bk-test-xxxxxx), changes its package, disconnects and reconnects it, then deletes it. Your real customers are never changed. Untick for a 100% read-only check.</span></label>'
  + '<label class="mt-chk"><input type="checkbox" id="mt-ssl"' + (c.ssl ? ' checked' : '') + '><span>Use API-SSL (port 8729)</span></label>'
  + '<details class="mt-help"><summary><b>How do I create the API user?</b></summary>On the MikroTik open <b>New Terminal</b> (Winbox) and paste these two lines (change the password):<code>/user group add name=billkora policy=read,write,api\n/user add name=billkora group=billkora password=CHANGE-ME</code>Then make sure <b>IP &gt; Services &gt; api</b> is enabled (port 8728). For read-only checking use <code>policy=read,api</code> and untick the test-user box.</details>'
  + '<div class="bar2"><button class="btn" id="mt-go">Save &amp; start check</button><button class="btn o2" id="mt-tc">Test connection</button></div><div class="mt-msg" id="mt-msg"></div></div>'
  + '<div class="card mt-hide" id="mt-run" style="margin-top:16px"><h3>2. Checking <span class="muted" id="mt-pct"></span></h3><div class="mt-bar" id="mt-bar"><i></i></div>'
  + '<ul class="mt-steps" id="mt-steps"></ul>'
  + '<h3 style="margin-top:18px">Customers <span class="muted" id="mt-cnt"></span></h3><div class="mt-grid" id="mt-grid"></div>'
  + '<div class="mt-leg"><span style="--c:#22b45a">Online</span><span style="--c:#f5a623">Offline</span><span style="--c:#8b93a8">Disabled on router</span><span style="--c:#e5484d">Not on router</span><span style="--c:#dfe6f6">Waiting</span></div>'
  + '<div class="mt-log" id="mt-log"></div>'
  + '<div class="bar2" style="margin-top:12px"><button class="btn o2 mt-hide" id="mt-stop">Stop</button></div></div>'
  + '<div id="mt-res"></div>'
  + '<div class="card" id="mt-live" style="margin-top:16px"><h3><span class="mt-dot off" id="mt-ld"></span>3. Live customer status <span class="muted" id="mt-lt"></span></h3>'
  + '<p class="muted" id="mt-ln" style="margin:6px 0">Starts automatically after you save your router details. Updates every few seconds, read only.</p>'
  + '<div class="mt-chips" id="mt-chips"></div><div class="bar2"><input id="mt-q" placeholder="Search name or username..." style="max-width:320px"></div><div id="mt-tbl"></div></div>'
  + '<div class="card" id="mt-sync" style="margin-top:16px"><h3>4. Sync customer changes to MikroTik</h3>'
  + '<p class="muted" style="margin:6px 0 10px;line-height:1.6">When you disconnect, reconnect, change the package or change the <b>username</b> of a customer in BillKora, the same change is made on your router for <b>that one customer only</b>. Customers are matched by exact username. BillKora never deletes anything on your router, and it refuses to change a user if someone changed it on the router meanwhile. Only customers found by the check are synced. Changing the customer display name does not touch the router.</p>'
  + '<label style="font-size:13px;color:#6b7a99">Sync mode <select id="mt-mode" style="margin-left:8px"><option value="auto">Automatic for small changes (up to 3 customers)</option><option value="ask">Ask me first (I click Apply)</option><option value="off">Off (never change the router)</option></select></label>'
  + '<div id="mt-pend"></div><div id="mt-unm"></div><h4 style="margin:16px 0 4px">Recent sync log</h4><ul class="mt-slg" id="mt-slog"></ul></div></div>';
}

function cfgBody() {
  return { ip: $$('mt-ip').value.trim(), port: $$('mt-port').value.trim(), user: $$('mt-user').value.trim(), pass: $$('mt-pass').value, ssl: $$('mt-ssl').checked };
}

function wire(c, auto) {
  $$('mt-ssl').onchange = function () { var p = $$('mt-port'); if (!p.value || p.value === '8728' || p.value === '8729') p.value = this.checked ? '8729' : '8728'; };
  $$('mt-tc').onclick = function () {
    msg('Testing connection...');
    api('admin/mt/test', 'POST', cfgBody()).then(function (r) { msg(r.msg, r.ok ? 'ok' : 'er'); }).catch(function (e) { if (e.message !== 'auth') msg(e.message, 'er'); });
  };
  $$('mt-go').onclick = function () { startRun(); };
  $$('mt-stop').onclick = function () { api('admin/mt/stop', 'POST', {}); this.disabled = true; };
  $$('mt-q').oninput = function () { G.q = this.value.toLowerCase(); drawLive(); };
  $$('mt-mode').onchange = function () { api('admin/mt/sync/mode', 'POST', { mode: this.value }).then(function () { toast('Sync mode saved'); loadSync(); }).catch(function (e) { if (e.message !== 'auth') toast(e.message, 1); }); };
  if (auto) {
    if (c.configured) { msg('Import finished. Starting the MikroTik check with your saved router details...', 'ok'); setTimeout(function () { if (alive()) startRun(true); }, 600); }
    else { var cf = $$('mt-cfg'); cf.classList.add('mt-pulse'); msg('Customers are imported. Enter your MikroTik IP and API login to start checking them.', 'ok'); $$('mt-ip').focus(); cf.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }
}

function resetRun() {
  G.from = 0; G.all = []; G.sd = {}; G.total = 0; G.shown = 0;
  $$('mt-steps').innerHTML = ''; $$('mt-grid').innerHTML = ''; $$('mt-log').textContent = ''; $$('mt-res').innerHTML = '';
  $$('mt-bar').className = 'mt-bar'; $$('mt-bar').firstChild.style.width = '0%'; $$('mt-pct').textContent = ''; $$('mt-cnt').textContent = '';
}

function startRun(saved) {
  var b = cfgBody(), test = $$('mt-test').checked, go = $$('mt-go');
  if (saved && !b.ip) b = null;
  go.disabled = true;
  var p = b && b.ip ? api('admin/mt/config', 'POST', b) : Promise.resolve();
  p.then(function () { return api('admin/mt/start', 'POST', { test: test }); })
    .then(function () { msg(''); $$('mt-cfg').classList.remove('mt-pulse'); $$('mt-run').classList.remove('mt-hide'); resetRun(); $$('mt-stop').classList.remove('mt-hide'); $$('mt-stop').disabled = false; $$('mt-run').scrollIntoView({ behavior: 'smooth', block: 'start' }); pollJob(); })
    .catch(function (e) { if (e.message !== 'auth') msg(e.message, 'er'); })
    .then(function () { if ($$('mt-go')) $$('mt-go').disabled = false; });
}

function pollJob() {
  clearTimeout(G.jt);
  if (!alive()) return;
  api('admin/mt/job', 'POST', { from: G.from }).then(function (j) {
    if (!alive() || j.none) return;
    paint(j);
    if (j.state === 'running') G.jt = setTimeout(pollJob, 700);
    else { finish(j); loadLive(); }
  }).catch(function (e) { if (e.message !== 'auth') G.jt = setTimeout(pollJob, 2000); });
}

function paint(j) {
  var ul = $$('mt-steps'), done = 0, custFrac = 0;
  j.steps.forEach(function (s, i) {
    var li = $$('mts-' + s.id);
    if (!li) { li = document.createElement('li'); li.id = 'mts-' + s.id; li.style.animationDelay = (i * 0.05) + 's'; li.innerHTML = '<span class="mt-ic"></span><div><b></b><small></small></div>'; li.querySelector('b').textContent = s.title; ul.appendChild(li); }
    var key = s.state + '|' + s.detail;
    if (G.sd[s.id] !== key) { G.sd[s.id] = key; li.className = s.state; li.querySelector('.mt-ic').innerHTML = ICON[s.state] || ''; li.querySelector('small').textContent = s.detail || (s.state === 'run' ? 'Working...' : ''); }
    if (s.state !== 'wait' && s.state !== 'run') done++;
  });
  if (j.total && G.shown !== j.total) {
    var h = ''; for (var k = 0; k < j.total; k++) h += '<i id="d' + k + '"></i>';
    $$('mt-grid').innerHTML = h; G.shown = j.total;
  }
  j.items.forEach(function (it, k) {
    var n = G.from + k, d = $$('d' + n); G.all[n] = it;
    if (d) { d.className = 's ' + it.s + (it.m ? ' m' : ''); d.title = it.n + ' (' + it.u + ') - ' + it.s + (it.m ? ' - different profile on router' : ''); }
  });
  G.from += j.items.length;
  var c = j.counts;
  if (j.total) { custFrac = G.from / j.total; $$('mt-cnt').textContent = G.from + ' / ' + j.total + ' - ' + c.online + ' online, ' + c.offline + ' offline, ' + c.disabled + ' disabled, ' + c.missing + ' not on router'; }
  var cs = j.steps.filter(function (s) { return s.id === 'cust'; })[0];
  if (cs && cs.state === 'run') done += custFrac;
  var pct = j.state === 'running' ? Math.min(99, Math.round(done / j.steps.length * 100)) : 100;
  $$('mt-bar').firstChild.style.width = pct + '%'; $$('mt-pct').textContent = pct + '%';
  var lg = $$('mt-log'), t = j.log.join('\n'); if (lg.textContent !== t) { lg.textContent = t; lg.scrollTop = lg.scrollHeight; }
}

function finish(j) {
  $$('mt-bar').className = 'mt-bar done'; $$('mt-stop').classList.add('mt-hide');
  var v = j.verdict || { ok: false, title: 'Finished', lines: [] }, h;
  if (v.ok) {
    var cf = ''; for (var i = 0; i < 28; i++) cf += '<span class="mt-cf" style="left:' + Math.round(Math.random() * 100) + '%;background:' + ['#1e6bff', '#22b45a', '#f5a623', '#e5484d', '#7a5cff'][i % 5] + ';animation-delay:' + (Math.random() * 0.9).toFixed(2) + 's"></span>';
    h = '<div class="mt-res good">' + cf + '<svg class="mt-ok" viewBox="0 0 52 52"><circle class="c" cx="26" cy="26" r="24" fill="none" stroke="#22b45a" stroke-width="3"/><path class="k" fill="none" stroke="#22b45a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" d="M14 27l8 8 16-17"/></svg><h2>' + esc(v.title) + '</h2>' + v.lines.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') + '<p style="margin-top:10px"><b>Live customer status is now running below.</b></p></div>';
  } else {
    var prob = G.all.filter(function (x) { return x && (x.s === 'missing' || x.m); }).slice(0, 60);
    h = '<div class="mt-res ' + (j.state === 'done' ? 'warnb' : 'badb') + '"><h2>' + esc(v.title) + '</h2>' + v.lines.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') + '<p style="margin-top:8px">Nothing on your router was changed except the temporary test user, which is removed.</p></div>';
    if (prob.length) h += '<div class="card" style="margin-top:16px"><h3>Customers to review</h3>' + tbl(['Customer', 'Username', 'Problem'], prob.map(function (x) { return [esc(x.n), esc(x.u), x.s === 'missing' ? 'Not found on the router (PPPoE secret missing)' : 'Uses a different profile on the router than the BillKora package']; })) + '</div>';
  }
  h += '<div class="bar2" style="margin-top:14px"><button class="btn o2" id="mt-again">Run the check again</button></div>';
  $$('mt-res').innerHTML = h;
  $$('mt-again').onclick = function () { startRun(); };
}

/* ---------- live status ---------- */
function loadLive() {
  clearTimeout(G.lt);
  if (!alive()) return;
  loadSync();
  api('admin/mt/live').then(function (l) { if (!alive()) return; G.live = l; drawLive(); G.lt = setTimeout(loadLive, 5000); }).catch(function (e) { if (e.message !== 'auth') G.lt = setTimeout(loadLive, 8000); });
}
function drawLive() {
  var l = G.live; if (!l || !$$('mt-tbl')) return;
  var d = $$('mt-ld'); d.className = 'mt-dot' + (l.ok ? '' : ' off');
  $$('mt-lt').textContent = l.ts ? 'updated ' + new Date(l.ts).toLocaleTimeString() : '';
  $$('mt-ln').textContent = !l.configured ? 'Save your router details above to start live checking.' : l.ok ? 'Checking your router every 10 seconds. Read only, nothing is changed.' : (l.err ? 'Router not reachable: ' + l.err : 'Connecting to your router...');
  var c = l.counts, tabs = [['all', 'All', l.items.length], ['online', 'Online', c.online], ['offline', 'Offline', c.offline], ['disabled', 'Disabled', c.disabled], ['missing', 'Not on router', c.missing]];
  $$('mt-chips').innerHTML = tabs.map(function (t) { return '<div class="mt-chip' + (G.filter === t[0] ? ' on' : '') + '" data-f="' + t[0] + '">' + t[1] + '<b>' + t[2] + '</b></div>'; }).join('');
  Array.prototype.forEach.call($$('mt-chips').children, function (e) { e.onclick = function () { G.filter = e.getAttribute('data-f'); drawLive(); }; });
  var rows = l.items.filter(function (x) { return (G.filter === 'all' || x.s === G.filter) && (!G.q || (x.n + ' ' + x.u).toLowerCase().indexOf(G.q) > -1); });
  var lab = { online: 'Online', offline: 'Offline', disabled: 'Disabled', missing: 'Not on router', unknown: 'Waiting' };
  $$('mt-tbl').innerHTML = tbl(['Customer', 'Username', 'Status', 'IP address', 'Online for'], rows.slice(0, 150).map(function (x) { return [esc(x.n), esc(x.u), '<span class="mt-st ' + x.s + '">' + lab[x.s] + '</span>', esc(x.a || '-'), esc(x.up || '-')]; }))
    + (rows.length > 150 ? '<p class="muted">Showing the first 150 of ' + rows.length + '. Use the search box.</p>' : '');
}


/* ---------- sync card ---------- */
function loadSync() {
  api('admin/mt/sync').then(function (s) { if (alive()) drawSync(s); }).catch(function () {});
}
function drawSync(s) {
  var m = $$('mt-mode'); if (m && document.activeElement !== m) m.value = s.mode;
  var pend = s.pending, h = '';
  if (!s.baseline) h = '<p class="muted">Run the check above first. BillKora only syncs customers it found on your router.</p>';
  else if (!pend.length) h = '<p style="margin:12px 0"><span class="mt-dot"></span>Everything is in sync (' + s.baseline + ' customers linked).</p>';
  else {
    if (s.waiting) h += '<p class="mt-msg er">More than 3 customers changed at once, so nothing was sent automatically. Review and press Apply.</p>';
    h += '<h4 style="margin:14px 0 6px">Waiting for your OK (' + pend.length + ')</h4>' + tbl(['', 'Customer', 'Username', 'Change on router', 'Why'], pend.slice(0, 100).map(function (p) {
      return ['<input type="checkbox" class="mt-pc" value="' + esc(p.cid) + '">', esc(p.n), esc(p.u), p.fields.map(function (f) { return '<span class="mt-tag ' + (f.user ? 'u' : 'd') + '">' + esc(f.text) + '</span>'; }).join(''), p.gone ? 'Customer deleted in BillKora - the router user will only be disabled' : (p.user ? 'You changed it in BillKora' : 'Router differs from BillKora')];
    })) + '<div class="bar2" style="margin-top:10px"><button class="btn" id="mt-ap1">Apply selected</button><button class="btn o2" id="mt-apall">Apply all ' + pend.length + '</button></div><div class="mt-msg" id="mt-smsg"></div>';
  }
  $$('mt-pend').innerHTML = h;
  if ($$('mt-ap1')) {
    $$('mt-ap1').onclick = function () { var ids = Array.prototype.map.call(document.querySelectorAll('.mt-pc:checked'), function (c) { return c.value; }); if (!ids.length) { toast('Tick at least one customer', 1); return; } doApply({ ids: ids }); };
    $$('mt-apall').onclick = function () { if (confirm('Send all ' + pend.length + ' changes to the router now?')) doApply({ all: true }); };
  }
  var um = s.unmanaged.filter(function (u) { return !u.onRouter; }), onr = s.unmanaged.filter(function (u) { return u.onRouter; }).length;
  var u = '';
  if (s.baseline && (um.length || onr)) {
    u = '<h4 style="margin:16px 0 6px">Customers not on the router yet (' + um.length + ')</h4>';
    if (onr) u += '<p class="muted">' + onr + ' more are on the router but not linked yet. Run the check again to link them.</p>';
    if (um.length) u += tbl(['Customer', 'Username', ''], um.slice(0, 50).map(function (x) { return [esc(x.n), esc(x.u), '<button class="btn sm o2" data-c="' + esc(x.id) + '" data-u="' + esc(x.u) + '">Create on router</button>']; }));
  }
  $$('mt-unm').innerHTML = u;
  Array.prototype.forEach.call($$('mt-unm').querySelectorAll('button[data-c]'), function (b) {
    b.onclick = function () {
      var pw = prompt('PPPoE password for ' + b.getAttribute('data-u') + ' (the customer enters this in their router/ONU):'); if (!pw) return;
      b.disabled = true;
      api('admin/mt/sync/create', 'POST', { customerId: b.getAttribute('data-c'), password: pw }).then(function () { toast('Created on the router'); loadSync(); }).catch(function (e) { if (e.message !== 'auth') toast(e.message, 1); b.disabled = false; });
    };
  });
  $$('mt-slog').innerHTML = s.log.length ? s.log.slice(0, 15).map(function (l) { return '<li class="' + (l.ok ? '' : 'bad') + '"><b>' + esc(l.u) + '</b> - ' + esc(l.what) + (l.ok ? ' <span class="muted">(done ' + new Date(l.t).toLocaleTimeString() + ')</span>' : ' - NOT done: ' + esc(l.err)) + '</li>'; }).join('') : '<li class="muted">Nothing synced yet.</li>';
}
function doApply(body) {
  var b1 = $$('mt-ap1'), b2 = $$('mt-apall'); if (b1) { b1.disabled = true; b2.disabled = true; }
  api('admin/mt/sync/apply', 'POST', body).then(function (r) {
    var ok = r.results.filter(function (x) { return x.ok; }).length, bad = r.results.filter(function (x) { return !x.ok; });
    toast(ok + ' changed on the router' + (bad.length ? ', ' + bad.length + ' not done (see log)' : ''), bad.length ? 1 : 0); loadSync();
  }).catch(function (e) { if (e.message !== 'auth') toast(e.message, 1); loadSync(); });
}

/* toast after you edit a customer anywhere in BillKora */
var oapi = window.api, lastLog = '', primed = false;
window.api = function (u, m) {
  var p = oapi.apply(this, arguments);
  if (m && m !== 'GET' && /^admin\/(customers|invoices|payments|requests)/.test(u)) { setTimeout(syncToast, 2600); setTimeout(syncToast, 7000); }
  return p;
};
function syncToast() {
  oapi('admin/mt/sync').then(function (s) {
    if (!s.configured || !s.baseline) return;
    var top = s.log[0] ? s.log[0].t : '';
    if (primed && top && top !== lastLog) { var l = s.log[0]; toast(l.ok ? 'MikroTik synced: ' + l.u + ' - ' + l.what : 'MikroTik NOT changed for ' + l.u + ': ' + l.err, !l.ok); }
    lastLog = top; primed = true;
    if (s.mode !== 'off' && s.pending.length && (s.mode === 'ask' || s.waiting)) toast(s.pending.length + ' change(s) waiting for your OK on the MikroTik Check page', 0);
  }).catch(function () {});
}
oapi('admin/mt/sync').then(function (s) { if (s.log[0]) lastLog = s.log[0].t; primed = true; }).catch(function () {});

/* ---------- entry points ---------- */
V.mtcheck = function () {
  stopAll();
  var auto = !!window.__mtAuto; window.__mtAuto = false;
  return api('admin/mt/config').then(function (c) {
    P('MikroTik Check & Live Status', view(c)); wire(c, auto);
    G.filter = 'all'; G.q = '';
    loadLive();
    if (auto && c.configured) return;
    return api('admin/mt/job', 'POST', { from: 0 }).then(function (j) {
      if (!j || j.none || !alive()) return;
      $$('mt-run').classList.remove('mt-hide'); resetRun(); $$('mt-test').checked = !!j.test;
      if (j.state === 'running') $$('mt-stop').classList.remove('mt-hide');
      pollJob();
    });
  });
};
window.mtGo = function () { window.__mtAuto = true; if (location.hash === '#mtcheck') go(); else location.hash = '#mtcheck'; };
window.mtPrompt = function (t) {
  return '<div class="card mt-pulse" style="margin-top:16px;border:2px solid #1e6bff"><h3>Next step: connect your MikroTik</h3>'
    + '<p class="muted" style="line-height:1.6;margin:6px 0 12px">' + (t.added + t.updated) + ' customers are in BillKora. Now BillKora can check them on your router: it asks for your MikroTik IP and API login, creates one temporary test user, changes its package, disconnects and reconnects it, then checks every imported customer. Nothing on your running router is changed.</p>'
    + '<div class="bar2"><button class="btn" onclick="mtGo()">Connect MikroTik &amp; start check</button></div></div>';
};
})();
