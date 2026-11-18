const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.join(__dirname,'public'),dd=path.join(__dirname,'data'),dbf=path.join(dd,'db.json');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};
const H=s=>crypto.createHash('sha256').update(String(s)).digest('hex');
const now=()=>new Date().toISOString();
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const str=(v,n)=>String(v==null?'':v).trim().slice(0,n||300);
const mkey=k=>{const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-k);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')};
const sum=a=>a.reduce((t,x)=>t+(x.amount||0),0);
const byD=(a,b)=>String(b.issued||b.date||'').localeCompare(String(a.issued||a.date||''));
const num=p=>p+(db.seq=(db.seq||1000)+1);
const S={};
let db;
fs.mkdirSync(dd,{recursive:true});
function save(){fs.writeFileSync(dbf,JSON.stringify(db,null,1))}
function seed(){
 const inv=(mo,st)=>{const i={id:uid('i'),no:num('INV-'),customerId:'c1',month:mo,amount:1000,status:st,issued:mo+'-01T00:00:00.000Z',due:mo+'-28'};db.invoices.push(i);if(st==='paid'){i.paidOn=mo+'-10T00:00:00.000Z';db.payments.push({id:uid('pm'),no:num('PAY-'),customerId:'c1',invoiceId:i.id,amount:1000,method:'bKash',date:mo+'-10T00:00:00.000Z'})}};
 db={settings:{company:'BillKora',phone:'01700-000000',email:'support@billkora.com',address:'Dhaka, Bangladesh',admin:{user:'admin',pass:H('admin')}},
  packages:[{id:'p10',name:'10 Mbps',speed:10,price:500,desc:'Home use'},{id:'p20',name:'20 Mbps',speed:20,price:700,desc:'Small family'},{id:'p30',name:'30 Mbps',speed:30,price:850,desc:'Streaming'},{id:'p50',name:'50 Mbps',speed:50,price:1000,desc:'Business'}],
  customers:[{id:'c1',cid:'BK-10458',name:'Hasan Mahmud',phone:'01812-345678',email:'hasan@example.com',address:'House 12, Road 5, Dhaka',nid:'',packageId:'p50',status:'active',username:'user',pass:H('user'),joined:now(),usage:482}],
  requests:[{id:uid('r'),name:'Riya Akter',nid:'',phone:'01798-765432',email:'',address:'Mirpur, Dhaka',package:'50 Mbps',note:'',status:'pending',date:now()},{id:uid('r'),name:'Tanvir Hasan',nid:'',phone:'01922-112233',email:'',address:'Uttara, Dhaka',package:'30 Mbps',note:'',status:'pending',date:now()}],
  invoices:[],payments:[],tickets:[],
  devices:[{id:'d1',customerId:'c1',type:'ONU / Router',ip:'10.10.1.25',mac:'AA:BB:CC:11:22:33',status:'online'}],
  announcements:[{id:'a1',title:'Scheduled Maintenance',text:'Our network will be under maintenance on Nov 20, 2026 (12:00 AM - 4:00 AM).',date:now()}]};
 inv(mkey(2),'paid');inv(mkey(1),'paid');inv(mkey(0),'due');
}
try{db=JSON.parse(fs.readFileSync(dbf,'utf8'))}catch(e){seed();try{JSON.parse(fs.readFileSync(path.join(dd,'requests.json'),'utf8')).forEach(r=>db.requests.push(Object.assign({id:uid('r'),status:'pending'},r)))}catch(e2){}save()}
const pub=c=>{const o=Object.assign({},c);delete o.pass;return o};
const withName=o=>{const c=db.customers.find(x=>x.id===o.customerId);return Object.assign({},o,{customer:c?c.name:'(deleted)',cid:c?c.cid:''})};
const nextCid=()=>'BK-'+(Math.max(10457,...db.customers.map(c=>parseInt(String(c.cid).slice(3))||0))+1);
const takenUser=(un,self)=>un===db.settings.admin.user.toLowerCase()||db.customers.some(c=>c.id!==self&&String(c.username).toLowerCase()===un);
function newInvoice(c,month,amount){month=month||mkey(0);const p=db.packages.find(x=>x.id===c.packageId);if(!p)return null;if(db.invoices.some(i=>i.customerId===c.id&&i.month===month))return null;
 const i={id:uid('i'),no:num('INV-'),customerId:c.id,month:month,amount:amount||p.price,status:'due',issued:now(),due:month+'-28'};db.invoices.push(i);return i}
