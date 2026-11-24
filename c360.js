const crypto=require('crypto'),mt=require('./mt.js');
const H=s=>crypto.createHash('sha256').update(String(s)).digest('hex');
const p2=n=>String(n).padStart(2,'0');
const fmt=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
const today=()=>fmt(new Date());
const addDays=(s,n)=>{const d=new Date((s||today())+'T12:00:00');d.setDate(d.getDate()+n);return fmt(d)};
const diff=(a,b)=>Math.round((new Date(a+'T12:00:00')-new Date(b+'T12:00:00'))/864e5);
const pu=c=>String(c.pppUser||c.username||'');
const pkg=(db,c)=>db.packages.find(p=>p.id===c.packageId)||{};
const speed=r=>{const m=/^(\d+(?:\.\d+)?)([kKmMgG]?)/.exec(r||'');if(!m)return 0;const n=parseFloat(m[1]),u=m[2].toLowerCase();return u==='k'?Math.round(n/1000):(u==='g'?n*1000:n)};
let cache={t:0,k:'',v:null};
async function getLive(db,fresh){
 const d=mt.dev(db);
 if(!d)return{ok:false,msg:'No MikroTik router added yet'};
 if(!fresh&&cache.k===d.id&&Date.now()-cache.t<8000)return cache.v;
 try{const l=await mt.live(d);const v={ok:true,online:l.online,secrets:l.secrets,router:d.name||d.ip};cache={t:Date.now(),k:d.id,v};return v}
 catch(e){const v={ok:false,msg:'Router: '+e.message};cache={t:Date.now()+4000,k:d.id,v};return v}
}
async function applyRouter(db,c,on){
 const n=pu(c),d=mt.dev(db);
 if(!n||!d)return{skipped:true};
 try{if(on)await mt.enable(d,n);else await mt.disable(d,n);cache.t=0;return{ok:true}}
 catch(e){return{err:e.message}}
}
const note=r=>r.skipped?' (software only: no router or PPPoE user linked)':' and router updated';
async function action(db,c,act,b,save,now,uid){
 const t=today();
 if(act==='disconnect'){
  const r=await applyRouter(db,c,false);if(r.err)throw new Error('Router error: '+r.err);
  c.status='disconnected';c.discAt=t;delete c.routerPending;save();return 'Disconnected'+note(r);
 }
 if(act==='reconnect'){
  if(c.status==='paused')throw new Error('Customer is paused. Use Resume.');
  if(c.expiry&&t>c.expiry)throw new Error('Plan expired on '+c.expiry+'. Recharge first.');
  const r=await applyRouter(db,c,true);if(r.err)throw new Error('Router error: '+r.err);
  c.status='active';delete c.routerPending;save();return 'Reconnected'+note(r);
 }
 if(act==='pause'){
  if(c.status!=='active'&&c.status!=='suspended')throw new Error('Only active or expired customers can be paused');
  const r=await applyRouter(db,c,false);if(r.err)throw new Error('Router error: '+r.err);
  c.pausedFrom=c.status;c.pausedAt=t;c.status='paused';delete c.routerPending;save();return 'Paused. Billing is stopped until you press Resume'+note(r);
 }
 if(act==='resume'){
  if(c.status!=='paused')throw new Error('Customer is not paused');
  const days=Math.max(0,diff(t,c.pausedAt||t));let ex=c.expiry;
  if(ex&&c.pausedFrom==='active')ex=addDays(ex,days);
  if(ex&&t>ex){c.expiry=ex;c.status='suspended';delete c.pausedAt;delete c.pausedFrom;save();return 'Resumed, but the plan is expired. Recharge to turn it on'}
  const r=await applyRouter(db,c,true);if(r.err)throw new Error('Router error: '+r.err);
  c.expiry=ex;c.status='active';delete c.pausedAt;delete c.pausedFrom;delete c.routerPending;save();
  return 'Resumed. Valid until '+(ex||'no limit')+note(r);
 }
 if(act==='recharge'){
  const m=Math.min(24,Math.max(1,parseInt(b.months,10)||1)),days=m*30;
  const base=c.expiry&&c.expiry>t?c.expiry:t;c.expiry=addDays(base,days);
  const inv=db.invoices.filter(i=>i.customerId===c.id&&i.status==='due').sort((x,y)=>String(x.issued).localeCompare(String(y.issued)))[0];
  if(inv){inv.status='paid';inv.paidOn=now();inv.applied=true;db.payments.push({id:uid('pm'),no:'PAY-'+(db.seq=(db.seq||1000)+1),customerId:c.id,invoiceId:inv.id,amount:inv.amount,method:String(b.method||'Cash').slice(0,30),date:now()})}
  let r=null;
  if(c.status!=='paused'){r=await applyRouter(db,c,true);c.status='active';if(r.err)c.routerPending='enable';else delete c.routerPending}
  save();
  return 'Recharged until '+c.expiry+(r?(r.err?'. Router could not be updated ('+r.err+'), will retry automatically':note(r)):' (customer is paused, press Resume)');
 }
 if(act==='sync'){
  const n=pu(c);if(!n)return 'Saved (no PPPoE username to push)';
  const d=mt.dev(db);if(!d)return 'Saved in software only (no MikroTik router linked yet)';
  if(!c.pppPass)throw new Error('Set a PPPoE password first');
  const p=pkg(db,c);
  const pf=c.rProfile||p.profile||'',pl=c.rPool||'';
  if(pf||pl){const cat=await mt.catalog(d);
   if(pf&&!cat.profiles.some(x=>x.name===pf))throw new Error('Profile "'+pf+'" does not exist on the router. Nothing was changed on the router.');
   if(pl&&!cat.pools.some(x=>x.name===pl))throw new Error('IP pool "'+pl+'" does not exist on the router. Nothing was changed on the router.')}
  const res=await mt.push(d,{name:n,pass:c.pppPass,profile:pf,pool:pl,disabled:c.status!=='active',comment:c.cid+' '+c.name});
  cache.t=0;return 'PPPoE user '+res+' on router'+(pf?' (profile '+pf+(pl?', pool '+pl:'')+')':' (no profile set)');
 }
 throw new Error('Unknown action');
}
async function syncPk(db,d,save,uid){
 const cat=await mt.catalog(d);let added=0,upd=0;
 cat.profiles.forEach(pr=>{
  if(/^default(-encryption)?$/.test(pr.name))return;
  const p=db.packages.find(x=>x.profile===pr.name)||db.packages.find(x=>x.name===pr.name),sp=speed(pr.rate);
  if(p){p.profile=pr.name;p.pool=pr.pool;if(!p.speed&&sp)p.speed=sp;upd++}
  else{db.packages.push({id:uid('p'),name:pr.name,speed:sp,price:0,desc:'Imported from MikroTik',profile:pr.name,pool:pr.pool});added++}
 });
 save();return{added:added,updated:upd,pools:cat.pools.length,profiles:cat.profiles.length};
}
async function syncUsers(db,d,save,uid,now){
 const u=await mt.users(d);let added=0,skipped=0;
 const mx=()=>Math.max(10457,...db.customers.map(c=>parseInt(String(c.cid).slice(3))||0))+1;
 const adm=String(db.settings.admin.user).toLowerCase();
 u.secrets.forEach(s=>{
  if(!s.name)return;
  const low=s.name.toLowerCase();
  if(db.customers.some(c=>pu(c).toLowerCase()===low||String(c.username).toLowerCase()===low)){skipped++;return}
  const cid='BK-'+mx(),pk=db.packages.find(p=>p.profile===s.profile)||db.packages[0],a=u.active[s.name]||{};
  db.customers.push({id:uid('c'),cid:cid,name:String(s.comment||s.name).slice(0,80),phone:'',email:'',address:'',nid:'',packageId:pk?pk.id:'',status:s.disabled==='true'?'suspended':'active',username:low===adm?cid.toLowerCase():low,pass:H('123456'),pppUser:s.name,pppPass:s.password||'',mac:a['caller-id']||'',ip:a.address||'',joined:now(),usage:0,expiry:''});
  added++;
 });
 save();return{added:added,skipped:skipped,total:u.secrets.length};
}
module.exports=function(col,id,act,M,b,ok,bad,db,save,uid,now,str){
 if(col==='mtlive'&&M==='GET'){
  getLive(db).then(v=>ok(v.ok?{ok:true,router:v.router,online:v.online,secrets:v.secrets}:v)).catch(e=>bad(e.message,500));return true;
 }
 if(col==='mtcat'&&M==='GET'){
  const d=mt.dev(db);if(!d){ok({ok:false,msg:'No MikroTik router added yet'});return true}
  mt.catalog(d).then(c=>ok(Object.assign({ok:true},c))).catch(e=>ok({ok:false,msg:'Router: '+e.message}));return true;
 }
 if(col==='mtsync'&&M==='POST'){
  const d=mt.dev(db);if(!d){bad('Add a MikroTik router first (Migration & Network Devices)');return true}
  (id==='packages'?syncPk(db,d,save,uid):syncUsers(db,d,save,uid,now)).then(r=>ok(Object.assign({ok:true},r))).catch(e=>bad(e.message));return true;
 }
 if(col==='c360'&&M==='GET'){
  const c=db.customers.find(x=>x.id===id);if(!c){bad('Not found',404);return true}
  getLive(db,true).then(lv=>{
   const n=pu(c),o=Object.assign({},c);delete o.pass;
   ok({customer:o,package:pkg(db,c),meta:(db.cmeta||[]).find(m=>m.customerId===c.id)||{},
    invoices:db.invoices.filter(i=>i.customerId===c.id).sort((x,y)=>String(y.issued).localeCompare(String(x.issued))).slice(0,6),
    payments:db.payments.filter(p=>p.customerId===c.id).sort((x,y)=>String(y.date).localeCompare(String(x.date))).slice(0,6),
    live:lv.ok?{ok:true,online:lv.online[n]||null,secret:lv.secrets[n]||null,router:lv.router}:{ok:false,msg:lv.msg}});
  }).catch(e=>bad(e.message,500));return true;
 }
 if(col==='cact'&&M==='POST'){
  const c=db.customers.find(x=>x.id===id);if(!c){bad('Customer not found',404);return true}
  action(db,c,act,b||{},save,now,uid).then(m=>ok({ok:true,msg:m})).catch(e=>bad(e.message));return true;
 }
 return false;
};
function autoInv(db,c,t){
 if(!c.expiry||c.status==='paused'||c.status==='disconnected'||c.invFor===c.expiry)return false;
 const l=diff(c.expiry,t);if(l>3)return false;
 const p=pkg(db,c);if(!p.price)return false;
 if(db.invoices.some(i=>i.customerId===c.id&&i.status==='due')){c.invFor=c.expiry;return true}
 const mo=(l>=0?c.expiry:t).slice(0,7);
 db.invoices.push({id:'i'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),no:'INV-'+(db.seq=(db.seq||1000)+1),customerId:c.id,month:mo,amount:p.price,status:'due',issued:new Date().toISOString(),due:c.expiry});
 c.invFor=c.expiry;return true;
}

