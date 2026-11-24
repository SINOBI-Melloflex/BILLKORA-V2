/* BillKora wizard2.js: 6-step Migration Wizard. Loads last. */
(function(){
var $$=function(i){return document.getElementById(i)};
var S={step:1,rows:[],pkk:[],pk:{},zones:{},mtId:'',mtOk:false,tm:{},cat:null,res:null,running:false,fname:'',bad:0};
var STEPS=[['File','Upload customers'],['Zones & Packages','Set prices'],['Devices','MikroTik / OLT'],['Router Sync','Pools & profiles'],['Check','Import & test'],['Done','Summary']];
var st=document.createElement('style');
st.textContent='.w2b{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px}.w2s{flex:1;min-width:140px;display:flex;gap:10px;align-items:center;padding:11px 13px;border-radius:14px;background:#fff;border:1px solid #d9e2f3}.w2s span{width:28px;height:28px;border-radius:50%;background:#eef3ff;color:#1e6bff;display:flex;align-items:center;justify-content:center;font-weight:700}.w2s.on{background:linear-gradient(135deg,#1e6bff,#4a8dff);color:#fff;border-color:transparent}.w2s.on span{background:#fff}.w2s.dn span{background:#17b890;color:#fff}.w2s b{display:block;font-size:13px}.w2s small{opacity:.7;font-size:11px}'
+'.w2g{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin:10px 0}.w2g label{font-size:12px;color:#7a89a8;display:block;margin-bottom:3px}.w2g input,.w2g select{width:100%}'
+'.w2pb{height:14px;border-radius:8px;background:#e6ecf7;overflow:hidden;margin-top:8px}.w2pb div{height:100%;width:0;background:linear-gradient(90deg,#1e6bff,#17b890);transition:width .25s}.w2l{max-height:210px;overflow:auto;font-size:12.5px;line-height:1.7;margin-top:10px;font-family:Consolas,monospace}.w2l .e{color:#d33}.w2l .g{color:#17916f}'
+'.w2n{background:#eef5ff;border:1px solid #cfe0ff;color:#1f3f7a;padding:10px 14px;border-radius:10px;margin:10px 0;font-size:13px;line-height:1.6}.w2n.w{background:#fff6e5;border-color:#f3d89b;color:#7a5200}.w2chip{display:inline-block;background:#eef3ff;border-radius:20px;padding:3px 10px;margin:3px;font-size:12.5px}'
+'body.dark .w2s{background:#14213d;color:#dbe6ff;border-color:#2a3a5c}body.dark .w2n{background:#14213d;border-color:#2a3a5c;color:#dbe6ff}';
document.head.appendChild(st);

var COLS={name:['customername','fullname','name','customer'],phone:['phone','mobile'],user:['pppoeusername','username','login','pppoe'],pass:['pppoepassword','password','pass'],pkg:['package','profile','plan'],bill:['monthlybill','bill','price','amount'],due:['previousdue','due'],sub:['subzone'],zone:['zone','area'],addr:['address'],ip:['ipaddress','ip'],mac:['macaddress','mac']};
var ORDER=['user','pass','name','phone','pkg','bill','due','sub','zone','addr','ip','mac'];
var LAB={name:'Customer name',phone:'Phone',user:'PPPoE username',pkg:'Package'};
function spd(n){return parseInt(String(n).replace(/[^0-9]/g,''),10)||0}

window.w2File=function(inp){
 var f=inp.files[0];if(!f)return;
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
  if(miss.length){toast('Column missing in your file: '+miss.join(', ')+'. Use the demo file layout.',1);return}
  var g=function(r,k){return m[k]>=0?String(r[m[k]]==null?'':r[m[k]]).trim():''},seen={},rows=[],bad=0;
  a.slice(1).forEach(function(r){
   var u=g(r,'user'),p=g(r,'pkg'),ph=g(r,'phone');
   if(!u||!p||seen[u.toLowerCase()]){bad++;return}
   seen[u.toLowerCase()]=1;if(/^1[3-9]\d{8}$/.test(ph))ph='0'+ph;
   rows.push({name:g(r,'name')||u,phone:ph,user:u,pass:g(r,'pass'),pkg:p,bill:Number(g(r,'bill'))||0,zone:g(r,'zone'),sub:g(r,'sub'),addr:g(r,'addr'),ip:g(r,'ip'),mac:g(r,'mac')})});
  if(!rows.length){toast('No usable rows (each needs a PPPoE username and a package)',1);return}
  S.rows=rows;S.bad=bad;S.fname=f.name;S.pk={};S.pkk=[];S.zones={};S.cat=null;S.res=null;
  var cnt={};
  rows.forEach(function(x){
   if(!S.pk[x.pkg]){S.pk[x.pkg]={n:0,price:'',speed:spd(x.pkg),profile:'',pool:''};S.pkk.push(x.pkg);cnt[x.pkg]={}}
   S.pk[x.pkg].n++;if(x.bill>0)cnt[x.pkg][x.bill]=(cnt[x.pkg][x.bill]||0)+1;
   if(x.zone){S.zones[x.zone]=S.zones[x.zone]||{};if(x.sub)S.zones[x.zone][x.sub]=1}});
  S.pkk.forEach(function(k){var best=0,bc=0;Object.keys(cnt[k]).forEach(function(v){if(cnt[k][v]>bc){bc=cnt[k][v];best=v}});S.pk[k].price=best||''});
  body();
 }catch(e){toast('Could not read this file: '+e.message,1)}};
 if(csv)r.readAsText(f);else r.readAsArrayBuffer(f)};