function pay(i,method){if(i.status==='paid')return null;i.status='paid';i.paidOn=now();const p={id:uid('pm'),no:num('PAY-'),customerId:i.customerId,invoiceId:i.id,amount:i.amount,method:method||'Cash',date:now()};db.payments.push(p);const c=db.customers.find(x=>x.id===i.customerId);if(c&&c.status==='suspended'&&!db.invoices.some(x=>x.customerId===c.id&&x.status==='due'))c.status='active';return p}
function sess(req){const m=/(?:^|;\s*)bk=([a-f0-9]+)/.exec(req.headers.cookie||'');const s=m&&S[m[1]];return s&&s.exp>Date.now()?s:null}
function J(res,o,c){res.statusCode=c||200;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(o))}
const F={customers:['name','phone','email','address','nid','packageId','status','username'],packages:['name','desc','profile','speed'],devices:['customerId','type','ip','mac','status'],announcements:['title','text']};
const NUM={packages:['speed','price'],customers:['usage']};
const PFX={customers:'c',packages:'p',devices:'d',announcements:'a'};
const has=k=>Object.prototype.hasOwnProperty.call(F,k);
function pick(col,b,o){F[col].forEach(k=>{if(b[k]!==undefined)o[k]=str(b[k])});(NUM[col]||[]).forEach(k=>{if(b[k]!==undefined&&b[k]!=='')o[k]=Number(b[k])||0});return o}
function route(req,res,u,b){
 const M=req.method,s=sess(req),q=u.split('/').filter(Boolean);
 const ok=o=>J(res,o||{ok:true}),bad=(m,c)=>J(res,{error:m},c||400);
 if(u==='/api/public')return ok({company:db.settings.company,phone:db.settings.phone,email:db.settings.email,address:db.settings.address,packages:db.packages});
 if(u==='/api/register'&&M==='POST'){
  const r={id:uid('r'),name:str(b.name),nid:str(b.nid),phone:str(b.phone),email:str(b.email),address:str(b.address),package:str(b.package),note:str(b.note,1000),status:'pending',date:now()};
  if(!r.name||!r.phone||!r.address||!r.package)return bad('Please fill all required fields');
  db.requests.push(r);save();return ok();
 }
 if(u==='/api/login'&&M==='POST'){
  let role=null,id=null;const un=str(b.username).toLowerCase(),pw=H(b.password||'');
  if(un===db.settings.admin.user.toLowerCase()&&pw===db.settings.admin.pass){role='admin'}
  else{const c=db.customers.find(x=>String(x.username).toLowerCase()===un&&x.pass===pw);if(c){role='customer';id=c.id}}
  if(!role)return bad('Wrong username or password',401);
  const t=crypto.randomBytes(24).toString('hex');S[t]={role:role,id:id,exp:Date.now()+864e5};
  res.setHeader('Set-Cookie','bk='+t+'; Path=/; HttpOnly; SameSite=Lax');return ok({role:role});
 }
 if(u==='/api/logout'){const m=/bk=([a-f0-9]+)/.exec(req.headers.cookie||'');if(m)delete S[m[1]];res.setHeader('Set-Cookie','bk=; Path=/; Max-Age=0');return ok()}
 if(!s)return bad('Please login first',401);
 if(u==='/api/me'){const c=db.customers.find(x=>x.id===s.id);return ok({role:s.role,name:s.role==='admin'?'Admin User':(c?c.name:''),email:s.role==='admin'?db.settings.email:''})}
 if(q[1]==='admin'){
  if(s.role!=='admin')return bad('Forbidden',403);
  const col=q[2],id=q[3],act=q[4];
  if(require('./extra.js')(col,id,act,M,b,ok,bad,db,save,uid,now,str))return;
  if(has(col)){
   const arr=db[col];
   if(wrap(col,id,M,b,ok,db,str,takenUser,nextCid,uid,H,now,newInvoice,save))return;if(M==='GET')return ok(col==='customers'?arr.map(pub):arr);
   if(M==='POST'){
    const o=pick(col,b,{id:uid(PFX[col])});
    if(col==='customers'){
     if(!o.name||!o.phone)return bad('Name and phone are required');
     o.cid=nextCid();o.username=(o.username||o.cid).toLowerCase();
     if(takenUser(o.username))return bad('Username already used');
     const pw=b.pass||o.phone.replace(/\D/g,'')||'123456';o.pass=H(pw);
     o.status=o.status||'active';o.packageId=o.packageId||(db.packages[0]&&db.packages[0].id);o.usage=o.usage||0;o.joined=now();
     arr.push(o);newInvoice(o);save();return ok({ok:true,username:o.username,password:pw});
    }
    if(col==='packages'&&!o.name)return bad('Package name required');
    if(col==='announcements')o.date=now();
    arr.push(o);save();return ok({ok:true,id:o.id});
   }
   const x=arr.find(i=>i.id===id);if(!x)return bad('Not found',404);
   if(M==='PUT'){
    if(col==='customers'){const un=b.username!==undefined&&str(b.username)?str(b.username).toLowerCase():x.username;if(takenUser(un,x.id))return bad('Username already used');pick(col,b,x);x.username=un;if(b.pass)x.pass=H(b.pass)}
    else pick(col,b,x);
    save();return ok();
   }
   if(M==='DELETE'){
    if(col==='packages'&&db.customers.some(c=>c.packageId===id))return bad('Some customers use this package');
    if(col==='customers'){['invoices','payments','tickets','devices'].forEach(k=>{db[k]=db[k].filter(i=>i.customerId!==id)})}
    db[col]=arr.filter(i=>i.id!==id);save();return ok();
   }
  }
  if(col==='requests'){
   if(M==='GET')return ok(db.requests);
   if(M==='DELETE'){db.requests=db.requests.filter(x=>x.id!==id);save();return ok()}
   const r=db.requests.find(x=>x.id===id);if(!r)return bad('Not found',404);
   if(r.status!=='pending')return bad('Already processed');
   if(act==='reject'){r.status='rejected';save();return ok()}
   if(act==='approve'){
    const pk=db.packages.find(p=>p.name===r.package)||db.packages[0];if(!pk)return bad('Create a package first');
    const no=nextCid(),pw=String(r.phone).replace(/\D/g,'')||'123456';
    const c={id:uid('c'),cid:no,name:r.name,phone:r.phone,email:r.email,address:r.address,nid:r.nid,packageId:pk.id,status:'active',username:no.toLowerCase(),pass:H(pw),joined:now(),usage:0};
    db.customers.push(c);r.status='approved';r.customerId=c.id;newInvoice(c);save();return ok({ok:true,username:c.username,password:pw});
   }
  }
  if(col==='invoices'){
   if(M==='GET')return ok(db.invoices.map(withName).sort(byD));
   if(M==='POST'&&id==='generate'){let n=0;db.customers.filter(c=>c.status!=='disconnected').forEach(c=>{if(newInvoice(c))n++});save();return ok({ok:true,created:n})}
   if(M==='POST'){const c=db.customers.find(x=>x.id===b.customerId);if(!c)return bad('Choose a customer');let mo=str(b.month);if(!/^\d{4}-\d{2}$/.test(mo))mo=mkey(0);const amt=Number(b.amount);const i=newInvoice(c,mo,amt>0?amt:undefined);if(!i)return bad('An invoice for that month already exists');save();return ok()}
   if(M==='DELETE'){db.invoices=db.invoices.filter(i=>i.id!==id);db.payments=db.payments.filter(p=>p.invoiceId!==id);save();return ok()}
  }
  if(col==='payments'){
   if(M==='GET')return ok(db.payments.map(withName).sort(byD));
   if(M==='POST'){const i=db.invoices.find(x=>x.id===b.invoiceId);if(!i)return bad('Choose an invoice');if(!pay(i,str(b.method)))return bad('Already paid');save();return ok()}
  }
  if(col==='tickets'){
   if(M==='GET')return ok(db.tickets.map(withName).sort(byD));
   const t=db.tickets.find(x=>x.id===id);if(!t)return bad('Not found',404);
   if(act==='reply'&&M==='POST'){t.reply=str(b.reply,1000);t.status=b.status==='closed'?'closed':'open';t.repliedOn=now();save();return ok()}
   if(M==='DELETE'){db.tickets=db.tickets.filter(x=>x.id!==id);save();return ok()}
  }
  if(col==='summary'){
   const st=k=>db.customers.filter(c=>c.status===k).length,m=mkey(0);
   return ok({total:db.customers.length,active:st('active'),suspended:st('suspended'),disconnected:st('disconnected'),
    newRequests:db.requests.filter(r=>r.status==='pending').length,dueBills:db.invoices.filter(i=>i.status==='due').length,
    revenue:sum(db.payments.filter(p=>p.date.slice(0,7)===m)),
    trend:[5,4,3,2,1,0].map(k=>sum(db.payments.filter(p=>p.date.slice(0,7)===mkey(k)))),
    recentRequests:db.requests.filter(r=>r.status==='pending').slice(-5).reverse(),
    recentPayments:db.payments.slice().sort(byD).slice(0,5).map(withName)});
  }
  if(col==='reports'){
   const mo=[5,4,3,2,1,0].map(k=>mkey(k));
   return ok({months:mo,billed:mo.map(m=>sum(db.invoices.filter(i=>i.month===m))),collected:mo.map(m=>sum(db.payments.filter(p=>p.date.slice(0,7)===m))),
    byPackage:db.packages.map(p=>({name:p.name,count:db.customers.filter(c=>c.packageId===p.id).length})),
    totalCollected:sum(db.payments),totalDue:sum(db.invoices.filter(i=>i.status==='due')),customers:db.customers.length});
  }
  if(col==='settings'){const st=db.settings;
   if(M==='GET')return ok({company:st.company,phone:st.phone,email:st.email,address:st.address});
   if(M==='PUT'){['company','phone','email','address'].forEach(k=>{if(b[k]!==undefined)st[k]=str(b[k])});save();return ok()}
  }
  if(col==='password'&&M==='POST'){
   if(H(b.old||'')!==db.settings.admin.pass)return bad('Current password is wrong');
   if(String(b.new||'').length<4)return bad('New password is too short');
   db.settings.admin.pass=H(b.new);save();return ok();
  }
  return bad('Unknown request',404);
 }
 if(q[1]==='c'){
  if(s.role!=='customer')return bad('Forbidden',403);
  const me=db.customers.find(c=>c.id===s.id);if(!me)return bad('Account not found',401);
  const act=q[2],mine=a=>a.filter(x=>x.customerId===me.id);
  if(act==='dashboard'){
   const inv=mine(db.invoices).sort(byD).map(withName);
   return ok({customer:pub(me),package:db.packages.find(p=>p.id===me.packageId)||null,nextBill:inv.filter(i=>i.status==='due').pop()||null,bills:inv.slice(0,3),announcements:db.announcements.slice(-3).reverse()});
  }
  if(act==='bills')return ok(mine(db.invoices).sort(byD).map(withName));
  if(act==='payments')return ok(mine(db.payments).sort(byD));
  if(act==='pay'&&M==='POST'){const i=db.invoices.find(x=>x.id===b.invoiceId&&x.customerId===me.id);if(!i)return bad('Bill not found',404);if(!pay(i,str(b.method)||'bKash'))return bad('Already paid');save();return ok()}
  if(act==='package'&&M==='POST'){const p=db.packages.find(x=>x.id===b.packageId);if(!p)return bad('Package not found');me.packageId=p.id;db.invoices.forEach(i=>{if(i.customerId===me.id&&i.status==='due'&&i.month===mkey(0))i.amount=p.price});save();return ok()}
  if(act==='tickets'){
   if(M==='GET')return ok(mine(db.tickets).sort(byD));
   if(M==='POST'){if(!str(b.subject)||!str(b.message,1000))return bad('Subject and message are required');db.tickets.push({id:uid('t'),no:num('TKT-'),customerId:me.id,subject:str(b.subject),message:str(b.message,1000),status:'open',date:now(),reply:''});save();return ok()}
  }
  if(act==='profile'&&M==='PUT'){if(b.name!==undefined&&!str(b.name))return bad('Name is required');['name','phone','email','address'].forEach(k=>{if(b[k]!==undefined)me[k]=str(b[k])});save();return ok()}
  if(act==='password'&&M==='POST'){if(H(b.old||'')!==me.pass)return bad('Current password is wrong');if(String(b.new||'').length<4)return bad('New password is too short');me.pass=H(b.new);save();return ok()}
  return bad('Unknown request',404);
 }
 return bad('Unknown request',404);
}
function serve(u,res){
 let p=decodeURIComponent(u);if(p==='/')p='/index.html';
 const f=path.join(root,p);
 if(!f.startsWith(root)){res.statusCode=403;return res.end()}
 fs.readFile(f,(e,d)=>{if(e){res.statusCode=404;return res.end('Not found')}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.setHeader('Cache-Control','no-cache');res.end(d)});
}
http.createServer((req,res)=>{
 const u=req.url.split('?')[0];
 if(u.indexOf('/api/')!==0)return serve(u,res);
 let b='';req.on('data',d=>{b+=d;if(b.length>1e6)req.destroy()});
 req.on('end',()=>{let body={};try{body=b?JSON.parse(b):{}}catch(e){}
  try{route(req,res,u,body)}catch(e){console.error(e);J(res,{error:'Server error'},500)}});
}).listen(4050,'127.0.0.1');


