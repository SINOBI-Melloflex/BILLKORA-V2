const net=require('net');
function enc(n){
 if(n<0x80)return Buffer.from([n]);
 if(n<0x4000)return Buffer.from([(n>>8)|0x80,n&255]);
 if(n<0x200000)return Buffer.from([(n>>16)|0xC0,(n>>8)&255,n&255]);
 if(n<0x10000000)return Buffer.from([(n>>24)|0xE0,(n>>16)&255,(n>>8)&255,n&255]);
 return Buffer.from([0xF0,(n>>24)&255,(n>>16)&255,(n>>8)&255,n&255]);
}
function sent(words){const a=[];words.forEach(w=>{const b=Buffer.from(String(w),'utf8');a.push(enc(b.length),b)});a.push(Buffer.from([0]));return Buffer.concat(a)}
function run(o,cmds){
 return new Promise((resolve,reject)=>{
  const sock=new net.Socket(),all=[['/login','=name='+(o.user||''),'=password='+(o.pass||'')]].concat(cmds);
  let buf=Buffer.alloc(0),words=[],idx=-1,cur=[],trap=null,dead=false;const results=[];
  const fail=e=>{if(dead)return;dead=true;try{sock.destroy()}catch(x){}reject(e instanceof Error?e:new Error(String(e)))};
  const fin=()=>{if(dead)return;dead=true;try{sock.destroy()}catch(x){}resolve(results)};
  const next=()=>{idx++;if(idx>=all.length)return fin();cur=[];trap=null;sock.write(sent(all[idx]))};
  const attrs=w=>{const r={};w.slice(1).forEach(x=>{if(x[0]==='='){const i=x.indexOf('=',1);if(i>0)r[x.slice(1,i)]=x.slice(i+1)}});return r};
  const onS=w=>{
   const t=w[0];
   if(t==='!re'){cur.push(attrs(w))}
   else if(t==='!trap'){trap=attrs(w).message||'RouterOS error'}
   else if(t==='!fatal'){fail(new Error(w[1]||'RouterOS closed the connection'))}
   else if(t==='!done'){
    if(trap){fail(new Error(idx===0?'Login failed: '+trap:trap));return}
    if(idx===0&&attrs(w).ret){fail(new Error('This RouterOS is too old for API login (need 6.43 or newer)'));return}
    if(idx>0)results.push(cur);
    next();
   }
  };
  const parse=()=>{
   for(;;){
    if(!buf.length)return;
    const c=buf[0];let len,hl;
    if(c<0x80){len=c;hl=1}
    else if(c<0xC0){if(buf.length<2)return;len=((c&0x3F)<<8)|buf[1];hl=2}
    else if(c<0xE0){if(buf.length<3)return;len=((c&0x1F)<<16)|(buf[1]<<8)|buf[2];hl=3}
    else if(c<0xF0){if(buf.length<4)return;len=((c&0x0F)<<24)|(buf[1]<<16)|(buf[2]<<8)|buf[3];hl=4}
    else{if(buf.length<5)return;len=buf.readUInt32BE(1);hl=5}
    if(buf.length<hl+len)return;
    const w=buf.slice(hl,hl+len).toString('utf8');buf=buf.slice(hl+len);
    if(len===0){const s=words;words=[];if(s.length)onS(s)}else words.push(w);
   }
  };
  sock.setTimeout(o.timeout||7000);
  sock.on('timeout',()=>fail(new Error('Router did not answer (timeout)')));
  sock.on('error',e=>fail(new Error('Cannot connect: '+(e.code||e.message))));
  sock.on('close',()=>fail(new Error('Connection closed by router')));
  sock.on('data',d=>{try{buf=Buffer.concat([buf,d]);parse()}catch(e){fail(e)}});
  sock.connect(Number(o.port)||8728,o.host,()=>next());
 });
}
const dev=db=>(db.netdevices||[]).find(d=>d.kind==='MikroTik'&&(d.method||'api')==='api'&&d.ip&&d.user);
const call=(d,c)=>run({host:d.ip,port:d.port,user:d.user,pass:d.pass,timeout:7000},c);
async function live(d){
 const r=await run({host:d.ip,port:d.port,user:d.user,pass:d.pass,timeout:4000},[['/ppp/active/print'],['/ppp/secret/print']]);const online={},secrets={};
 r[0].forEach(a=>{online[a.name]={ip:a.address||'',mac:a['caller-id']||'',uptime:a.uptime||'',service:a.service||'',encoding:a.encoding||''}});
 r[1].forEach(s=>{secrets[s.name]={profile:s.profile||'',disabled:s.disabled==='true',comment:s.comment||'',service:s.service||'',lastOut:s['last-logged-out']||'',lastReason:s['last-disconnect-reason']||''}});
 return{online,secrets};
}
async function catalog(d){
 const r=await call(d,[['/ip/pool/print'],['/ppp/profile/print']]);
 return{pools:r[0].map(p=>({name:p.name,ranges:p.ranges||''})),profiles:r[1].map(p=>({name:p.name,pool:p['remote-address']||'',local:p['local-address']||'',rate:p['rate-limit']||''}))};
}
async function users(d){
 const r=await call(d,[['/ppp/secret/print'],['/ppp/active/print']]);const active={};r[1].forEach(a=>{active[a.name]=a});
 return{secrets:r[0],active};
}
async function disable(d,name){
 const r=await call(d,[['/ppp/secret/print','?name='+name],['/ppp/active/print','?name='+name]]);
 if(!r[0].length)throw new Error('User "'+name+'" is not on the router yet (press Push to Router first)');
 const c=[['/ppp/secret/set','=.id='+r[0][0]['.id'],'=disabled=yes']];
 r[1].forEach(a=>c.push(['/ppp/active/remove','=.id='+a['.id']]));
 await call(d,c);return r[1].length;
}
async function enable(d,name){
 const r=await call(d,[['/ppp/secret/print','?name='+name]]);
 if(!r[0].length)throw new Error('User "'+name+'" is not on the router yet (press Push to Router first)');
 await call(d,[['/ppp/secret/set','=.id='+r[0][0]['.id'],'=disabled=no']]);return true;
}
async function push(d,u){
 const r=await call(d,[['/ppp/secret/print','?name='+u.name]]);
 const f=['=password='+u.pass];if(u.profile)f.push('=profile='+u.profile);if(u.pool)f.push('=remote-address='+u.pool);f.push('=disabled='+(u.disabled?'yes':'no'));
 if(r[0].length){await call(d,[['/ppp/secret/set','=.id='+r[0][0]['.id']].concat(f)]);return 'updated'}
 await call(d,[['/ppp/secret/add','=name='+u.name,'=service=pppoe'].concat(f).concat(u.comment?['=comment='+u.comment]:[])]);return 'created';
}
module.exports={run,dev,live,catalog,users,disable,enable,push};