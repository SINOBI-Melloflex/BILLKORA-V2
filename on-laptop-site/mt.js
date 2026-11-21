'use strict';
/* BillKora mt.js - small MikroTik RouterOS API client (no packages needed).
   Talks the plain API on port 8728 (or API-SSL on 8729). One command at a time. */
const net = require('net'), tls = require('tls'), crypto = require('crypto');

function encLen(n) {
  if (n < 0x80) return Buffer.from([n]);
  if (n < 0x4000) { n |= 0x8000; return Buffer.from([(n >> 8) & 255, n & 255]); }
  if (n < 0x200000) { n |= 0xC00000; return Buffer.from([(n >> 16) & 255, (n >> 8) & 255, n & 255]); }
  if (n < 0x10000000) { n |= 0xE0000000; return Buffer.from([(n >>> 24) & 255, (n >> 16) & 255, (n >> 8) & 255, n & 255]); }
  return Buffer.from([0xF0, (n >>> 24) & 255, (n >> 16) & 255, (n >> 8) & 255, n & 255]);
}
function decLen(b, o) {
  if (o >= b.length) return null;
  const c = b[o];
  if (c < 0x80) return { len: c, size: 1 };
  if (c < 0xC0) { if (o + 2 > b.length) return null; return { len: ((c & 0x3F) << 8) | b[o + 1], size: 2 }; }
  if (c < 0xE0) { if (o + 3 > b.length) return null; return { len: ((c & 0x1F) << 16) | (b[o + 1] << 8) | b[o + 2], size: 3 }; }
  if (c < 0xF0) { if (o + 4 > b.length) return null; return { len: (c & 0x0F) * 0x1000000 + (b[o + 1] << 16) + (b[o + 2] << 8) + b[o + 3], size: 4 }; }
  if (o + 5 > b.length) return null;
  return { len: b.readUInt32BE(o + 1), size: 5 };
}

function friendly(e, o) {
  const code = e && e.code, m = (e && e.message) || String(e);
  if (code === 'ECONNREFUSED') return 'Connection refused on port ' + o.port + '. On the MikroTik enable IP > Services > ' + (o.ssl ? 'api-ssl' : 'api') + '.';
  if (code === 'EHOSTUNREACH' || code === 'ENETUNREACH') return 'Cannot reach ' + o.host + ' from this PC. Check the IP address and your network.';
  if (code === 'ETIMEDOUT') return 'No answer from ' + o.host + ':' + o.port + ' (timeout). Check the IP and any firewall.';
  if (code === 'ENOTFOUND') return 'Host name ' + o.host + ' was not found.';
  if (code === 'ECONNRESET') return 'The router closed the connection. Check that this PC is allowed in the API user "Allowed Address" and IP > Services > api "Available From".';
  return m;
}