function bar(){return '<div id="wzbar" style="display:none"></div><div class="w2b">'+STEPS.map(function(s,i){var n=i+1;return '<div class="w2s'+(S.step===n?' on':(S.step>n?' dn':''))+'"><span>'+(S.step>n?'&#10003;':n)+'</span><div><b>'+s[0]+'</b><small>'+s[1]+'</small></div></div>'}).join('')+'</div>'}
function draw(){P('Migration & Network Devices',bar()+'<div id="w2c"></div>');body()}
function put(h){var c=$$('w2c');if(c){c.innerHTML=h;icons()}}
window.w2Go=function(n){
 if(n>S.step){
  if(S.step===1&&!S.rows.length){toast('Upload your file first',1);return}
  if(S.step===2){for(var i=0;i<S.pkk.length;i++){if(!(Number(S.pk[S.pkk[i]].price)>0)){toast('Enter the monthly bill for '+S.pkk[i],1);return}}}
  if(S.step===3&&!S.mtOk){toast('Add your MikroTik and press Test until it connects',1);return}
  if(S.step===4){for(var j=0;j<S.pkk.length;j++){if(!S.pk[S.pkk[j]].profile){toast('Choose the router profile for '+S.pkk[j],1);return}}}
 }
 S.step=n;draw()};
function nav(b,nx,lbl){return '<div class="bar2" style="margin-top:14px">'+(b?'<button class="btn o2" onclick="w2Go('+b+')">Back</button>':'')+(nx?'<button class="btn" onclick="w2Go('+nx+')">'+lbl+'</button>':'')+'</div>'}

function s1(){
 var h='<div class="card"><h3>Step 1: Upload your customer file</h3><p class="muted" style="margin:6px 0 12px;line-height:1.6">Download the demo file, put your users in the same layout (or export from your old software) and upload it. BillKora reads the users, packages, zones and subzones from it. Nothing is saved yet.</p><div class="bar2"><button class="btn o2" onclick="wzDemo()">Download demo Excel file</button><input id="w2f" type="file" accept=".xlsx,.xls,.csv" style="display:none" onchange="w2File(this)"><button class="btn" onclick="document.getElementById(\'w2f\').click()">Choose Excel / CSV file</button></div></div>';
 if(S.rows.length){
  var zc=Object.keys(S.zones).length;
  h+='<div class="grid" style="margin-top:16px">'+stat('users','Users found',S.rows.length)+stat('box','Packages found',S.pkk.length)+stat('pin','Zones found',zc)+'</div>';
  h+='<div class="card" style="margin-top:16px"><h3>Preview</h3><p class="muted" style="margin:4px 0 10px">'+esc(S.fname)+(S.bad?' - '+S.bad+' rows ignored (no username, no package, or repeated username)':'')+'</p>'+tbl(['Name','PPPoE user','Package','Zone','IP'],S.rows.slice(0,6).map(function(r){return [esc(r.name),esc(r.user),esc(r.pkg),esc(r.zone+(r.sub?' > '+r.sub:'')),esc(r.ip)]}))+nav(0,2,'Next: Zones & Packages')+'</div>';
 }
 put(h)}

