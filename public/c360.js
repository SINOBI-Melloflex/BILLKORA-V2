/* BillKora c360.js: Customer 360 page, actions, MikroTik sync. Loads last. */
(function(){
var Z=[],CM=[],LV={ok:false},FL='all';
var TYPES=[['home','Home'],['corporate','Corporate'],['reseller','Reseller']];
function $$(i){return document.getElementById(i)}
function lst(u){return api(u).then(function(r){return Array.isArray(r)?r:[]}).catch(function(e){if(e&&e.message==='auth')throw e;return []})}
var st=document.createElement('style');
st.textContent='.c3card{padding:18px}.c3note{background:#eef5ff;border:1px solid #cfe0ff;color:#1f3f7a;padding:10px 14px;border-radius:10px;margin-bottom:14px;font-size:13px;line-height:1.5}.c3note.ok{background:#e9f9f2;border-color:#bfe9d6;color:#0f6b4a}'
+'.c3bar{flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px}.c3bar input{flex:1;min-width:220px}'
+'.c3n b{display:block;font-weight:600}.c3n small{color:#7a89a8;display:block;font-size:12px}.c3id{font-weight:700;color:#1e6bff}.c3m{font-family:Consolas,monospace;font-size:12.5px;color:#4a5a7a}'
+'.c3d{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:7px}.c3d.l{background:#17b890;box-shadow:0 0 0 4px rgba(23,184,144,.18)}.c3d.r{background:#e5484d}.c3d.g{background:#aab4c8}'
+'.c3s{display:block;font-size:12px}.c3s.l{color:#17916f}.c3s.w{color:#d98a00}.c3s.r{color:#d33}'
+'.mb.c3w{width:min(940px,96vw);max-width:96vw}.c3h{display:flex;align-items:center;gap:14px;margin-bottom:12px}'
+'.c3av{width:52px;height:52px;border-radius:16px;background:linear-gradient(135deg,#1e6bff,#6aa2ff);color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700}'
+'.c3h h3{margin:0}.c3h small{color:#7a89a8}.c3st{margin-left:auto;display:flex;gap:8px;align-items:center}.c3acts{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}'
+'.c3g{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:14px}.c3c{border:1px solid #e3e8f2;border-radius:14px;padding:14px;background:#fff}.c3c h4{margin:0 0 8px;font-size:14px;color:#1e6bff}'
+'.c3kv{display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px dashed #edf0f7;font-size:13px}.c3kv span{color:#7a89a8}.c3kv b{text-align:right;word-break:break-word}.c3sec{margin:14px 0 4px;font-weight:700;color:#1e6bff}'
+'body.dark .c3c{background:#14213d;border-color:#2a3a5c}body.dark .c3note{background:#14213d;border-color:#2a3a5c;color:#dbe6ff}';
document.head.appendChild(st);

function meta(id){return CM.filter(function(m){return m.customerId===id})[0]}
function zn(id){var z=Z.filter(function(x){return x.id===id})[0];return z?z.name:''}
function zlab(c){var m=meta(c.id);if(!m||!m.zone)return '-';return esc(zn(m.zone))+(m.sub?' &rsaquo; '+esc(zn(m.sub)):'')}
function ctype(c){var m=meta(c.id),t=(m&&m.type)||'home';var x=TYPES.filter(function(y){return y[0]===t})[0];return x?x[1]:'Home'}
function pu(c){return c.pppUser||c.username||''}
function rcm(c){var s=LV.ok&&LV.secrets&&LV.secrets[pu(c)];return s&&s.comment?s.comment:''}
function left(c){if(!c.expiry)return null;var t=new Date();t.setHours(12,0,0,0);return Math.round((new Date(c.expiry+'T12:00:00')-t)/864e5)}
function expTag(c){var l=left(c);if(l===null)return '<span class="c3m">No limit set</span>';
 var cl=l<0?'r':(l<=3?'w':'l');return '<b>'+esc(c.expiry)+'</b><small class="c3s '+cl+'">'+(l<0?Math.abs(l)+' day(s) over':(l===0?'ends today':l+' day(s) left'))+'</small>'}
function onl(c){return LV.ok&&LV.online&&LV.online[pu(c)]}
function dot(c){if(!LV.ok)return '<i class="c3d g" title="Router not connected"></i>';return onl(c)?'<i class="c3d l" title="Online"></i>':'<i class="c3d r" title="Offline"></i>'}
function liveLoad(){return api('admin/mtlive').catch(function(e){if(e.message==='auth')throw e;return {ok:false,msg:e.message}}).then(function(v){LV=v||{ok:false};return LV})}
function load(){return Promise.all([api('admin/customers'),api('admin/packages'),lst('admin/zones'),lst('admin/cmeta')]).then(function(r){D.c=r[0];D.p=r[1];Z=r[2];CM=r[3]})}
function redraw(){var i=$$('cq'),q=i?i.value:'';draw();var j=$$('cq');if(j&&q){j.value=q;fillC()}}
function counts(){var c=D.c,n=function(f){return c.filter(f).length};
 return {tot:c.length,on:LV.ok?c.filter(onl).length:'-',act:n(function(x){return x.status==='active'}),exp:n(function(x){return x.status==='suspended'}),pau:n(function(x){return x.status==='paused'})}}
function rows(q){q=(q||'').toLowerCase();
 return D.c.filter(function(c){var m=meta(c.id),s=(c.name+' '+c.phone+' '+c.cid+' '+c.username+' '+pu(c)+' '+(c.ip||'')+' '+(c.mac||'')+' '+(m?zn(m.zone)+zn(m.sub):'')+' '+rcm(c)).toLowerCase();
  if(s.indexOf(q)<0)return false;
  if(FL==='all')return true;
  if(FL==='online')return !!onl(c);
  if(FL==='offline')return LV.ok&&!onl(c)&&c.status==='active';
  return c.status===FL}).map(function(c){var o=onl(c)||{},ip=o.ip||c.ip||'-',mac=o.mac||c.mac||'-';
  return ['<span class="c3id">'+esc(c.cid)+'</span>','<div class="c3n"><b>'+esc(c.name)+'</b><small>'+esc(c.phone)+'</small></div>','<div class="c3n"><span class="c3m">'+esc(pu(c))+'</span>'+(rcm(c)?'<small>'+esc(rcm(c))+'</small>':'')+'</div>','<div class="c3n"><b>'+esc(pname(c.packageId))+'</b></div>',zlab(c),'<div class="c3n"><b>'+esc(ip)+'</b><small>'+esc(mac)+'</small></div>','<div class="c3n">'+expTag(c)+'</div>',dot(c)+bdg(c.status),'<div class="act"><button class="btn sm" onclick="c3v(\''+c.id+'\')">View</button><button class="btn sm o2" onclick="editC(\''+c.id+'\')">Edit</button></div>']})}
window.fillC=function(q){var t=$$('ct');if(!t)return;
 var paint=function(){if(q===undefined){var i=$$('cq');q=i?i.value:''}t=$$('ct');if(!t)return;t.innerHTML=tbl(['ID','Customer','PPPoE user','Package','Zone','IP / MAC','Valid until','Status','Actions'],rows(q));icons()};
 if(q===''){Promise.all([lst('admin/zones'),lst('admin/cmeta')]).then(function(r){Z=r[0];CM=r[1];paint()})}else paint()};
window.c3f=function(v){FL=v;fillC()};
function draw(){var k=counts();
 var fo=[['all','All customers'],['online','Online now'],['offline','Offline (active)'],['active','Active'],['suspended','Expired / Suspended'],['paused','Paused'],['disconnected','Disconnected']];
 P('Customer Management','<div class="grid">'+stat('users','Total Customers',k.tot)+stat('wifi','Online Now',k.on)+stat('check','Active',k.act)+stat('alert','Expired / Suspended',k.exp)+stat('clock','Paused',k.pau)+'</div>'
 +'<div class="card c3card" style="margin-top:16px">'+(LV.ok?'<div class="c3note ok">Connected to router <b>'+esc(LV.router)+'</b>. Online status is live.</div>':'<div class="c3note">'+(LV.loading?'Checking your router...':esc(LV.msg||'Router not connected')+'. Live status, Disconnect and Reconnect work after you add a MikroTik (API) under Migration &amp; Network Devices.')+'</div>')
 +'<div class="bar2 c3bar"><input id="cq" placeholder="Search name, phone, ID, PPPoE user, IP, MAC..." oninput="fillC()"><select id="cf" onchange="c3f(this.value)">'+fo.map(function(o){return '<option value="'+o[0]+'"'+(o[0]===FL?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select>'
 +'<button class="btn" onclick="editC()"><i data-i="plus"></i> Add Customer</button><button class="btn o2" onclick="zoneBox()"><i data-i="pin"></i> Zones</button><button class="btn o2" onclick="c3sync()"><i data-i="ref"></i> MikroTik Sync</button><button class="btn o2" onclick="go()"><i data-i="ref"></i> Refresh</button></div><div id="ct"></div></div>');
 fillC();icons()}
V.customers=function(){var t=window.GT;LV={ok:false,loading:true};return load().then(function(){draw();liveLoad().then(function(){if(window.GT===t&&$$('ct'))redraw()}).catch(function(){})})};
function wide(){var mb=document.querySelector('.ov .mb');if(mb)mb.classList.add('c3w')}
function kv(k,v){return '<div class="c3kv"><span>'+k+'</span><b>'+((v===''||v==null)?'-':v)+'</b></div>'}
function refresh(id){return Promise.all([load(),liveLoad()]).then(function(){if($$('ct'))redraw();if(id)c3v(id)})}
window.c3v=function(id){
 api('admin/c360/'+id).then(function(r){
  var c=r.customer,p=r.package||{},lv=r.live||{},o=lv.online,sc=lv.secret,s=c.status,b='';
  function B(a,l,cls){return '<button class="btn sm '+(cls||'')+'" onclick="'+a+'">'+l+'</button>'}
  b+=B("c3rc('"+id+"')",'Recharge','');
  if(s==='active'||s==='suspended')b+=B("c3a('"+id+"','pause')",'Pause','o2');
  if(s==='paused')b+=B("c3a('"+id+"','resume')",'Resume','');
  if(s==='suspended'||s==='disconnected'||(s==='active'&&sc&&sc.disabled))b+=B("c3a('"+id+"','reconnect')",'Reconnect','');
  if(s==='active'||s==='suspended')b+=B("c3a('"+id+"','disconnect')",'Disconnect','red');
  b+=B("c3a('"+id+"','sync')",'Push to Router','o2')+B("editC('"+id+"')",'Edit','o2')+B("c3v('"+id+"')",'Refresh live','o2');
  var net=lv.ok?(o?'<span class="bd l">Online</span>':'<span class="bd r">Offline</span>'):'<span class="bd g">Router not connected</span>';
  var pw='<b data-p="'+esc(c.pppPass||'')+'" title="Click to show" style="cursor:pointer" onclick="this.textContent=this.textContent===\'******\'?this.dataset.p:\'******\'">******</b>';
  var h='<div class="c3h"><div class="c3av">'+esc((c.name||'?').charAt(0).toUpperCase())+'</div><div><h3>'+esc(c.name)+'</h3><small>'+esc(c.cid)+' - '+ctype(c)+'</small></div><div class="c3st">'+net+bdg(s)+'</div></div><div class="c3acts">'+b+'</div>';
  if(!lv.ok&&lv.msg)h+='<div class="c3note">'+esc(lv.msg)+'</div>';
  if(c.lastErr)h+='<div class="c3note">Router action pending: '+esc(c.lastErr)+'</div>';
  h+='<div class="c3g"><div class="c3c"><h4>Connection</h4>'+kv('PPPoE username',esc(pu(c)))+'<div class="c3kv"><span>PPPoE password</span>'+pw+'</div>'+kv('IP address',esc((o&&o.ip)||c.ip||''))+kv('MAC address',esc((o&&o.mac)||c.mac||''))+kv('Session uptime',esc(o?o.uptime:''))
  +kv('Router comment',esc((sc&&sc.comment)||''))+kv('Router profile',esc((sc&&sc.profile)||p.profile||''))+kv('IP pool',esc(p.pool||''))+kv('Service',esc((o&&o.service)||(sc&&sc.service)||''))+kv('Last logged out',esc((sc&&sc.lastOut)||''))+kv('Last disconnect reason',esc((sc&&sc.lastReason)||''))+kv('Secret on router',lv.ok?(sc?(sc.disabled?'Disabled':'Enabled'):'Not found (Push to Router)'):'')+'</div>'
  +'<div class="c3c"><h4>Plan and Billing</h4>'+kv('Package',esc(p.name||'-'))+kv('Monthly bill',money(p.price||0))+kv('Speed',p.speed?esc(p.speed)+' Mbps':'')+'<div class="c3kv"><span>Valid until</span><div class="c3n" style="text-align:right">'+expTag(c)+'</div></div>'
  +kv('Paused since',esc(c.pausedAt||''))+kv('Auto-off on',esc(c.autoOff||''))+kv('Joined',esc(fdate(c.joined)))+'</div>'
  +'<div class="c3c"><h4>Customer</h4>'+kv('Phone',esc(c.phone))+kv('Email',esc(c.email))+kv('Address',esc(c.address))+kv('NID',esc(c.nid))+kv('Zone',zlab(c))+kv('Portal login',esc(c.username))+'</div></div>'
  +'<div class="c3g" style="margin-top:14px"><div class="c3c"><h4>Recent invoices</h4>'+tbl(['No','Month','Amount','Status'],r.invoices.map(function(i){return [esc(i.no),esc(i.month),money(i.amount),bdg(i.status)]}))+'</div>'
  +'<div class="c3c"><h4>Recent payments</h4>'+tbl(['No','Date','Amount','Method'],r.payments.map(function(x){return [esc(x.no),esc(fdate(x.date)),money(x.amount),esc(x.method)]}))+'</div></div>';
  box('Customer Details',h);wide();icons();
 }).catch(function(e){if(e.message!=='auth')toast(e.message,1)})};
window.c3a=function(id,act){
 var q={pause:'Pause this customer? Internet is cut now and billing stops until you press Resume.',disconnect:'Disconnect this customer from the router now?'};
 var run=function(){toast('Working...');api('admin/cact/'+id+'/'+act,'POST',{}).then(function(r){toast(r.msg||'Done');return refresh(id)}).catch(function(e){if(e.message!=='auth')toast(e.message,1)})};
 if(q[act])sure(q[act],run);else run()};
window.c3rc=function(id){
 form('Recharge (customer paid)',[{k:'months',l:'Months paid',t:'select',o:[[1,'1 month (30 days)'],[2,'2 months'],[3,'3 months'],[6,'6 months'],[12,'12 months']]},{k:'method',l:'Payment method',t:'select',o:METHODS}],{months:1,method:'Cash'},function(d){
  return api('admin/cact/'+id+'/recharge','POST',d).then(function(r){return function(){toast(r.msg);refresh(id)}})},'Recharge')};
window.editC=function(id){
 var c=id?D.c.filter(function(x){return x.id===id})[0]:{packageId:D.p[0]&&D.p[0].id};
 var m=id?meta(id):null,places=[['|','- No zone -']];
 Z.filter(function(z){return !z.parent}).forEach(function(z){places.push([z.id+'|',z.name]);Z.filter(function(s){return s.parent===z.id}).forEach(function(s){places.push([z.id+'|'+s.id,z.name+' > '+s.name])})});
 var vals=Object.assign({},c,{place:m?(m.zone||'')+'|'+(m.sub||''):'|',ctype:(m&&m.type)||'home',months:1,pass:'',pppUser:c.pppUser||(id?c.username:'')});
 var pk=D.p.map(function(p){return [p.id,p.name+' - '+money(p.price)+(p.profile?'   ['+p.profile+(p.pool?' / '+p.pool:'')+']':'')]});
 var f=[{k:'name',l:'Full Name',r:1},{k:'phone',l:'Phone',r:1},{k:'email',l:'Email'},{k:'address',l:'Address'},{k:'nid',l:'NID / ID No.'},{k:'place',l:'Zone / Subzone',t:'select',o:places},{k:'ctype',l:'Customer type',t:'select',o:TYPES},
  {h:'<div class="c3sec">Package and PPPoE (profile and pool come from the package)</div>'},{k:'packageId',l:'Package',t:'select',o:pk},{k:'pppUser',l:'PPPoE username',r:1},{k:'pppPass',l:'PPPoE password',r:1}];
 if(id)f.push({k:'expiry',l:'Service valid until',t:'date'});
 else f.push({k:'months',l:'Paid for',t:'select',o:[[0,'Not paid yet (stays OFF until recharge)'],[1,'1 month'],[2,'2 months'],[3,'3 months'],[6,'6 months'],[12,'12 months']]});
 f.push({k:'pass',l:'Customer portal password',p:id?'leave blank to keep':'blank = phone number'});
 form(id?'Edit Customer':'Add Customer',f,vals,function(d){
  var pl=(d.place||'|').split('|'),ct=d.ctype||'home',mo=parseInt(d.months,10)||0;delete d.place;delete d.ctype;delete d.months;
  d.pppUser=String(d.pppUser||'').trim();if(!id){d.username=d.pppUser.toLowerCase();if(mo===0)d.status='suspended'}
  return api('admin/customers'+(id?'/'+id:''),id?'PUT':'POST',d).then(function(r){
   var cp=id?Promise.resolve(id):api('admin/customers').then(function(l){var x=l.filter(function(k){return k.username===r.username})[0];return x&&x.id}),msgs=[];
   return cp.then(function(cid){if(!cid)return null;
    return api('admin/cmeta','POST',{customerId:cid,zone:pl[0]||'',sub:pl[1]||'',type:ct})
    .then(function(){return api('admin/cact/'+cid+'/sync','POST',{}).then(function(x){msgs.push(x.msg)}).catch(function(e){msgs.push('Router: '+e.message)})})
    .then(function(){return (!id&&mo>0)?api('admin/cact/'+cid+'/recharge','POST',{months:mo,method:'Cash'}).then(function(x){msgs.push(x.msg)}).catch(function(e){msgs.push(e.message)}):null})
   }).then(function(){return function(){
    if(r.password)box('Customer added','<p><b>Portal username:</b> '+esc(r.username)+'<br><b>Portal password:</b> '+esc(r.password)+'</p><p class="muted">'+msgs.map(esc).join('<br>')+'</p>');
    else toast(msgs.join('. ')||'Saved');
    refresh()}})})})};
window.wzPk=function(id){
 Promise.all([api('admin/packages'),api('admin/mtcat').catch(function(){return {ok:false}})]).then(function(r){
  var p=id?r[0].filter(function(x){return x.id===id})[0]:{},cat=r[1],has=cat&&cat.ok,f=[{k:'name',l:'Package name',r:1,p:'e.g. 10 Mbps'}];
  if(has)f.push({k:'profile',l:'Router PPPoE profile (from MikroTik)',t:'select',o:[['','- choose profile -']].concat(cat.profiles.map(function(x){return [x.name,x.name+(x.pool?'  |  pool: '+x.pool:'')+(x.rate?'  |  '+x.rate:'')]}))});
  else f.push({k:'profile',l:'Router PPPoE profile name',p:'same name as on MikroTik'});
  f.push({k:'speed',l:'Speed (Mbps)',t:'number'},{k:'price',l:'Monthly bill (taka)',t:'number',r:1},{k:'desc',l:'Note'});
  form(id?'Edit Package':'Add Package',f,p||{},function(d){
   var pr=has?cat.profiles.filter(function(x){return x.name===d.profile})[0]:null;if(pr)d.pool=pr.pool;
   return api('admin/packages'+(id?'/'+id:''),id?'PUT':'POST',d).then(function(){return function(){toast('Saved');go()}})})})};
window.c3sync=function(){
 toast('Reading router...');
 Promise.all([api('admin/mtcat'),api('admin/packages')]).then(function(r){var c=r[0],pk=r[1];
  if(!c.ok){box('MikroTik Sync','<div class="c3note">'+esc(c.msg||'Router not connected')+'</div><p class="muted">Add your MikroTik under Migration &amp; Network Devices (method API, port 8728, a user with read/write permission), then press Test.</p>');return}
  var h='<p class="muted" style="margin-bottom:10px">Pools and profiles are read from your router. Create or change them on MikroTik, then sync here. BillKora never creates its own pools.</p>'
  +'<div class="bar2"><button class="btn" onclick="c3do(\'packages\')">1. Import profiles as packages</button><button class="btn o2" onclick="c3do(\'users\')">2. Import PPPoE users as customers</button></div>'
  +'<h4 style="margin:14px 0 6px">IP Pools</h4>'+tbl(['Pool','Ranges'],c.pools.map(function(p){return [esc(p.name),esc(p.ranges)]}))
  +'<h4 style="margin:14px 0 6px">PPPoE Profiles and linked packages</h4>'+tbl(['Profile','Pool','Rate limit','BillKora package','Price'],c.profiles.map(function(p){var k=pk.filter(function(x){return x.profile===p.name})[0];return [esc(p.name),esc(p.pool||'-'),esc(p.rate||'-'),k?esc(k.name):'<span class="c3m">not linked</span>',k?money(k.price):'-']}));
  box('MikroTik Sync - Pools and Profiles',h);wide();icons()}).catch(function(e){if(e.message!=='auth')toast(e.message,1)})};
window.c3do=function(w){toast('Importing...');
 api('admin/mtsync/'+w,'POST',{}).then(function(r){closeBox();toast(w==='packages'?('Packages: '+r.added+' new, '+r.updated+' linked. Now set the monthly price of new packages.'):('Customers: '+r.added+' new, '+r.skipped+' already existed. Now set phone and valid-until for them.'));go()}).catch(function(e){if(e.message!=='auth')toast(e.message,1)})};
if(typeof go==='function')go();
})();