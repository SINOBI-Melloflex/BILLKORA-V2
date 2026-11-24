/* BillKora wizard3.js: premium auto migration assistant. Loads last. */
(function(){
var $$=function(i){return document.getElementById(i)};
var S={st:'upload',rows:[],pkk:[],pk:{},zones:{},fname:'',bad:0,pi:0,rq:0,rv:{ip:'',user:'',pass:''},devId:'',exist:null,cat:null,res:null,running:false,others:[],log:[],pct:0};
var STEPS=['File','Prices','Router','Sync','Import','Done'];var STEPSD=['Router','Prices','Import','Done'];var IDXD={upload:0,scan:1,prices:1,router:2,conn:2,other:2,sync:2,run:2,done:3};
var IDX={upload:0,scan:0,prices:1,router:2,conn:2,other:2,sync:3,run:4,done:5};
var css='.x3{position:relative;overflow:hidden;border-radius:20px;padding:22px;background:radial-gradient(1200px 500px at 10% -10%,#102a5c 0,transparent 60%),#050a18;color:#d7e6ff;min-height:520px;border:1px solid #16305f;box-shadow:0 0 40px rgba(0,229,255,.08) inset}'
+'.x3g{position:absolute;inset:0;background-image:linear-gradient(rgba(0,229,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,.06) 1px,transparent 1px);background-size:36px 36px;animation:x3gm 14s linear infinite;pointer-events:none}@keyframes x3gm{to{background-position:36px 36px}}'
+'.x3steps{position:relative;display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:22px}.x3s{display:flex;align-items:center;gap:8px;opacity:.5}.x3s i{width:26px;height:26px;border-radius:50%;border:1px solid #2a4a80;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:12px}.x3s b{font-size:12px;font-weight:600}.x3s.on{opacity:1}.x3s.on i{border-color:#00e5ff;color:#00e5ff;box-shadow:0 0 14px #00e5ff;animation:x3p 1.6s infinite}.x3s.d{opacity:.9}.x3s.d i{background:#19f5a6;color:#041;border-color:#19f5a6}.x3steps u{flex:1;min-width:14px;height:1px;background:#1b3566}@keyframes x3p{50%{box-shadow:0 0 4px #00e5ff}}'
+'.x3main{position:relative;max-width:860px;margin:0 auto;animation:x3in .5s ease both}@keyframes x3in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}'
+'.x3a{display:flex;gap:14px;align-items:flex-start;margin-bottom:18px}.x3o{flex:none;width:44px;height:44px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#7ff3ff,#0077ff 60%,#12206b);box-shadow:0 0 22px rgba(0,229,255,.6);animation:x3o 3s ease-in-out infinite}@keyframes x3o{50%{transform:scale(1.08);box-shadow:0 0 34px rgba(0,229,255,.9)}}'
+'.x3t{background:rgba(14,30,66,.8);border:1px solid #1d3d78;border-radius:4px 16px 16px 16px;padding:14px 18px;font-size:15px;line-height:1.7;min-height:24px}.x3t.cur::after{content:"";display:inline-block;width:8px;height:16px;background:#00e5ff;margin-left:3px;vertical-align:-3px;animation:x3bl .7s steps(2) infinite}@keyframes x3bl{50%{opacity:0}}'
+'.x3b{background:linear-gradient(135deg,#00b8ff,#2f6bff);color:#fff;border:0;border-radius:12px;padding:11px 20px;font-weight:700;cursor:pointer;box-shadow:0 0 18px rgba(0,160,255,.35);transition:.2s;text-decoration:none;display:inline-block;font-size:14px}.x3b:hover{transform:translateY(-2px)}.x3b.g{background:transparent;border:1px solid #2a4a80;color:#9fc3ff;box-shadow:none}.x3row{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}'
+'.x3main>.x3row,.x3main>.x3ind{margin-left:58px}.x3q{margin-left:58px}.x3q small{display:block;color:#7f93b8;margin-top:8px;line-height:1.6}'
+'.x3i,.x3in input,.x3f input,.x3f select{width:100%;box-sizing:border-box;background:#071230;border:1px solid #23478a;border-radius:12px;padding:13px 16px;color:#e6f0ff;font-size:15px;outline:0}.x3i:focus,.x3f input:focus{border-color:#00e5ff;box-shadow:0 0 14px rgba(0,229,255,.35)}.x3in{display:flex;align-items:center;gap:8px;background:#071230;border:1px solid #23478a;border-radius:12px;padding:0 14px}.x3in input{border:0;background:transparent}.x3in span{color:#00e5ff;font-size:18px}'
+'.x3drop{margin-left:58px;border:2px dashed #2a5fb0;border-radius:18px;padding:34px;text-align:center;background:rgba(10,25,60,.5);transition:.2s;position:relative;overflow:hidden}.x3drop.on{border-color:#00e5ff;background:rgba(0,229,255,.08)}.x3drop b{display:block;font-size:17px;margin-bottom:6px}.x3drop span{color:#7f93b8;font-size:13px}.x3drop .x3row{justify-content:center}.x3pl{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#00e5ff,transparent);animation:x3sl 2.6s linear infinite}@keyframes x3sl{from{top:0}to{top:100%}}'
+'.x3scan{margin-left:58px;display:flex;gap:30px;align-items:center;flex-wrap:wrap}.x3rad{width:140px;height:140px;border-radius:50%;border:1px solid #1d5aa8;background:repeating-radial-gradient(circle,transparent 0 22px,rgba(0,229,255,.18) 23px 24px);position:relative;overflow:hidden}.x3rad div{position:absolute;inset:0;background:conic-gradient(from 0deg,rgba(0,229,255,.55),transparent 28%);animation:x3rt 2s linear infinite;border-radius:50%}@keyframes x3rt{to{transform:rotate(360deg)}}.x3cnt{display:flex;gap:28px}.x3cnt div{text-align:center}.x3cnt b{display:block;font-size:34px;color:#00e5ff;text-shadow:0 0 14px rgba(0,229,255,.7)}.x3cnt span{font-size:12px;color:#7f93b8;text-transform:uppercase;letter-spacing:1px}'
+'.x3chk{margin-left:58px}.x3ci{display:flex;align-items:center;gap:12px;padding:10px 0;opacity:.45;transition:.3s}.x3ci i{width:22px;height:22px;border-radius:50%;border:2px solid #2a4a80;flex:none;box-sizing:border-box}.x3ci.run{opacity:1}.x3ci.run i{border-color:#00e5ff #00e5ff transparent transparent;animation:x3sp .8s linear infinite}.x3ci.ok{opacity:1}.x3ci.ok i{background:#19f5a6;border-color:#19f5a6;position:relative}.x3ci.ok i::after{content:"";position:absolute;left:6px;top:2px;width:5px;height:10px;border:solid #031;border-width:0 2px 2px 0;transform:rotate(45deg)}.x3ci.err{opacity:1;color:#ff8097}.x3ci.err i{background:#ff4d6d;border-color:#ff4d6d}@keyframes x3sp{to{transform:rotate(360deg)}}'
+'.x3card{margin-left:58px;background:rgba(10,24,56,.75);border:1px solid #1d3d78;border-radius:16px;padding:16px;margin-bottom:14px;overflow-x:auto}.x3t2{width:100%;border-collapse:collapse;font-size:13.5px}.x3t2 th{text-align:left;color:#7f93b8;font-weight:600;padding:8px;border-bottom:1px solid #1d3d78}.x3t2 td{padding:8px;border-bottom:1px solid #12285a}.x3t2 select{background:#071230;color:#e6f0ff;border:1px solid #23478a;border-radius:8px;padding:6px}'
+'.x3tk{display:inline-block;width:10px;height:10px;border-radius:50%;background:#19f5a6;box-shadow:0 0 10px #19f5a6}.x3wr{display:inline-block;width:10px;height:10px;border-radius:50%;background:#ffb020;box-shadow:0 0 10px #ffb020;animation:x3p 1s infinite}'
+'.x3pb{height:12px;border-radius:8px;background:#0b1c44;overflow:hidden}.x3pb div{height:100%;width:0;background:linear-gradient(90deg,#00e5ff,#19f5a6);box-shadow:0 0 14px #00e5ff;transition:width .3s}.x3pc{text-align:right;font-size:12px;color:#7f93b8;margin:4px 0}.x3term{background:#020612;border:1px solid #12285a;border-radius:10px;padding:12px;font-family:Consolas,monospace;font-size:12.5px;line-height:1.8;max-height:230px;overflow:auto;color:#8fd3ff}.x3term .g{color:#19f5a6}.x3term .e{color:#ff6b86}'
+'.x3chip{display:inline-block;border:1px solid #2a4a80;border-radius:20px;padding:4px 12px;margin:3px;font-size:12.5px}.x3chip.ok{border-color:#19f5a6;color:#19f5a6}.x3ok{margin-top:12px;padding:12px 16px;border-radius:12px;background:rgba(25,245,166,.1);border:1px solid #19f5a6;color:#19f5a6}.x3er{margin-top:12px;padding:14px 16px;border-radius:12px;background:rgba(255,77,109,.1);border:1px solid #ff4d6d;color:#ffb3c0;line-height:1.7}.x3res{margin-left:58px}'
+'.x3win{width:84px;margin:0 auto 14px}.x3win svg{width:84px;height:84px;fill:none;stroke:#19f5a6;stroke-width:3}.x3win circle{stroke-dasharray:152;stroke-dashoffset:152;animation:x3d .8s ease forwards;filter:drop-shadow(0 0 8px #19f5a6)}.x3win path{stroke-dasharray:40;stroke-dashoffset:40;animation:x3d .5s .7s ease forwards}@keyframes x3d{to{stroke-dashoffset:0}}'
+'.x3st{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-left:58px;margin-bottom:14px}.x3st div{background:rgba(10,24,56,.75);border:1px solid #1d3d78;border-radius:14px;padding:14px}.x3st b{display:block;font-size:26px;color:#00e5ff}.x3st span{font-size:12px;color:#7f93b8}'
+'.x3f{margin-left:58px;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}.x3f label{font-size:12px;color:#7f93b8;display:block;margin-bottom:4px}'
+'@media(max-width:700px){.x3q,.x3drop,.x3scan,.x3chk,.x3card,.x3st,.x3f,.x3res,.x3main>.x3row,.x3main>.x3ind{margin-left:0}}@media (prefers-reduced-motion:reduce){.x3 *{animation:none!important}}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
function spd(n){return parseInt(String(n).replace(/[^0-9]/g,''),10)||0}
function E(s){return esc(s==null?'':s)}
function E2(s){return E(s).replace(/"/g,'&quot;')}
function say(t){return '<div class="x3a"><div class="x3o"></div><div class="x3t" data-t="'+E2(t)+'"></div></div>'}
function typeAll(){var els=document.querySelectorAll('#x3m [data-t]');
 Array.prototype.forEach.call(els,function(el){var t=el.getAttribute('data-t'),i=0;el.removeAttribute('data-t');
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches){el.textContent=t;return}
  el.textContent='';el.classList.add('cur');
  var iv=setInterval(function(){i+=2;el.textContent=t.slice(0,i);if(i>=t.length){clearInterval(iv);el.classList.remove('cur')}},16)})}
function shell(inner){var i=(S.direct?IDXD:IDX)[S.st]||0;
 var steps=(S.direct?STEPSD:STEPS).map(function(n,k){return '<div class="x3s'+(k<i?' d':'')+(k===i?' on':'')+'"><i>'+(k<i?'&#10003;':(k+1))+'</i><b>'+n+'</b></div>'}).join('<u></u>');
 P('Migration Assistant','<div id="wzbar" style="display:none"></div><div class="x3"><div class="x3g"></div><div class="x3steps">'+steps+'</div><div class="x3main" id="x3m">'+inner+'</div></div>');
 typeAll()}
function ci(i,s,t){var e=$$('ci'+i);if(!e)return;e.className='x3ci '+s;if(t)e.querySelector('span').textContent=t}
function checklist(items){return '<div class="x3chk">'+items.map(function(t,i){return '<div class="x3ci" id="ci'+i+'"><i></i><span>'+t+'</span></div>'}).join('')+'</div>'}
function count(id,to){var n=0,step=Math.max(1,Math.ceil(to/30));var iv=setInterval(function(){n=Math.min(to,n+step);var e=$$(id);if(!e){clearInterval(iv);return}e.textContent=n;if(n>=to)clearInterval(iv)},50)}

/* ---------- 1. upload ---------- */
function vUpload(){S.st='upload';S.direct=false;
 shell(say("Hi, I'm your migration assistant. Give me your customer file and I will read everything myself: users, packages, zones and prices. You only need to answer a few short questions.")
 +'<div class="x3drop" id="x3drop"><div class="x3pl"></div><b>Drop your Excel / CSV file here</b><span>or</span><div class="x3row"><button class="x3b" onclick="x3Pick()">Choose file</button><button class="x3b g" onclick="x3Demo()">Download demo file</button></div><input id="x3f" type="file" accept=".xlsx,.xls,.csv" style="display:none" onchange="x3File(this.files[0])"></div>');
 var d=$$('x3drop');if(!d)return;
 d.ondragover=function(e){e.preventDefault();d.classList.add('on')};d.ondragleave=function(){d.classList.remove('on')};
 d.ondrop=function(e){e.preventDefault();d.classList.remove('on');x3File(e.dataTransfer.files[0])}}
window.x3Pick=function(){var f=$$('x3f');if(f)f.click()};
window.x3Demo=function(){if(typeof wzDemo==='function')wzDemo();else toast('Demo file maker is missing',1)};
var COLS={name:['customername','fullname','name','customer'],phone:['phone','mobile'],user:['pppoeusername','username','login','pppoe'],pass:['pppoepassword','password','pass'],pkg:['package','profile','plan'],bill:['monthlybill','bill','price','amount'],due:['previousdue','due'],sub:['subzone'],zone:['zone','area'],addr:['address'],ip:['ipaddress','ip'],mac:['macaddress','mac']};
var ORDER=['user','pass','name','phone','pkg','bill','due','sub','zone','addr','ip','mac'];
var LAB={name:'Customer name',phone:'Phone',user:'PPPoE username',pkg:'Package'};
window.x3File=function(f){var dn=S._dn;S._dn=0;
 if(!f)return;
 if(typeof XLSX==='undefined'){toast('Excel reader (xlsx.full.min.js) is missing',1);return}
 var csv=/\.csv$/i.test(f.name),r=new FileReader();
 r.onload=function(){try{
  var wb=XLSX.read(csv?r.result:new Uint8Array(r.result),{type:csv?'string':'array'});
  var a=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:'',raw:false,blankrows:false}).filter(function(x){return x.some(function(c){return String(c).trim()!==''})});
  if(a.length<2){toast('This file has no data rows',1);return}
  var head=a[0].map(function(h){return String(h).toLowerCase().replace(/[^a-z0-9]/g,'')}),used={},m={};
  ORDER.forEach(function(k){var j=-1;
   COLS[k].forEach(function(c){if(j<0)j=head.findIndex(function(x,i){return !used[i]&&x===c})});
   if(j<0)COLS[k].forEach(function(c){if(j<0&&c.length>3)j=head.findIndex(function(x,i){return !used[i]&&x.indexOf(c)>-1})});
   m[k]=j;if(j>=0)used[j]=1});
  var miss=['name','phone','user','pkg'].filter(function(k){return m[k]<0}).map(function(k){return LAB[k]});
  if(miss.length){toast('Column missing in your file: '+miss.join(', ')+'. Please use the demo file layout.',1);return}
  var g=function(r,k){return m[k]>=0?String(r[m[k]]==null?'':r[m[k]]).trim():''},seen={},rows=[],bad=0;
  a.slice(1).forEach(function(r){
   var u=g(r,'user'),p=g(r,'pkg'),ph=g(r,'phone');
   if(!u||!p||seen[u.toLowerCase()]){bad++;return}
   seen[u.toLowerCase()]=1;if(/^1[3-9]\d{8}$/.test(ph))ph='0'+ph;
   rows.push({name:g(r,'name')||u,phone:ph,user:u,pass:g(r,'pass'),pkg:p,bill:Number(g(r,'bill'))||0,zone:g(r,'zone'),sub:g(r,'sub'),addr:g(r,'addr'),ip:g(r,'ip'),mac:g(r,'mac')})});
  if(!rows.length){toast('No usable rows (each needs a PPPoE username and a package)',1);return}
  S.direct=!!dn;S.rows=rows;S.bad=bad;S.fname=f.name;S.pk={};S.pkk=[];S.zones={};S.cat=null;S.res=null;S.others=[];
  var cnt={};
  rows.forEach(function(x){
   if(!S.pk[x.pkg]){S.pk[x.pkg]={n:0,price:'',speed:spd(x.pkg),profile:'',pool:''};S.pkk.push(x.pkg);cnt[x.pkg]={}}
   S.pk[x.pkg].n++;if(x.bill>0)cnt[x.pkg][x.bill]=(cnt[x.pkg][x.bill]||0)+1;
   if(x.zone){S.zones[x.zone]=S.zones[x.zone]||{};if(x.sub)S.zones[x.zone][x.sub]=1}});
  S.pkk.forEach(function(k){var best=0,bc=0;Object.keys(cnt[k]).forEach(function(v){if(cnt[k][v]>bc){bc=cnt[k][v];best=v}});S.pk[k].price=best||''});
  vScan();
 }catch(e){toast('Could not read this file: '+e.message,1)}};
 if(csv)r.readAsText(f);else r.readAsArrayBuffer(f)};

function vScan(){S.st='scan';
 shell(say('Reading your file...')+'<div class="x3scan"><div class="x3rad"><div></div></div><div class="x3cnt"><div><b id="c1">0</b><span>users</span></div><div><b id="c2">0</b><span>packages</span></div><div><b id="c3">0</b><span>zones</span></div></div></div>');
 count('c1',S.rows.length);count('c2',S.pkk.length);count('c3',Object.keys(S.zones).length);
 setTimeout(function(){if(S.st==='scan')afterScan()},2400)}
function nextMissing(){for(var i=0;i<S.pkk.length;i++){if(!(Number(S.pk[S.pkk[i]].price)>0))return i}return -1}
function afterScan(){S.pi=nextMissing();if(S.pi<0)nextAfterPrices();else vPrice()}

/* ---------- 2. prices ---------- */
function vPrice(){S.st='prices';var k=S.pkk[S.pi],c=S.pk[k],left=S.pkk.filter(function(x){return !(Number(S.pk[x].price)>0)}).length;
 shell(say('I could not find a monthly bill for '+k+(S.direct?' on your router. How much do you charge for it per month? (':' in your file. How much do you charge for it per month? (')+c.n+' users are on this package)')
 +'<div class="x3q"><div class="x3in"><span>&#2547;</span><input id="x3i" type="number" min="1" placeholder="e.g. 500" onkeydown="if(event.key===\'Enter\')x3Price()"></div><small>'+left+' package(s) still need a price</small><div class="x3row"><button class="x3b" onclick="x3Price()">Continue</button></div></div>');
 var i=$$('x3i');if(i)i.focus()}
window.x3Price=function(){var v=Number($$('x3i').value);if(!(v>0)){toast('Enter the monthly bill',1);return}
 S.pk[S.pkk[S.pi]].price=v;S.pi=nextMissing();if(S.pi<0)nextAfterPrices();else vPrice()};

/* ---------- direct MikroTik import: router already read, so skip router and sync steps ---------- */
window.x3Direct=function(f,rt){S._dn=1;S.rt0=rt||{};window.x3File(f)};
function nextAfterPrices(){if(S.direct)vDirectPrep();else vRouter()}
window.x3DPrep=function(){vDirectPrep()};
async function vDirectPrep(){S.st='sync';
 shell(say('Getting everything ready from your router. I only read, I never change anything there.')+checklist(['Saving your router','Reading IP pools and profiles','Matching packages with profiles'])+'<div class="x3res" id="x3r"></div>');
 try{
  ci(0,'run');
  var L=await api('admin/netdevices');L=Array.isArray(L)?L:[];
  var rt=S.rt0||{},d=L.filter(function(x){return x.kind==='MikroTik'&&(x.method||'api')==='api'})[0];
  S.exist=d||null;
  if(rt.mode==='saved'){
   if(!d)throw new Error('No saved MikroTik router found');
   S.devId=d.id;S.rt={ip:d.ip,port:d.port||'8728',user:d.user||'',name:d.name||''}}
  else{
   var body={name:(d&&d.name)||('MikroTik '+rt.ip),kind:'MikroTik',method:'api',ip:rt.ip,port:rt.port||'8728',user:rt.user,pass:rt.pass,note:'Added by migration assistant'};
   if(d){await api('admin/netdevices/'+d.id,'PUT',body);S.devId=d.id}
   else{var r0=await api('admin/netdevices','POST',body);S.devId=r0.id;S.exist={id:S.devId}}
   S.rt={ip:rt.ip,port:rt.port||'8728',user:rt.user,name:body.name}}
  ci(0,'ok');ci(1,'run');
  var c=await api('admin/mtcat');
  if(!c.ok)throw new Error(c.msg||'Router not reachable');
  ci(1,'ok');ci(2,'run');S.cat=c;
  S.pkk.forEach(function(k){var cc=S.pk[k];if(!cc.profile){var p=(c.profiles||[]).filter(function(x){return x.name===k})[0];if(p){cc.profile=p.name;cc.pool=p.pool}}});
  autoMap();
  ci(2,'ok');await sleep(500);
  S.rt0=null;
  var un=S.pkk.filter(function(k){return !S.pk[k].profile}).length;
  if(un)vMatch();else{S.log=[];S.pct=0;vRun()}
 }catch(e){if(e.message==='auth')return;ci(0,'err');var r=$$('x3r');if(r)r.innerHTML=failBox(e.message,'<button class="x3b" onclick="x3DPrep()">Try again</button>')}}
/* ---------- 3. router and devices (x3v4) ---------- */
var SVC=[
 ['api','MikroTik API','8728','The service BillKora uses to control PPPoE users on MikroTik. Needed for the router.'],
 ['apissl','MikroTik API-SSL','8729','Encrypted MikroTik API. BillKora does not support it yet.'],
 ['ssh','SSH','22','Command line over SSH (OLT, switch, Linux, other routers).'],
 ['telnet','Telnet','23','Command line over Telnet (older OLTs and switches). Least secure.'],
 ['snmp','SNMP','161','Monitoring. Uses a community string instead of a username and password.'],
 ['http','Web (HTTP)','80','Web panel of the device.'],
 ['https','Web (HTTPS)','443','Secure web panel of the device.']];
var D={};
function svc(k){return SVC.filter(function(s){return s[0]===k})[0]||SVC[0]}
function resetD(kind){D={kind:kind,ip:'',service:kind==='MikroTik'?'api':'ssh',port:'',user:'',pass:'',community:'public',name:'',step:0};D.port=svc(D.service)[2]}
function vRouter(){S.st='router';
 shell(say('Let me check if a router is already saved...'));
 api('admin/netdevices').then(function(L){L=Array.isArray(L)?L:[];
  var d=L.filter(function(x){return x.kind==='MikroTik'&&(x.method||'api')==='api'})[0];S.exist=d||null;
  if(d){shell(say('I found a saved router: '+d.name+' ('+d.ip+':'+(d.port||'8728')+', MikroTik API). Shall I connect to it and use it for this migration?')+'<div class="x3row"><button class="x3b" onclick="x3UseSaved()">Yes, connect</button><button class="x3b g" onclick="x3New()">Use different details</button></div>')}
  else{resetD('MikroTik');dAsk()}}).catch(function(e){if(e.message!=='auth')toast(e.message,1)})}
window.x3UseSaved=function(){resetD('MikroTik');S.devId=S.exist.id;D.ip=S.exist.ip;D.port=S.exist.port||'8728';D.user=S.exist.user||'';D.name=S.exist.name||'';doConnect(true)};
window.x3New=function(){resetD('MikroTik');if(S.exist){D.ip=S.exist.ip||'';D.port=S.exist.port||'8728';D.user=S.exist.user||'';D.name=S.exist.name||''}dAsk()};
window.x3Retry=function(){resetD('MikroTik');if(S.rt){D.ip=S.rt.ip;D.port=S.rt.port;D.user=S.rt.user;D.name=S.rt.name}dAsk()};
function dAsk(){S.st=D.kind==='MikroTik'?'router':'other';
 var h,isR=D.kind==='MikroTik',back=(D.step>0||!isR)?'<button class="x3b g" onclick="dBack()">'+(D.step>0?'Back':'Cancel')+'</button>':'';
 if(D.step===0){
  h=say((isR?"Let's connect your MikroTik router first. ":'Tell me about the device. ')+'What is its IP address or hostname?')
  +'<div class="x3q"><input class="x3i" id="x3ip" placeholder="e.g. 192.168.88.1" value="'+E2(D.ip)+'" onkeydown="if(event.key===\'Enter\')dNext()">'
  +(isR?'':'<div class="x3f" style="margin-left:0;margin-top:12px"><div><label>Device type</label><select id="x3kd"><option'+(D.kind==='OLT'?' selected':'')+'>OLT</option><option'+(D.kind==='Switch'?' selected':'')+'>Switch</option><option'+(D.kind==='Other'?' selected':'')+'>Other</option></select></div><div><label>Name (optional)</label><input id="x3nm" value="'+E2(D.name)+'" placeholder="e.g. Main OLT"></div></div>')
  +'<small>Step 1 of 3. The address this computer uses to reach the device (LAN, VPN or public IP).</small><div class="x3row">'+back+'<button class="x3b" onclick="dNext()">Next</button></div></div>'}
 else if(D.step===1){
  var opts=SVC.map(function(s){return '<option value="'+s[0]+'"'+(s[0]===D.service?' selected':'')+'>'+s[1]+' (default port '+s[2]+')</option>'}).join('');
  h=say('How should I connect to '+D.ip+'? Choose the service, and check the port that service listens on.')
  +'<div class="x3q"><div class="x3f" style="margin-left:0"><div><label>Service</label><select id="x3sv" onchange="dSvc()">'+opts+'</select></div><div><label>Port</label><input id="x3pt" type="number" min="1" max="65535" value="'+E2(D.port)+'" onkeydown="if(event.key===\'Enter\')dNext()"></div></div><small id="x3sh">'+svc(D.service)[3]+'</small><small>Step 2 of 3. If you changed the port on the device, type the new one.</small><div class="x3row">'+back+'<button class="x3b" onclick="dNext()">Next</button></div></div>'}
 else{
  var s=svc(D.service),isS=D.service==='snmp';
  h=say(isS?'Almost done. What is the SNMP community string of '+D.ip+'?':'Now the login. What username and password should I use for '+D.ip+' ('+s[1]+', port '+D.port+')?')
  +'<div class="x3q">'+(isS?'<input class="x3i" id="x3cm" value="'+E2(D.community)+'" placeholder="e.g. public" onkeydown="if(event.key===\'Enter\')dNext()">':'<div class="x3f" style="margin-left:0"><div><label>Username</label><input id="x3us" value="'+E2(D.user)+'" placeholder="e.g. admin"></div><div><label>Password</label><input id="x3pw" type="password" onkeydown="if(event.key===\'Enter\')dNext()"></div></div>')
  +'<small>Step 3 of 3. '+(isR?'Use a user whose group has read, write and api permission. ':'')+'It is stored only on this computer.</small><div class="x3row">'+back+'<button class="x3b" onclick="dNext()">'+(isR?'Connect':'Save and test')+'</button></div></div>'}
 shell(h);var f=$$(D.step===0?'x3ip':(D.step===1?'x3sv':(D.service==='snmp'?'x3cm':'x3us')));if(f)f.focus()}
window.dBack=function(){if(D.step>0){D.step--;dAsk()}else vOther()};
window.dSvc=function(){var s=svc($$('x3sv').value),p=$$('x3pt'),h=$$('x3sh');if(p)p.value=s[2];if(h)h.textContent=s[3]};
window.dNext=function(){
 var g=function(i){var e=$$(i);return e?e.value:''};
 if(D.step===0){
  var v=g('x3ip').trim().replace(/^[a-z]+:\/\//i,'').replace(/\/.*$/,''),m=/^(.+):(\d{1,5})$/.exec(v);
  if(m){v=m[1];D.port=m[2]}
  if(!v||/\s/.test(v)){toast('Enter a valid IP address or hostname',1);return}
  D.ip=v;if(D.kind!=='MikroTik'){D.kind=g('x3kd')||D.kind;D.name=g('x3nm').trim()}
  D.step=1;dAsk();return}
 if(D.step===1){
  var sv=g('x3sv'),p=parseInt(g('x3pt'),10);
  if(!(p>0&&p<65536)){toast('Port must be a number between 1 and 65535',1);return}
  if(D.kind==='MikroTik'&&sv!=='api'){toast('To control users, BillKora needs the MikroTik API (default port 8728). '+(sv==='apissl'?'API-SSL is not supported yet.':'Controlling MikroTik over '+svc(sv)[1]+' is not built yet.'),1);return}
  D.service=sv;D.port=String(p);D.step=2;dAsk();return}
 if(D.service==='snmp'){D.community=g('x3cm').trim();if(!D.community){toast('Enter the SNMP community',1);return}}
 else{D.user=g('x3us').trim();D.pass=g('x3pw');if(!D.user){toast('Enter the username',1);return}}
 if(D.kind==='MikroTik')doConnect(false);else dSaveOther()};
function failBox(msg,extra){var m=msg||'',h='I could not complete this step.';
 if(/refused/i.test(m))h='The device is reachable, but nothing is listening on that port. Enable the service on the device (for MikroTik: IP > Services > api) or use the correct port.';
 else if(/timeout|ETIMEDOUT|EHOSTUNREACH|ENETUNREACH|EHOST|ENET/i.test(m))h='No answer. Check the IP address, that this computer can reach it (same network or VPN), that no firewall drops the port, and that the service on the device allows this computer address (Available From).';
 else if(/login|password|invalid user|cannot log/i.test(m))h='The router answered, but it did not accept the username or password. Also make sure the user group has api permission.';
 else if(/closed/i.test(m))h='The router closed the connection. Check the user permissions and the api service settings.';
 return '<div class="x3er"><b>'+E(m||'Unknown error')+'</b><br>'+h+'</div><div class="x3row">'+(extra||'<button class="x3b" onclick="x3Retry()">Edit router details</button>')+'</div>'}
async function doConnect(reuse){S.st='conn';
 shell(say('Connecting to your router. I check everything step by step, like a network engineer would.')+checklist(['Saving router details','Checking that port '+D.port+' is open on '+D.ip,'Logging in with your username and password','Reading router information'])+'<div class="x3res" id="x3r"></div>');
 try{
  ci(0,'run');await sleep(500);
  if(!reuse){
   var body={name:D.name||('MikroTik '+D.ip),kind:'MikroTik',method:'api',ip:D.ip,port:D.port,user:D.user,pass:D.pass,note:'Added by migration assistant'};
   if(S.exist){await api('admin/netdevices/'+S.exist.id,'PUT',body);S.devId=S.exist.id}
   else{var r0=await api('admin/netdevices','POST',body);S.devId=r0.id;S.exist={id:S.devId}}
  }
  S.rt={ip:D.ip,port:D.port,user:D.user,name:D.name};
  ci(0,'ok');ci(1,'run');await sleep(400);
  var n=await api('admin/nettest/'+S.devId,'POST',{});
  if(!n.ok){ci(1,'err');var r1=$$('x3r');if(r1)r1.innerHTML=failBox(n.msg);return}
  ci(1,'ok');ci(2,'run');await sleep(350);
  var t=await api('admin/mwtest/'+S.devId,'POST',{});
  if(!t.ok){ci(2,'err');var r2=$$('x3r');if(r2)r2.innerHTML=failBox(t.msg);return}
  ci(2,'ok');ci(3,'run');await sleep(450);ci(3,'ok',String(t.msg||'').replace('Connected and logged in. ',''));
  var r4=$$('x3r');if(r4)r4.innerHTML='<div class="x3ok">Connected to your router. '+E(t.msg)+'</div>';
  await sleep(1500);if(S.st==='conn')vOther();
 }catch(e){if(e.message==='auth')return;ci(1,'err');var r3=$$('x3r');if(r3)r3.innerHTML=failBox(e.message)}}

/* ---------- optional devices ---------- */
function vOther(){S.st='other';
 var list=S.others.map(function(o){return '<span class="x3chip'+(o.ok?' ok':'')+'">'+E(o.name)+' ('+E(o.kind)+') - '+E(o.note)+'</span>'}).join('');
 shell(say(S.others.length?'Added. Do you have another device (OLT, switch...)?':'Router connected. Do you also have an OLT, a switch or any other device? This is optional.')+'<div class="x3ind">'+list+'</div><div class="x3row"><button class="x3b" onclick="x3Sync()">'+(S.others.length?'That is all, continue':'No, continue')+'</button><button class="x3b g" onclick="x3Form()">Add a device</button></div>')}
window.vOther=vOther;
window.x3Form=function(){resetD('OLT');dAsk()};
window.dSaveOther=async function(){
 try{toast('Saving and testing...');
  var body={name:D.name||(D.kind+' '+D.ip),kind:D.kind,method:D.service,ip:D.ip,port:D.port,user:D.user,pass:D.pass,community:D.community};
  var r=await api('admin/netdevices','POST',body);var t=await api('admin/mwtest/'+r.id,'POST',{});
  var nl=(D.service==='ssh'||D.service==='telnet'||D.service==='http'||D.service==='https'||D.service==='apissl')?', login not tested':'';
  var note=t.ok?('port '+D.port+' is open'+nl):(t.skip?'saved, SNMP cannot be tested yet':'saved, not reachable ('+(t.msg||'no answer')+')');
  S.others.push({name:body.name,kind:D.kind,ok:!!t.ok||!!t.skip,note:note});vOther()}
 catch(e){if(e.message!=='auth')toast(e.message,1)}};
/* ---------- 4. sync ---------- */
window.x3Sync=function(){vSync()};
function autoMap(){S.pkk.forEach(function(k){var c=S.pk[k];if(c.profile)return;
 var l=k.toLowerCase().replace(/\s+/g,''),p=S.cat.profiles.filter(function(x){return x.name.toLowerCase().replace(/\s+/g,'')===l})[0];
 if(!p&&c.speed)p=S.cat.profiles.filter(function(x){return spd(x.name)===c.speed})[0];
 if(p){c.profile=p.name;c.pool=p.pool}})}
async function vSync(){S.st='sync';
 shell(say('Now I read the IP pools and profiles that already exist on your router. I only read. I never create anything there.')+checklist(['Reading IP pools','Reading PPPoE profiles','Matching packages with profiles'])+'<div class="x3res" id="x3r"></div>');
 try{ci(0,'run');var c=await api('admin/mtcat');await sleep(500);
  if(!c.ok)throw new Error(c.msg||'Router not reachable');
  ci(0,'ok');ci(1,'run');await sleep(500);ci(1,'ok');ci(2,'run');S.cat=c;autoMap();await sleep(600);ci(2,'ok');await sleep(500);vMatch()}
 catch(e){if(e.message==='auth')return;ci(0,'err');var r=$$('x3r');if(r)r.innerHTML=failBox(e.message,'<button class="x3b" onclick="x3Sync()">Try again</button><button class="x3b g" onclick="x3Retry()">Change router</button>')}}
function matchTable(){return '<table class="x3t2"><tr><th></th><th>Package</th><th>Users</th><th>Router profile</th><th>IP pool</th><th>Rate</th></tr>'+S.pkk.map(function(k,i){var c=S.pk[k],pr=S.cat.profiles.filter(function(x){return x.name===c.profile})[0]||{};
 return '<tr><td>'+(c.profile?'<i class="x3tk"></i>':'<i class="x3wr"></i>')+'</td><td>'+E(k)+'</td><td>'+c.n+'</td><td><select onchange="x3Sel('+i+',this.value)"><option value="">- choose -</option>'+S.cat.profiles.map(function(p){return '<option value="'+E2(p.name)+'"'+(p.name===c.profile?' selected':'')+'>'+E(p.name)+'</option>'}).join('')+'</select></td><td>'+E(c.pool||'-')+'</td><td>'+E(pr.rate||'-')+'</td></tr>'}).join('')+'</table>'}
function vMatch(){S.st='sync';var un=S.pkk.filter(function(k){return !S.pk[k].profile}).length;
 shell(say('I found '+S.cat.pools.length+' IP pools and '+S.cat.profiles.length+' profiles on your router. '+(un?'I matched '+(S.pkk.length-un)+' package(s) by myself. Please pick the profile for the rest.':'I matched every package with a router profile by myself. Please have a quick look.'))
 +'<div class="x3card"><div id="x3tb">'+matchTable()+'</div></div><div class="x3row"><button class="x3b g" onclick="x3Retry()">Change router</button><button class="x3b" onclick="x3Start()">Looks good, import now</button></div>')}
window.x3Sel=function(i,v){var c=S.pk[S.pkk[i]],p=S.cat.profiles.filter(function(x){return x.name===v})[0];c.profile=v;c.pool=p?p.pool:'';var t=$$('x3tb');if(t)t.innerHTML=matchTable()};
window.x3Start=function(){for(var i=0;i<S.pkk.length;i++){if(!S.pk[S.pkk[i]].profile){toast('Choose the router profile for '+S.pkk[i],1);return}}S.log=[];S.pct=0;vRun()};

/* ---------- 5. import and check ---------- */
function prog(p,t,cls){S.pct=p;if(t)S.log.push({t:t,c:cls||''});
 var b=$$('x3bar');if(b){b.style.width=p+'%';var pc=$$('x3p');if(pc)pc.textContent=Math.round(p)+'%'}
 if(t){var l=$$('x3l');if(l){l.insertAdjacentHTML('beforeend','<div'+(cls?' class="'+cls+'"':'')+'>$ '+E(t)+'</div>');l.scrollTop=l.scrollHeight}}}
function vRun(){S.st='run';
 shell(say('Importing everything now and checking it against your router. You do not need to do anything.')+'<div class="x3card"><div class="x3pb"><div id="x3bar"></div></div><div class="x3pc" id="x3p">0%</div><div class="x3term" id="x3l"></div><div id="x3rr"></div></div>');
 var l=$$('x3l');if(l){l.innerHTML=S.log.map(function(x){return '<div'+(x.c?' class="'+x.c+'"':'')+'>$ '+E(x.t)+'</div>'}).join('');l.scrollTop=l.scrollHeight}
 var b=$$('x3bar');if(b){b.style.width=S.pct+'%';$$('x3p').textContent=Math.round(S.pct)+'%'}
 if(!S.running)x3Run()}
window.x3Run=async function(){
 if(S.running)return;S.running=true;S.log=[];S.pct=0;
 var rr=$$('x3rr');if(rr)rr.innerHTML='';var l0=$$('x3l');if(l0)l0.innerHTML='';
 try{
  prog(2,'Starting import');
  prog(4,'Creating zones and subzones');
  var Z=await api('admin/zones');Z=Array.isArray(Z)?Z:[];var zid={};
  for(var zn of Object.keys(S.zones)){
   var t=Z.filter(function(z){return !z.parent&&String(z.name).toLowerCase()===zn.toLowerCase()})[0];
   if(!t){var r1=await api('admin/zones','POST',{name:zn,parent:''});t={id:r1.id,name:zn};Z.push(t)}
   zid[zn]=t.id;
   for(var sn of Object.keys(S.zones[zn])){
    var s=Z.filter(function(z){return z.parent===t.id&&String(z.name).toLowerCase()===sn.toLowerCase()})[0];
    if(!s){var r2=await api('admin/zones','POST',{name:sn,parent:t.id});s={id:r2.id,parent:t.id,name:sn};Z.push(s)}
    zid[zn+'|'+sn]=s.id}}
  prog(8,'Zones ready: '+Object.keys(zid).length,'g');
  prog(10,'Creating packages');
  var P0=await api('admin/packages');P0=Array.isArray(P0)?P0:[];var pid={};
  for(var k of S.pkk){var c=S.pk[k],p=P0.filter(function(x){return String(x.name).toLowerCase()===k.toLowerCase()})[0];
   if(!p){var r3=await api('admin/packages','POST',{name:k,speed:Number(c.speed)||0,price:Number(c.price),desc:'Imported from file',profile:c.profile,pool:c.pool});p={id:r3.id}}
   pid[k]=p.id}
  prog(15,'Packages ready: '+S.pkk.length,'g');
  var skipped=0,B=200,i;
  for(i=0;i<S.rows.length;i+=B){var part=S.rows.slice(i,i+B);
   var x=await api('admin/customers/import','POST',{mode:'skip',invoice:false,rows:part.map(function(r){return {username:r.user.toLowerCase(),name:r.name,phone:r.phone,address:r.addr,packageId:pid[r.pkg]||''}})});
   skipped+=(x.skipped||[]).length;prog(15+Math.min(i+B,S.rows.length)/S.rows.length*30,'Imported customers '+Math.min(i+B,S.rows.length)+' of '+S.rows.length)}
  var C=await api('admin/customers'),by={};C.forEach(function(c2){by[String(c2.username).toLowerCase()]=c2});
  var todo=S.rows.filter(function(r){return by[r.user.toLowerCase()]}),fail=0,firstErr='';
  for(i=0;i<todo.length;i+=6){
   await Promise.all(todo.slice(i,i+6).map(async function(r){var cu=by[r.user.toLowerCase()];
    try{await api('admin/customers/'+cu.id,'PUT',{pppUser:r.user,pppPass:r.pass,mac:r.mac,ip:r.ip});
     var zs=r.zone?(zid[r.zone]||''):'',ss=(r.zone&&r.sub)?(zid[r.zone+'|'+r.sub]||''):'';
     if(zs)await api('admin/cmeta','POST',{customerId:cu.id,zone:zs,sub:ss,type:'home'})}
    catch(e){fail++;if(!firstErr)firstErr=e.message}}));
   prog(45+Math.min(i+6,todo.length)/todo.length*20,'Saving PPPoE details '+Math.min(i+6,todo.length)+' of '+todo.length)}
  prog(66,'Reading users from MikroTik (read only)');
  var U=await api('admin/mwusers');if(!U.ok)throw new Error(U.msg||'Could not read router users');
  var set={};U.names.forEach(function(n){set[String(n).toLowerCase()]=1});
  var miss=[],found=0,step=Math.max(1,Math.ceil(S.rows.length/40));
  for(i=0;i<S.rows.length;i+=step){S.rows.slice(i,i+step).forEach(function(r){if(set[r.user.toLowerCase()])found++;else miss.push(r.user)});
   prog(66+Math.min(i+step,S.rows.length)/S.rows.length*20,'Checking users '+Math.min(i+step,S.rows.length)+' of '+S.rows.length);await sleep(40)}
  prog(88,'Creating a temporary test user on the router for each profile');
  var profs=[];S.pkk.forEach(function(k2){var f=S.pk[k2].profile;if(f&&profs.indexOf(f)<0)profs.push(f)});
  var T=await api('admin/mwuser/'+S.devId,'POST',{profiles:profs});
  if(!T.ok)throw new Error(T.msg||'Test user failed');
  T.results.forEach(function(t2){prog(95,(t2.ok?'Test user OK on profile ':'Test FAILED on profile ')+t2.profile+(t2.err?': '+t2.err:'')+(t2.ok?' (deleted)':''),t2.ok?'g':'e')});
  S.res={found:found,miss:miss,tests:T.results,fail:fail,firstErr:firstErr,skipped:skipped};
  prog(100,'Everything is checked','g');
  S.running=false;await sleep(1500);if(S.st==='run')vDone();
 }catch(e){S.running=false;if(e.message==='auth')return;prog(S.pct,'Stopped: '+e.message,'e');
  var r9=$$('x3rr');if(r9)r9.innerHTML='<div class="x3er">The import stopped: '+E(e.message)+'. Nothing is duplicated if you try again.</div><div class="x3row"><button class="x3b" onclick="x3Run()">Try again</button></div>'}};

/* ---------- 6. done ---------- */
function vDone(){S.st='done';
 shell('<div class="x3win"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24"/><path d="M14 27l8 8 16-17"/></svg></div>'+say('All done. Your migration is complete and checked.')+'<div id="x3sum"></div>');
 api('admin/mwsummary').then(function(r){var res=S.res,okT=res?res.tests.filter(function(t){return t.ok}).length:0;
  var h='<div class="x3st"><div><b>'+r.customers+'</b><span>Customers</span></div><div><b>'+r.withPpp+'</b><span>With PPPoE user</span></div><div><b>'+(res?res.found:'-')+'</b><span>Found on router</span></div><div><b>'+(res?okT+'/'+res.tests.length:'-')+'</b><span>Test user passed</span></div></div>'
  +'<div class="x3card"><b>Devices</b><table class="x3t2"><tr><th>Device</th><th>Type</th><th>Status</th><th>Router users</th><th>Online now</th></tr>'+r.devices.map(function(d){return '<tr><td>'+E(d.name)+(d.identity?'<br><small>'+E(d.identity)+'</small>':'')+'</td><td>'+E(d.kind)+'</td><td>'+(d.connected?'<span style="color:#19f5a6">Connected</span>':'<span style="color:#ff6b86">Not connected</span>')+'</td><td>'+(d.secrets==null?'-':d.secrets)+'</td><td>'+(d.online==null?'-':d.online)+'</td></tr>'}).join('')+'</table></div>'
  +'<div class="x3card"><b>Customers by package</b><table class="x3t2"><tr><th>Package</th><th>Customers</th></tr>'+Object.keys(r.byPackage).map(function(k){return '<tr><td>'+E(k)+'</td><td>'+r.byPackage[k]+'</td></tr>'}).join('')+'</table></div>';
  if(res&&res.miss.length)h+='<div class="x3card">'+res.miss.length+' user(s) from your file are not on the router yet (for example: '+E(res.miss.slice(0,5).join(', '))+'). I did not create them there. Open the customer and press <b>Push to Router</b> when you want it created.</div>';
  if(res&&res.fail)h+='<div class="x3card">'+res.fail+' customer(s) could not get their PPPoE details saved'+(res.firstErr?' ('+E(res.firstErr)+')':'')+'.</div>';
  h+='<div class="x3ind"><div class="x3row"><a class="x3b" href="#customers">View customers</a><button class="x3b g" onclick="x3Again()">Import another file</button></div></div>';
  var s=$$('x3sum');if(s)s.innerHTML=h}).catch(function(e){if(e.message!=='auth')toast(e.message,1)})}
window.x3Again=function(){S.rows=[];S.pkk=[];S.pk={};S.zones={};S.cat=null;S.res=null;S.others=[];S.log=[];S.pct=0;vUpload()};

function render(){
 if(S.st==='upload')vUpload();
 else if(S.st==='scan')afterScan();
 else if(S.st==='prices')vPrice();
 else if(S.st==='router'||S.st==='conn')vRouter();
 else if(S.st==='other')vOther();
 else if(S.st==='sync')vSync();
 else if(S.st==='run')vRun();
 else if(S.st==='done')vDone();
 else vUpload()}
V.hub=function(){render();return Promise.resolve()};
if(typeof go==='function'&&location.hash==='#hub')go();
})();