class RouterOS {
  constructor(o) {
    this.o = Object.assign({ port: 8728, timeout: 8000, ssl: false }, o);
    this.buf = Buffer.alloc(0); this.q = []; this.cur = null; this.sock = null; this.closed = true;
  }
  connect() {
    const o = this.o;
    return new Promise((res, rej) => {
      let done = false;
      const fin = e => { if (done) return; done = true; clearTimeout(t); e ? rej(e) : res(); };
      const t = setTimeout(() => {
        try { sock.destroy(); } catch (e) {}
        fin(new Error('No answer from ' + o.host + ':' + o.port + ' (timeout). Check the IP, that the API service is enabled and that no firewall blocks it.'));
      }, o.timeout);
      const sock = o.ssl
        ? tls.connect({ host: o.host, port: o.port, rejectUnauthorized: false, ciphers: 'ALL:@SECLEVEL=0' })
        : net.connect({ host: o.host, port: o.port });
      this.sock = sock;
      sock.setNoDelay(true);
      sock.on(o.ssl ? 'secureConnect' : 'connect', () => { this.closed = false; fin(); });
      sock.on('data', d => { this.buf = Buffer.concat([this.buf, d]); this._pump(); });
      sock.on('error', e => { const err = new Error(friendly(e, o)); if (!done) fin(err); else this._fail(err); });
      sock.on('close', () => { this.closed = true; this._fail(new Error('Router closed the connection')); });
    });
  }
  _sentence() {
    let o = 0; const words = [];
    for (;;) {
      const l = decLen(this.buf, o);
      if (!l) return null;
      o += l.size;
      if (l.len === 0) { this.buf = this.buf.slice(o); return words; }
      if (o + l.len > this.buf.length) return null;
      words.push(this.buf.toString('utf8', o, o + l.len));
      o += l.len;
    }
  }
  _pump() { let w; while ((w = this._sentence())) { if (w.length) this._on(w); } }
  _on(w) {
    const c = this.cur; if (!c) return;
    const t = w[0], a = {};
    for (let i = 1; i < w.length; i++) {
      const s = w[i];
      if (s[0] === '=') { const k = s.indexOf('=', 1); if (k > 0) a[s.slice(1, k)] = s.slice(k + 1); else a[s.slice(1)] = ''; }
    }
    if (t === '!re') c.rows.push(a);
    else if (t === '!trap') c.trap = a.message || 'Router error';
    else if (t === '!fatal') this._fail(new Error(w[1] || 'Router closed the session'));
    else if (t === '!done') {
      this.cur = null; clearTimeout(c.t);
      if (c.trap) c.rej(new Error(c.trap)); else { c.rows.done = a; c.res(c.rows); }
      this._next();
    }
  }
  cmd(words) {
    return new Promise((res, rej) => { this.q.push({ words, res, rej, rows: [], trap: null }); this._next(); });
  }
  _next() {
    if (this.cur || !this.q.length) return;
    if (this.closed || !this.sock) { this.q.shift().rej(new Error('Not connected to the router')); return this._next(); }
    const c = this.cur = this.q.shift();
    c.t = setTimeout(() => { this._fail(new Error('The router did not reply in time')); this.close(); }, this.o.timeout);
    const parts = [];
    c.words.forEach(w => { const b = Buffer.from(String(w), 'utf8'); parts.push(encLen(b.length), b); });
    parts.push(Buffer.from([0]));
    this.sock.write(Buffer.concat(parts));
  }
  _fail(e) {
    const c = this.cur; this.cur = null;
    if (c) { clearTimeout(c.t); c.rej(e); }
    while (this.q.length) this.q.shift().rej(e);
  }
  close() { this.closed = true; try { if (this.sock) this.sock.destroy(); } catch (e) {} }
  async login() {
    const u = this.o.user || '', p = this.o.pass || '';
    let r;
    try { r = await this.cmd(['/login', '=name=' + u, '=password=' + p]); }
    catch (e) { throw new Error(/invalid user|cannot log|password/i.test(e.message) ? 'Wrong API username or password.' : e.message); }
    const ret = r.done && r.done.ret;
    if (ret) { /* old RouterOS (before 6.43): challenge response */
      const h = crypto.createHash('md5').update(Buffer.concat([Buffer.from([0]), Buffer.from(p, 'utf8'), Buffer.from(ret, 'hex')])).digest('hex');
      try { await this.cmd(['/login', '=name=' + u, '=response=00' + h]); }
      catch (e) { throw new Error('Wrong API username or password.'); }
    }
  }
  print(path, o) {
    o = o || {};
    const w = [path + '/print'];
    if (o.props) w.push('=.proplist=' + o.props);
    Object.keys(o.q || {}).forEach(k => w.push('?' + k + '=' + o.q[k]));
    return this.cmd(w);
  }
  async count(path, q) {
    const w = [path + '/print', '=count-only='];
    Object.keys(q || {}).forEach(k => w.push('?' + k + '=' + q[k]));
    const r = await this.cmd(w);
    return Number(r.done && r.done.ret) || 0;
  }
  async add(path, props) {
    const w = [path + '/add'];
    Object.keys(props).forEach(k => w.push('=' + k + '=' + props[k]));
    const r = await this.cmd(w);
    return r.done && r.done.ret;
  }
  set(path, id, props) {
    const w = [path + '/set', '=.id=' + id];
    Object.keys(props).forEach(k => w.push('=' + k + '=' + props[k]));
    return this.cmd(w);
  }
  remove(path, id) { return this.cmd([path + '/remove', '=.id=' + id]); }
}

module.exports = RouterOS;