window.w2P=function(i,f,v){S.pk[S.pkk[i]][f]=f==='price'||f==='speed'?(Number(v)||''):v};
function s2(){
 var zs=Object.keys(S.zones);
 var h='<div class="card"><h3>Step 2: Packages and monthly bill</h3><p class="muted" style="margin:6px 0 12px">Packages were taken from your file. Check the price (we suggest the most common bill in your file). The IP pool is chosen in step 4 from your router.</p>'
 +tbl(['Package','Users','Speed (Mbps)','Monthly bill (taka)'],S.pkk.map(function(k,i){var c=S.pk[k];return [esc(k),c.n,'<input type="number" min="0" value="'+esc(c.speed||'')+'" oninput="w2P('+i+',\'speed\',this.value)" style="width:100px">','<input type="number" min="1" value="'+esc(c.price||'')+'" oninput="w2P('+i+',\'price\',this.value)" style="width:130px">']}))+'</div>'
 +'<div class="card" style="margin-top:16px"><h3>Zones and subzones</h3><p class="muted" style="margin:6px 0 8px">These come from your file and will be created if they do not exist.</p>'
 +(zs.length?zs.map(function(z){return '<div style="margin:6px 0"><b>'+esc(z)+'</b> '+(Object.keys(S.zones[z]).map(function(s){return '<span class="w2chip">'+esc(s)+'</span>'}).join('')||'<small class="muted">no subzones</small>')+'</div>'}).join(''):'<p class="muted">No zones in the file. Customers will have no zone.</p>')
 +nav(1,3,'Next: Devices')+'</div>';
 put(h)}

window.w2Dev=function(){
 var g=function(i){return $$(i).value.trim()};
 var d={name:g('w2n'),kind:g('w2k'),method:g('w2m'),ip:g('w2i'),port:g('w2p'),user:g('w2u'),pass:$$('w2pw').value,community:g('w2c'),note:g('w2o')};
 if(!d.name||!d.ip){toast('Device name and IP are required',1);return}
 api('admin/netdevices','POST',d).then(function(){toast('Device added. Now press Test.');body()}).catch(function(e){if(e.message!=='auth')toast(e.message,1)})};
window.w2DevDel=function(id){sure('Delete this device?',function(){api('admin/netdevices/'+id,'DELETE').then(function(){if(S.mtId===id){S.mtId='';S.mtOk=false}body()}).catch(function(e){if(e.message!=='auth')toast(e.message,1)})})};
window.w2Test=function(id,kind){toast('Testing...');
 api('admin/mwtest/'+id,'POST',{}).then(function(r){S.tm[id]=r.msg;if(r.ok&&kind==='MikroTik'){S.mtId=id;S.mtOk=true}toast(r.msg,!r.ok);body()}).catch(function(e){if(e.message!=='auth')toast(e.message,1)})};