module.exports.jobs=function(getDb,save){
 let busy=false;
 async function tick(){
  if(busy)return;busy=true;
  try{
   const db=getDb();if(!db)return;const t=today();let ch=false;
   if(!db.c360base){db.invoices.forEach(i=>{if(i.status==='paid')i.applied=true});db.c360base=true;ch=true}
   for(const i of db.invoices){
    if(i.status==='paid'&&!i.applied){
     i.applied=true;ch=true;const c=db.customers.find(x=>x.id===i.customerId);if(!c)continue;
     const base=c.expiry&&c.expiry>t?c.expiry:t;c.expiry=addDays(base,30);
     if(c.status==='suspended')c.status='active';
     if(c.status==='active')c.routerPending='enable';
    }
   }
   for(const c of db.customers){
    if(autoInv(db,c,t))ch=true;if(c.status==='active'&&c.expiry&&t>c.expiry){c.status='suspended';c.autoOff=t;c.routerPending='disable';ch=true}
   }
   if(ch)save();
   for(const c of db.customers){
    if(!c.routerPending)continue;
    const r=await applyRouter(db,c,c.routerPending==='enable');
    if(r.err){c.lastErr=String(r.err).slice(0,120);ch=true;break}
    delete c.routerPending;delete c.lastErr;ch=true;
   }
   if(ch)save();
  }catch(e){console.error('c360 job:',e.message)}
  finally{busy=false}
 }
 setInterval(tick,30000);setTimeout(tick,3000);
};