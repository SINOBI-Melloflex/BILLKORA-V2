const net=require('net'),mt=require('./mt.js');
const O=d=>({host:d.ip,port:Number(d.port)||8728,user:d.user,pass:d.pass,timeout:7000});
const isApi=d=>d.kind==='MikroTik'&&(d.method||'api')==='api';
function tcp(host,port){return new Promise(res=>{let done=false;const s=new net.Socket();const end=(ok,msg)=>{if(done)return;done=true;try{s.destroy()}catch(e){}res({ok:ok,msg:msg})};s.setTimeout(4000);s.once('connect',()=>end(true,'Port '+port+' is open on '+host));s.once('timeout',()=>end(false,'No answer from '+host+':'+port+' (timeout)'));s.once('error',e=>end(false,'Cannot connect: '+(e.code||e.message)));s.connect(port,host)})}
async function testDev(d,save,now){
 let r;
 if(isApi(d)){
  try{const x=await mt.run(O(d),[['/system/identity/print'],['/system/resource/print']]);const id=(x[0][0]||{}).name||'',rs=x[1][0]||{};r={ok:true,msg:'Connected and logged in. Router: '+id+', RouterOS '+(rs.version||'?')+(rs['board-name']?' ('+rs['board-name']+')':'')}}
  catch(e){r={ok:false,msg:e.message}}
 }else if(d.method==='snmp'){r={ok:false,skip:true,msg:'SNMP uses UDP, so a connection test is not possible here. Saved for later use.'}}
 else{r=await tcp(d.ip,Number(d.port)||({ssh:22,telnet:23}[d.method]||80))}
 if(!r.skip)d.status=r.ok?'online':'offline';
 d.checked=now();save();return r;
}
async function testUser(d,profiles){
 const res=[],o=O(d),nm='bk-test-'+Math.random().toString(36).slice(2,7);
 for(const pf of profiles){
  let made=false,err='';
  try{
   await mt.run(o,[['/ppp/secret/add','=name='+nm,'=password='+nm,'=service=pppoe','=profile='+pf,'=disabled=yes','=comment=BillKora test (auto deleted)']]);made=true;
   const r=await mt.run(o,[['/ppp/secret/print','?name='+nm]]);
   if(!r[0].length)throw new Error('created but not found');
  }catch(e){err=e.message}
  try{const r=await mt.run(o,[['/ppp/secret/print','?name='+nm]]);if(r[0].length)await mt.run(o,[['/ppp/secret/remove','=.id='+r[0][0]['.id']]])}catch(e){err=err||('cleanup: '+e.message)}
  res.push({profile:pf,ok:made&&!err,err:err});
 }
 return res;
}
module.exports=function(col,id,act,M,b,ok,bad,db,save,uid,now,str){
 const dv=()=>(db.netdevices||[]).find(x=>x.id===id);
 if(col==='mwtest'&&M==='POST'){const d=dv();if(!d){bad('Device not found',404);return true}testDev(d,save,now).then(ok).catch(e=>bad(e.message,500));return true}
 if(col==='mwusers'&&M==='GET'){
  const d=mt.dev(db);if(!d){ok({ok:false,msg:'No MikroTik (API) router added'});return true}
  mt.users(d).then(u=>ok({ok:true,names:u.secrets.map(s=>s.name)})).catch(e=>ok({ok:false,msg:'Router: '+e.message}));return true;
 }
 if(col==='mwuser'&&M==='POST'){
  const d=dv();if(!d){bad('Device not found',404);return true}
  const pf=(Array.isArray(b.profiles)?b.profiles:[]).map(x=>String(x).slice(0,80)).filter(Boolean).slice(0,30);
  testUser(d,pf).then(r=>ok({ok:true,results:r})).catch(e=>ok({ok:false,msg:e.message}));return true;
 }
 if(col==='mwsummary'&&M==='GET'){
  (async()=>{
   const out=[];
   for(const d of (db.netdevices||[])){
    const o={name:d.name,kind:d.kind,method:d.method,ip:d.ip,connected:false};
    if(isApi(d)){
     try{const x=await mt.run(O(d),[['/system/identity/print'],['/ppp/secret/print'],['/ppp/active/print']]);o.connected=true;o.identity=(x[0][0]||{}).name||'';o.secrets=x[1].length;o.online=x[2].length;d.status='online'}
     catch(e){o.err=e.message;d.status='offline'}
    }else{o.connected=d.status==='online'}
    out.push(o);
   }
   save();
   const by={};db.customers.forEach(c=>{const p=db.packages.find(x=>x.id===c.packageId);const n=p?p.name:'-';by[n]=(by[n]||0)+1});
   return{devices:out,customers:db.customers.length,withPpp:db.customers.filter(c=>c.pppUser).length,byPackage:by};
  })().then(ok).catch(e=>bad(e.message,500));return true;
 }
 return false;
};