function s3(){
 api('admin/netdevices').then(function(L){L=Array.isArray(L)?L:[];
  if(S.mtId&&!L.some(function(d){return d.id===S.mtId})){S.mtId='';S.mtOk=false}
  var h='<div class="card"><h3>Step 3: Network devices</h3><div class="w2n">MikroTik is required. OLT, Switch and others are optional. BillKora only reads from your router. The only thing it ever writes is the PPPoE user of a customer you add, plus one temporary test user that is deleted at once.</div>'
  +tbl(['Name','Type','Method','IP : Port','Result','Actions'],L.map(function(d){return [esc(d.name),esc(d.kind),esc(d.method),esc(d.ip)+' : '+esc(d.port),(S.mtId===d.id?'<span class="bd l">Connected</span> ':bdg(d.status==='unknown'?'pending':d.status))+(S.tm[d.id]?'<small class="muted" style="display:block">'+esc(S.tm[d.id])+'</small>':''),'<div class="act"><button class="btn sm o2" onclick="w2Test(\''+d.id+'\',\''+esc(d.kind)+'\')">Test</button><button class="btn sm red" onclick="w2DevDel(\''+d.id+'\')">Delete</button></div>']}))
  +'<h4 style="margin:16px 0 4px">Add a device</h4><div class="w2g">'
  +'<div><label>Device name</label><input id="w2n" placeholder="e.g. Main Router"></div>'
  +'<div><label>Type</label><select id="w2k"><option>MikroTik</option><option>OLT</option><option>Switch</option><option>Other</option></select></div>'
  +'<div><label>Connection method</label><select id="w2m"><option value="api">API (recommended)</option><option value="ssh">SSH</option><option value="telnet">Telnet</option><option value="snmp">SNMP</option></select></div>'
  +'<div><label>IP address / host</label><input id="w2i"></div>'
  +'<div><label>Port</label><input id="w2p" placeholder="blank = API 8728, SSH 22, Telnet 23, SNMP 161"></div>'
  +'<div><label>Username</label><input id="w2u"></div>'
  +'<div><label>Password</label><input id="w2pw" type="password"></div>'
  +'<div><label>SNMP community (SNMP only)</label><input id="w2c" placeholder="e.g. public"></div>'
  +'<div><label>Note</label><input id="w2o"></div></div>'
  +'<div class="bar2"><button class="btn" onclick="w2Dev()"><i data-i="plus"></i> Add Device</button></div>'
  +'<div class="w2n w">On the MikroTik: IP &gt; Services &gt; api must be enabled, and the user needs read and write permission.</div>'
  +nav(2,4,'Next: Router Sync')+'</div>';
  put(h)}).catch(function(e){if(e.message!=='auth')toast(e.message,1)})}

function autoMap(){S.pkk.forEach(function(k){var c=S.pk[k];if(c.profile)return;var l=k.toLowerCase().replace(/\s+/g,''),p=S.cat.profiles.filter(function(x){return x.name.toLowerCase().replace(/\s+/g,'')===l})[0];
 if(!p&&c.speed)p=S.cat.profiles.filter(function(x){return spd(x.name)===c.speed})[0];
 if(p){c.profile=p.name;c.pool=p.pool}})}
window.w2Read=function(){toast('Reading your router (read only)...');
 api('admin/mtcat').then(function(c){if(!c.ok){toast(c.msg||'Router not reachable',1);return}S.cat=c;autoMap();body()}).catch(function(e){if(e.message!=='auth')toast(e.message,1)})};
window.w2M=function(i,v){var c=S.pk[S.pkk[i]],p=S.cat.profiles.filter(function(x){return x.name===v})[0];c.profile=v;c.pool=p?p.pool:'';body()};
function s4(){
 var h='<div class="card"><h3>Step 4: Read pools and profiles from MikroTik</h3><div class="w2n">BillKora never creates pools or profiles on your router. It reads what already exists. Each package must use a profile that is already on the router, and the pool comes from that profile.</div><div class="bar2"><button class="btn" onclick="w2Read()"><i data-i="ref"></i> '+(S.cat?'Read again':'Read from MikroTik')+'</button></div>';
 if(S.cat){
  h+='<h4 style="margin:14px 0 6px">Match packages with router profiles</h4>'+tbl(['Package','Router profile','IP pool','Rate limit'],S.pkk.map(function(k,i){var c=S.pk[k],pr=S.cat.profiles.filter(function(x){return x.name===c.profile})[0]||{};
   return [esc(k),'<select onchange="w2M('+i+',this.value)"><option value="">- choose profile -</option>'+S.cat.profiles.map(function(p){return '<option value="'+esc(p.name)+'"'+(p.name===c.profile?' selected':'')+'>'+esc(p.name)+'</option>'}).join('')+'</select>',esc(c.pool||'-'),esc(pr.rate||'-')]}))
  +'<h4 style="margin:14px 0 6px">IP pools on your router ('+S.cat.pools.length+')</h4>'+tbl(['Pool','Ranges'],S.cat.pools.map(function(p){return [esc(p.name),esc(p.ranges)]}));
 }
 h+=nav(3,S.cat?5:0,'Next: Check')+'</div>';put(h)}

