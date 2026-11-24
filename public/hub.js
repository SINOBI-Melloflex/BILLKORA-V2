/* BillKora hub.js: Migration & Network Devices, zones, staff/inventory/jobs. Loads last. */
(function(){
var HB={tab:'devices'},Z=[],CM=[],G={};
function $$(i){return document.getElementById(i)}
function list(u){return api(u).then(function(r){return Array.isArray(r)?r:[]}).catch(function(e){if(e&&e.message==='auth')throw e;return []})}
var st=document.createElement('style');
st.textContent='#v>*{animation:hbIn .38s ease both}#v>*:nth-child(2){animation-delay:.06s}#v>*:nth-child(3){animation-delay:.12s}@keyframes hbIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}'
+'.hb-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}.hb-tabs button{border:1px solid #d9e2f3;background:#fff;padding:10px 18px;border-radius:12px;font-weight:600;cursor:pointer;transition:.2s;color:#2a3a5c}'
+'.hb-tabs button:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(30,107,255,.15)}.hb-tabs button.on{background:linear-gradient(135deg,#1e6bff,#4a8dff);color:#fff;border-color:transparent}'
+'.hb-note{background:#eef5ff;border:1px solid #cfe0ff;color:#1f3f7a;padding:10px 14px;border-radius:10px;margin-bottom:12px;font-size:13px;line-height:1.6}'
+'.zr{display:flex;gap:8px;margin-bottom:10px}.zr input,.zr select{flex:1}.zc{border:1px solid #e3e8f2;border-radius:10px;padding:10px;margin-top:10px}.zh{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}'
+'.chip{display:inline-block;background:#eef3ff;border-radius:20px;padding:4px 10px;margin:3px;font-size:13px}.chip span{cursor:pointer;color:#d33;margin-left:6px}'
+'body.dark .hb-tabs button{background:#14213d;color:#dbe6ff;border-color:#2a3a5c}body.dark .hb-note{background:#14213d;color:#dbe6ff;border-color:#2a3a5c}'
+'@media (prefers-reduced-motion:reduce){#v>*{animation:none}}';
document.head.appendChild(st);

/* ---------- generic pages: staff / inventory / jobs ---------- */
function custOpts(){return [['','-']].concat((G.c||[]).map(function(c){return [c.id,c.cid+' - '+c.name]}))}
function cn(id){var c=(G.c||[]).filter(function(x){return x.id===id})[0];return c?c.name:'-'}
function sum(a,k){return a.reduce(function(s,x){return s+(Number(x[k])||0)},0)}
var CFG={
 staff:{title:'HR & Staff',col:'staff',add:'Add Staff',cols:['Name','Role','Phone','Salary','Joined','Status'],
  row:function(x){return [esc(x.name),esc(x.role),esc(x.phone),x.salary?money(x.salary):'-',esc(x.joined),bdg(x.status||'active')]},
  stats:function(r){return stat('user','Total Staff',r.length)+stat('shield','Active',r.filter(function(x){return x.status!=='suspended'}).length)+stat('card','Monthly Salary',money(sum(r,'salary')))},
  fields:function(){return [{k:'name',l:'Full Name',r:1},{k:'role',l:'Role',t:'select',o:['Technician','Support Agent','Accountant','Manager','Collector','Other'].map(function(x){return [x,x]})},{k:'phone',l:'Phone'},{k:'email',l:'Email'},{k:'salary',l:'Monthly Salary',t:'number'},{k:'joined',l:'Joining Date',t:'date'},{k:'status',l:'Status',t:'select',o:[['active','Active'],['suspended','On leave / inactive']]}]}},
 inventory:{title:'Inventory & Assets',col:'inventory',add:'Add Item',cols:['Item','Type','Serial','MAC','Qty','Location','Assigned to','Status'],
  row:function(x){return [esc(x.item),esc(x.kind),esc(x.serial),esc(x.mac),esc(x.qty),esc(x.location),x.assignedTo?esc(cn(x.assignedTo)):'-',bdg(x.status||'in stock')]},
  stats:function(r){return stat('box','Items',r.length)+stat('server','Total Qty',sum(r,'qty'))+stat('alert','Damaged',r.filter(function(x){return x.status==='damaged'}).length)},
  fields:function(){return [{k:'item',l:'Item name',r:1},{k:'kind',l:'Type',t:'select',o:['Router','Switch','OLT','ONU','Cable','Other'].map(function(x){return [x,x]})},{k:'serial',l:'Serial no.'},{k:'mac',l:'MAC address'},{k:'qty',l:'Quantity',t:'number',d:1},{k:'location',l:'Location / POP'},{k:'assignedTo',l:'Assigned to customer',t:'select',o:custOpts()},{k:'status',l:'Status',t:'select',o:[['in stock','In stock'],['assigned','Assigned'],['damaged','Damaged']]}]}},
 jobs:{title:'Installation & Field Service',col:'jobs',add:'New Job',cols:['Job','Customer','Type','Technician','Date','Status'],
  row:function(x){return [esc(x.title),x.customerId?esc(cn(x.customerId)):'-',esc(x.type),esc(x.tech),esc(x.date),bdg(x.status||'pending')]},
  stats:function(r){return stat('pin','Total Jobs',r.length)+stat('alert','Pending',r.filter(function(x){return x.status!=='closed'}).length)+stat('home','Done',r.filter(function(x){return x.status==='closed'}).length)},
  fields:function(){return [{k:'title',l:'Job title',r:1},{k:'customerId',l:'Customer',t:'select',o:custOpts()},{k:'type',l:'Job type',t:'select',o:['New installation','Repair','Relocation','Fiber cut','Other'].map(function(x){return [x,x]})},{k:'tech',l:'Technician',t:'select',o:[['','-']].concat((G.staff||[]).map(function(s){return [s.name,s.name]}))},{k:'date',l:'Date',t:'date'},{k:'status',l:'Status',t:'select',o:[['pending','Pending'],['open','In progress'],['closed','Done']]},{k:'note',l:'Note',t:'textarea'}]}}
};
function page(key){var cf=CFG[key];
 return Promise.all([api('admin/'+cf.col),list('admin/customers'),list('admin/staff')]).then(function(r){G[cf.col]=r[0];G.c=r[1];if(cf.col!=='staff')G.staff=r[2];
  P(cf.title,'<div class="grid">'+cf.stats(r[0])+'</div><div class="card" style="margin-top:16px"><div class="bar2"><button class="btn" onclick="hbAdd(\''+key+'\')"><i data-i="plus"></i> '+cf.add+'</button></div>'
  +tbl(cf.cols.concat(['Actions']),r[0].map(function(x){return cf.row(x).concat(['<div class="act"><button class="btn sm" onclick="hbEdit(\''+key+'\',\''+x.id+'\')">Edit</button><button class="btn sm red" onclick="hbDel(\''+key+'\',\''+x.id+'\')">Delete</button></div>'])}))+'</div>')})}
window.hbEdit=function(key,id){var cf=CFG[key],x=id?(G[cf.col]||[]).filter(function(i){return i.id===id})[0]:{};
 form(id?'Edit':cf.add,cf.fields(),x||{},function(d){return api('admin/'+cf.col+(id?'/'+id:''),id?'PUT':'POST',d).then(done('Saved'))})};
window.hbAdd=function(key){window.hbEdit(key)};
window.hbDel=function(key,id){var cf=CFG[key];sure('Delete this record?',function(){A('admin/'+cf.col+'/'+id,'DELETE',null,'Deleted')})};
V.staff=function(){return page('staff')};V.hrm=V.staff;
V.inventory=function(){return page('inventory')};
V.field=function(){return page('jobs')};

/* ---------- Migration & Network Devices hub ---------- */
var omig=V.migration,onet=V.network;
var TABS=[['devices','Network Devices'],['cust','Customer Devices'],['imp','Import from File']];
function tabsHtml(){return '<div class="hb-tabs" id="hbtabs">'+TABS.map(function(t){return '<button class="'+(HB.tab===t[0]?'on':'')+'" onclick="hbGo(\''+t[0]+'\')">'+t[1]+'</button>'}).join('')+'</div>'}
window.hbGo=function(t){HB.tab=t;if(location.hash!=='#hub')location.hash='#hub';else go()};
function embed(fn){var body=$$('hbody'),oldP=window.P;
 window.P=function(t,h){body.innerHTML=h;icons()};
 var r;try{r=fn()}catch(e){window.P=oldP;throw e}
 return Promise.resolve(r).then(function(){window.P=oldP;if(!$$('hbtabs'))$$('v').insertAdjacentHTML('afterbegin',tabsHtml())},function(e){window.P=oldP;throw e})}
var KINDS=['MikroTik','OLT','Switch','Other'],METH=[['api','API (recommended)'],['snmp','SNMP (read only)'],['telnet','Telnet (least secure)']];
function devTab(){return api('admin/netdevices').then(function(r){G.nd=r;
 var on=r.filter(function(d){return d.status==='online'}).length,off=r.filter(function(d){return d.status==='offline'}).length;
 $$('hbody').innerHTML='<div class="grid">'+stat('server','Network Devices',r.length)+stat('wifi','Reachable',on)+stat('alert','Not reachable',off)+'</div>'
 +'<div class="card" style="margin-top:16px"><div class="hb-note">Add your MikroTik, OLT or any device here. BillKora only reads from your router first. It will not change, suspend or disconnect any user already running on it. Reading PPPoE users from the router comes in the next step.</div>'
 +'<div class="bar2"><button class="btn" onclick="hbDev()"><i data-i="plus"></i> Add Device</button></div>'
 +tbl(['Name','Type','Method','IP : Port','Status','Actions'],r.map(function(d){return [esc(d.name),esc(d.kind),esc(d.method),esc(d.ip)+' : '+esc(d.port),bdg(d.status==='unknown'?'pending':d.status),'<div class="act"><button class="btn sm o2" onclick="hbTest(\''+d.id+'\')">Test</button><button class="btn sm" onclick="hbDev(\''+d.id+'\')">Edit</button><button class="btn sm red" onclick="hbDevDel(\''+d.id+'\')">Delete</button></div>']}))+'</div>';icons()})}
window.hbDev=function(id){var d=id?(G.nd||[]).filter(function(x){return x.id===id})[0]:{kind:'MikroTik',method:'api'};
 var v=Object.assign({},d,{pass:''});
 form(id?'Edit Device':'Add Device',[{k:'name',l:'Device name',r:1,p:'e.g. Main Router'},{k:'kind',l:'Device type',t:'select',o:KINDS.map(function(x){return [x,x]})},{k:'method',l:'Connection method',t:'select',o:METH},{k:'ip',l:'IP address / host',r:1},{k:'port',l:'Port',p:'blank = API 8728, SNMP 161, Telnet 23'},{k:'user',l:'Username'},{k:'pass',l:'Password',t:'password',p:id?'leave blank to keep':''},{k:'note',l:'Note'}],v,
 function(x){return api('admin/netdevices'+(id?'/'+id:''),id?'PUT':'POST',x).then(done('Saved'))})};
window.hbDevDel=function(id){sure('Delete this device?',function(){A('admin/netdevices/'+id,'DELETE',null,'Deleted')})};
window.hbTest=function(id){toast('Testing connection...');api('admin/nettest/'+id,'POST',{}).then(function(r){toast(r.msg||'Done',!r.ok);go()}).catch(function(e){if(e.message!=='auth')toast(e.message,1)})};
V.hub=function(){P('Migration & Network Devices',tabsHtml()+'<div id="hbody"></div>');
 if(HB.tab==='cust'&&onet)return embed(onet);
 if(HB.tab==='imp'&&omig)return embed(omig);
 return devTab()};
V.migration=function(){HB.tab='imp';location.hash='#hub';return Promise.resolve()};
V.network=function(){HB.tab='cust';location.hash='#hub';return Promise.resolve()};
V.mikrotik=function(){HB.tab='devices';location.hash='#hub';return Promise.resolve()};

/* ---------- zones, subzones, customer type (inside Customer Management only) ---------- */
var TYPES=[['home','Home'],['corporate','Corporate'],['reseller','Reseller']];
function zname(id){var z=Z.filter(function(x){return x.id===id})[0];return z?z.name:''}
function meta(cid){return CM.filter(function(m){return m.customerId===cid})[0]}
function zlabel(c){var m=meta(c.id);if(!m||!m.zone)return '-';return esc(zname(m.zone))+(m.sub?' &rsaquo; '+esc(zname(m.sub)):'')}
function tlabel(c){var m=meta(c.id),t=m&&m.type||'home';return TYPES.filter(function(x){return x[0]===t})[0][1]}
window.fillC=function(q){q=(q||'').toLowerCase();var t=$$('ct');if(!t)return;
 t.innerHTML=tbl(['ID','Name','Phone','Package','Zone','Type','Status','Actions'],D.c.filter(function(c){var m=meta(c.id);return (c.name+c.phone+c.cid+c.username+(m?zname(m.zone)+zname(m.sub):'')).toLowerCase().indexOf(q)>-1}).map(function(c){return [c.cid,esc(c.name),esc(c.phone),esc(pname(c.packageId)),zlabel(c),tlabel(c),bdg(c.status),'<div class="act"><button class="btn sm" onclick="editC(\''+c.id+'\')">Edit</button><button class="btn sm red" onclick="delC(\''+c.id+'\')">Delete</button></div>']}))};
window.editC=function(id){var c=id?D.c.filter(function(x){return x.id===id})[0]:{status:'active',packageId:D.p[0]&&D.p[0].id};
 var m=id?meta(id):null,places=[['|','- No zone -']];
 Z.filter(function(z){return !z.parent}).forEach(function(z){places.push([z.id+'|',z.name]);Z.filter(function(s){return s.parent===z.id}).forEach(function(s){places.push([z.id+'|'+s.id,z.name+' > '+s.name])})});
 var vals=Object.assign({},c,{place:m?(m.zone||'')+'|'+(m.sub||''):'|',ctype:(m&&m.type)||'home'});
 form(id?'Edit Customer':'Add Customer',[{k:'name',l:'Full Name',r:1},{k:'phone',l:'Phone',r:1},{k:'email',l:'Email'},{k:'address',l:'Address'},{k:'nid',l:'NID / ID No.'},{k:'place',l:'Zone / Subzone',t:'select',o:places},{k:'ctype',l:'Customer type',t:'select',o:TYPES},{k:'packageId',l:'Package',t:'select',o:D.p.map(function(p){return [p.id,p.name+' - '+money(p.price)]})},{k:'status',l:'Connection Status',t:'select',o:[['active','Active'],['suspended','Suspended'],['disconnected','Disconnected']]},{k:'usage',l:'Usage this month (GB)',t:'number'},{k:'username',l:'Login username',p:'auto'},{k:'pass',l:'Password',p:id?'leave blank to keep':'blank = phone number'}],vals,function(d){
  var pl=(d.place||'|').split('|'),ct=d.ctype||'home';delete d.place;delete d.ctype;
  return api('admin/customers'+(id?'/'+id:''),id?'PUT':'POST',d).then(function(r){
   var cidP=id?Promise.resolve(id):api('admin/customers').then(function(l){var x=l.filter(function(k){return k.username===r.username})[0];return x&&x.id});
   return cidP.then(function(cid){return cid?api('admin/cmeta','POST',{customerId:cid,zone:pl[0]||'',sub:pl[1]||'',type:ct}):null}).then(function(){return function(){if(r.password)box('Customer added','<p><b>Username:</b> '+esc(r.username)+'<br><b>Password:</b> '+esc(r.password)+'</p>');else toast('Saved');go()}})})})};
function zReload(){return api('admin/zones').then(function(r){Z=r;window.zoneBox();if($$('ct'))window.fillC('')}).catch(function(e){if(e.message!=='auth')toast(e.message,1)})}
window.zAdd=function(sub){var n=$$(sub?'zn2':'zn1').value.trim();if(!n){toast('Enter a name',1);return}
 api('admin/zones','POST',{name:n,parent:sub?$$('zp').value:''}).then(zReload).catch(function(e){toast(e.message,1)})};
window.zDel=function(id){api('admin/zones/'+id,'DELETE').then(zReload).catch(function(e){toast(e.message,1)})};
window.zoneBox=function(){var zs=Z.filter(function(z){return !z.parent}),h='<div class="zr"><input id="zn1" placeholder="New zone name"><button class="btn" onclick="zAdd()">Add Zone</button></div>';
 if(zs.length)h+='<div class="zr"><select id="zp">'+zs.map(function(z){return '<option value="'+z.id+'">'+esc(z.name)+'</option>'}).join('')+'</select><input id="zn2" placeholder="New subzone name"><button class="btn o2" onclick="zAdd(1)">Add Subzone</button></div>';
 h+=zs.length?zs.map(function(z){return '<div class="zc"><div class="zh"><b>'+esc(z.name)+'</b><button class="btn sm red" onclick="zDel(\''+z.id+'\')">Delete</button></div>'+(Z.filter(function(s){return s.parent===z.id}).map(function(s){return '<div class="chip">'+esc(s.name)+'<span onclick="zDel(\''+s.id+'\')">&times;</span></div>'}).join('')||'<small class="muted">No subzones</small>')+'</div>'}).join(''):'<p class="muted">No zones yet. Add your first zone above.</p>';
 box('Zones and Subzones','<div>'+h+'</div>')};
var oc=V.customers;
V.customers=function(){return Promise.all([list('admin/zones'),list('admin/cmeta')]).then(function(r){Z=r[0];CM=r[1]}).then(function(){return oc()}).then(function(x){
 var v=$$('v');if(v&&!$$('zbtn')){var b='<button class="btn o2" id="zbtn" onclick="zoneBox()"><i data-i="pin"></i> Zones</button>',bar=v.querySelector('.bar2');if(bar)bar.insertAdjacentHTML('beforeend',b);else v.insertAdjacentHTML('afterbegin','<div class="bar2">'+b+'</div>');icons()}
 return x})};
if(typeof go==='function')go();
})();