function wrap(col,id,M,b,ok,db,str,takenUser,nextCid,uid,H,now,newInvoice,save){
  if(col==='customers'&&id==='import'&&M==='POST'){
   const rows=Array.isArray(b.rows)?b.rows.slice(0,1000):[],upd=b.mode==='update',mk=!!b.invoice;let added=0,updated=0;const skipped=[];
   rows.forEach(r=>{
    r=r||{};const un0=str(r.username).toLowerCase(),name=str(r.name)||str(r.username),phone=str(r.phone),who=str(r.username)||name;
    if(!name){skipped.push({who:'(blank)',why:'No name or username'});return}
    const pk=db.packages.find(p=>p.id===r.packageId),st=['active','suspended','disconnected'].includes(r.status)?r.status:'';
    const ex=un0?db.customers.find(c=>String(c.username).toLowerCase()===un0):null;
    if(ex){
     if(!upd){skipped.push({who:who,why:'Username already exists'});return}
     ex.name=name;['phone','email','address','nid'].forEach(k=>{if(str(r[k]))ex[k]=str(r[k])});
     if(pk)ex.packageId=pk.id;if(st)ex.status=st;if(str(r.pass))ex.pass=H(str(r.pass));updated++;return;
    }
    const cid=nextCid(),un=un0||cid.toLowerCase();
    if(takenUser(un)){skipped.push({who:who,why:'Username already used'});return}
    const pw=str(r.pass)||phone.replace(/\D/g,'')||'123456';
    const c={id:uid('c'),cid:cid,name:name,phone:phone,email:str(r.email),address:str(r.address),nid:str(r.nid),packageId:pk?pk.id:(db.packages[0]&&db.packages[0].id),status:st||'active',username:un,pass:H(pw),joined:now(),usage:0};
    db.customers.push(c);added++;if(mk)newInvoice(c);
   });
   save();ok({ok:true,added:added,updated:updated,skipped:skipped});return true;
  }
  return false;
}