function prog(p,t,cls){var b=$$('w2bar');if(!b)return;b.style.width=p+'%';$$('w2pct').textContent=Math.round(p)+'%';
 if(t){var l=$$('w2log');l.insertAdjacentHTML('beforeend','<div'+(cls?' class="'+cls+'"':'')+'>'+esc(t)+'</div>');l.scrollTop=l.scrollHeight}}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
function s5(){
 var h='<div class="card"><h3>Step 5: Import and check</h3><p class="muted" style="margin:6px 0 10px;line-height:1.6">This will: create zones and packages, import <b>'+S.rows.length+'</b> customers, compare every user with your router (read only), then create one temporary test user on the router for each profile and delete it immediately.</p>'
 +'<div class="bar2"><button class="btn o2" onclick="w2Go(4)">Back</button><button class="btn" id="w2go" onclick="w2Run()">'+(S.res?'Run again':'Start import and check')+'</button></div>'
 +'<div class="w2pb"><div id="w2bar"></div></div><div style="text-align:right;font-size:12px" id="w2pct">0%</div><div class="w2l" id="w2log"></div><div id="w2res"></div></div>';
 put(h);if(S.res)showRes()}
function showRes(){var r=S.res;if(!r)return;
 var okT=r.tests.filter(function(t){return t.ok}).length;
 $$('w2res').innerHTML='<div class="grid" style="margin-top:14px">'+stat('users','Customers in file',S.rows.length)+stat('check','Found on router',r.found)+stat('alert','Not on router',r.miss.length)+stat('server','Test user OK',okT+' / '+r.tests.length)+'</div>'
 +(r.miss.length?'<div class="w2n w">'+r.miss.length+' users are in your file but not on the router yet (for example: '+esc(r.miss.slice(0,5).join(', '))+'). Nothing was created on the router. Open a customer and press <b>Push to Router</b> when you want it created.</div>':'<div class="w2n">All users in your file exist on the router.</div>')
 +(r.fail?'<div class="w2n w">'+r.fail+' customers could not get their PPPoE details saved'+(r.firstErr?' ('+esc(r.firstErr)+')':'')+'.</div>':'')
 +(r.skipped?'<div class="w2n">'+r.skipped+' customers already existed and were kept as they were.</div>':'')
 +'<div class="bar2" style="margin-top:12px"><button class="btn" onclick="w2Go(6)">Finish</button></div>'}
