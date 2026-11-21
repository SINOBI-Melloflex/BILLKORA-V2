const net=require('net');
const COLS={zones:'zn',staff:'st',inventory:'iv',jobs:'jb',netdevices:'nd',cmeta:'cm'};
const FIELDS={
 zones:['name','parent','note'],
 staff:['name','role','phone','email','salary','joined','status','note'],
 inventory:['item','kind','serial','mac','qty','location','status','assignedTo','note'],
 jobs:['title','customerId','type','tech','date','status','note'],
 netdevices:['name','kind','method','ip','port','user','pass','status','note'],
 cmeta:['customerId','zone','sub','type']
};
const REQ={zones:'name',staff:'name',inventory:'item',jobs:'title',netdevices:'name'};
const PORT={api:8728,snmp:161,telnet:23};
function clean(v){return String(v==null?'':v).trim().slice(0,300)}
function pickF(col,b,o){FIELDS[col].forEach(k=>{if(b[k]!==undefined)o[k]=clean(b[k])});return o}
module.exports=function(col,id,act,M,b,ok,bad,db,save,uid,now,str){
 b=b||{};
 if(col==='tkt'||col==='tkt2'){
  if(M!=='POST')return false;
  const c=db.customers.find(x=>x.id===String(b.customerId||''));
  const cname=clean(b.contactName),cphone=clean(b.contactPhone);
  if(!c&&!cname){bad('Choose a customer, or type the contact name');return true}
  const subject=clean(b.subject);
  if(!subject){bad('Subject is required');return true}
  db.tickets=db.tickets||[];
  let mx=0;db.tickets.forEach(t=>{const n=parseInt(String(t.no||'').replace(/\D/g,''),10);if(n>mx)mx=n});
  const t={id:uid('t'),no:'TKT-'+String(mx+1).padStart(4,'0'),customerId:c?c.id:'',contactName:c?'':cname,contactPhone:c?'':cphone,subject:subject,message:String(b.message||'').trim().slice(0,1000),category:clean(b.category),priority:clean(b.priority)||'normal',assignedTo:clean(b.assignedTo),status:'open',date:now(),by:'admin'};
  db.tickets.push(t);save();ok({ok:true,id:t.id,no:t.no});return true;
 }
 if(col==='nettest'){
  if(M!=='POST')return false;
  const d=(db.netdevices||[]).find(x=>x.id===id);
  if(!d){bad('Device not found',404);return true}
  if(d.method==='snmp'){ok({ok:false,msg:'SNMP uses UDP, so a simple connection test is not possible. Real SNMP reading comes in the next step.'});return true}
  const port=Number(d.port)||PORT[d.method]||8728;
  let fin=false;const sock=new net.Socket();
  const end=(good,msg)=>{if(fin)return;fin=true;try{sock.destroy()}catch(e){}d.status=good?'online':'offline';d.checked=now();save();ok({ok:good,msg:msg})};
  sock.setTimeout(4000);
  sock.once('connect',()=>end(true,'Connected to '+d.ip+':'+port));
  sock.once('timeout',()=>end(false,'No answer from '+d.ip+':'+port+' (timeout)'));
  sock.once('error',e=>end(false,'Cannot connect: '+(e.code||e.message)));
  sock.connect(port,d.ip);
  return true;
 }
 if(!COLS[col])return false;
 const arr=db[col]=db[col]||[];
 if(M==='GET'){ok(arr.map(o=>col==='netdevices'?Object.assign({},o,{pass:o.pass?'set':''}):o));return true}
 if(col==='cmeta'&&M==='POST'){
  if(!b.customerId){bad('Customer required');return true}
  let x=arr.find(i=>i.customerId===String(b.customerId));
  if(!x){x={id:uid('cm'),customerId:String(b.customerId)};arr.push(x)}
  pickF(col,b,x);x.customerId=String(b.customerId);save();ok({ok:true});return true;
 }
 if(M==='POST'){
  const o=pickF(col,b,{id:uid(COLS[col])});
  if(REQ[col]&&!o[REQ[col]]){bad('Required field missing: '+REQ[col]);return true}
  if(col==='netdevices'){
   if(!o.ip){bad('IP / host is required');return true}
   o.method=o.method||'api';o.kind=o.kind||'MikroTik';o.port=o.port||String(PORT[o.method]||'');o.status='unknown';
  }
  if(col==='zones'){
   if(o.parent&&!arr.some(z=>z.id===o.parent)){bad('Zone not found');return true}
   if(arr.some(z=>String(z.name).toLowerCase()===o.name.toLowerCase()&&(z.parent||'')===(o.parent||''))){bad('Already exists');return true}
  }
  arr.push(o);save();ok({ok:true,id:o.id});return true;
 }
 const x=arr.find(i=>i.id===id);
 if(!x){bad('Not found',404);return true}
 if(M==='PUT'){
  const nb=Object.assign({},b);
  if(col==='netdevices'&&!nb.pass)delete nb.pass;
  pickF(col,nb,x);save();ok();return true;
 }
 if(M==='DELETE'){
  if(col==='zones'){
   if(arr.some(z=>z.parent===id)){bad('Delete its subzones first');return true}
   if((db.cmeta||[]).some(m=>m.zone===id||m.sub===id)){bad('Customers are using this zone');return true}
  }
  arr.splice(arr.indexOf(x),1);save();ok();return true;
 }
 return false;
};