window.w2Run=async function(){
 if(S.running)return;S.running=true;$$('w2go').disabled=true;$$('w2log').innerHTML='';$$('w2res').innerHTML='';
 try{
  prog(2,'Creating zones...');
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
  prog(10,'Creating packages...');
  var P0=await api('admin/packages');P0=Array.isArray(P0)?P0:[];var pid={};
  for(var k of S.pkk){var c=S.pk[k],p=P0.filter(function(x){return String(x.name).toLowerCase()===k.toLowerCase()})[0];
   if(!p){var r3=await api('admin/packages','POST',{name:k,speed:Number(c.speed)||0,price:Number(c.price),desc:'Imported from file',profile:c.profile,pool:c.pool});p={id:r3.id}}
   pid[k]=p.id}
  prog(15,'Packages ready: '+S.pkk.length,'g');
  var skipped=0,B=200,i;
  for(i=0;i<S.rows.length;i+=B){var part=S.rows.slice(i,i+B);
   var x=await api('admin/customers/import','POST',{mode:'skip',invoice:false,rows:part.map(function(r){return {username:r.user.toLowerCase(),name:r.name,phone:r.phone,address:r.addr,packageId:pid[r.pkg]||''}})});
   skipped+=(x.skipped||[]).length;prog(15+Math.min(i+B,S.rows.length)/S.rows.length*30,'Imported '+Math.min(i+B,S.rows.length)+' of '+S.rows.length)}
  var C=await api('admin/customers'),by={};C.forEach(function(c2){by[String(c2.username).toLowerCase()]=c2});
  var todo=S.rows.filter(function(r){return by[r.user.toLowerCase()]}),fail=0,firstErr='';
  for(i=0;i<todo.length;i+=6){
   await Promise.all(todo.slice(i,i+6).map(async function(r){var cu=by[r.user.toLowerCase()];
    try{await api('admin/customers/'+cu.id,'PUT',{pppUser:r.user,pppPass:r.pass,mac:r.mac,ip:r.ip});
     var zs=r.zone?(zid[r.zone]||''):'',ss=(r.zone&&r.sub)?(zid[r.zone+'|'+r.sub]||''):'';
     if(zs)await api('admin/cmeta','POST',{customerId:cu.id,zone:zs,sub:ss,type:'home'})}
    catch(e){fail++;if(!firstErr)firstErr=e.message}}));
   prog(45+Math.min(i+6,todo.length)/todo.length*20,'Saving PPPoE details '+Math.min(i+6,todo.length)+' of '+todo.length)}
  prog(66,'Reading users from MikroTik (read only)...');
  var U=await api('admin/mwusers');if(!U.ok)throw new Error(U.msg||'Could not read router users');
  var set={};U.names.forEach(function(n){set[String(n).toLowerCase()]=1});
  var miss=[],found=0,step=Math.max(1,Math.ceil(S.rows.length/40));
  for(i=0;i<S.rows.length;i+=step){S.rows.slice(i,i+step).forEach(function(r){if(set[r.user.toLowerCase()])found++;else miss.push(r.user)});
   prog(66+Math.min(i+step,S.rows.length)/S.rows.length*20,'Checking users '+Math.min(i+step,S.rows.length)+' of '+S.rows.length);await sleep(40)}
  prog(88,'Creating a temporary test user on the router for each profile...');
  var profs=[];S.pkk.forEach(function(k){var f=S.pk[k].profile;if(f&&profs.indexOf(f)<0)profs.push(f)});
  var T=await api('admin/mwuser/'+S.mtId,'POST',{profiles:profs});
  if(!T.ok)throw new Error(T.msg||'Test user failed');
  T.results.forEach(function(t){prog(95,(t.ok?'Test user OK on profile ':'Test FAILED on profile ')+t.profile+(t.err?': '+t.err:'')+(t.ok?' (deleted)':''),t.ok?'g':'e')});
  prog(100,'Done','g');
  S.res={found:found,miss:miss,tests:T.results,fail:fail,firstErr:firstErr,skipped:skipped};showRes();
 }catch(e){if(e.message!=='auth')prog(100,'Stopped: '+e.message+'. You can press the button to run again, nothing is duplicated.','e')}
 finally{S.running=false;var b=$$('w2go');if(b)b.disabled=false}};

function s6(){
 put('<div class="card"><h3>Loading summary...</h3></div>');
 api('admin/mwsummary').then(function(r){
  var h='<div class="grid">'+stat('users','Total customers',r.customers)+stat('wifi','With PPPoE user',r.withPpp)+stat('server','Devices',r.devices.length)+'</div>'
  +'<div class="card" style="margin-top:16px"><h3>Connected devices</h3>'+tbl(['Device','Type','IP','Status','Router users','Online now'],r.devices.map(function(d){return [esc(d.name)+(d.identity?'<small class="muted" style="display:block">'+esc(d.identity)+'</small>':''),esc(d.kind),esc(d.ip),d.connected?'<span class="bd l">Connected</span>':'<span class="bd r">Not connected</span>'+(d.err?'<small class="muted" style="display:block">'+esc(d.err)+'</small>':''),d.secrets==null?'-':d.secrets,d.online==null?'-':d.online]}))+'</div>'
  +'<div class="card" style="margin-top:16px"><h3>Customers by package</h3>'+tbl(['Package','Customers'],Object.keys(r.byPackage).map(function(k){return [esc(k),r.byPackage[k]]}))
  +'<div class="bar2" style="margin-top:14px"><a class="btn" href="#customers">View Customers</a><button class="btn o2" onclick="w2Again()">Import another file</button></div></div>';
  put(h)}).catch(function(e){if(e.message!=='auth')toast(e.message,1)})}
window.w2Again=function(){S.step=1;S.rows=[];S.pkk=[];S.pk={};S.zones={};S.cat=null;S.res=null;draw()};
function body(){var f=[null,s1,s2,s3,s4,s5,s6][S.step];if(f)f()}
V.hub=function(){draw();return Promise.resolve()};
if(typeof go==='function'&&location.hash==='#hub')go();
})();