/* BillKora wizard.js v2: step guide on Migration & Network Devices. Loads last. */
(function(){
var st=document.createElement('style');
st.textContent='.wz{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 16px}.wz .s{flex:1;min-width:150px;display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:14px;background:#fff;border:1px solid #d9e2f3;cursor:pointer;transition:.25s;animation:wzIn .5s ease both}.wz .s:nth-child(2){animation-delay:.08s}.wz .s:nth-child(3){animation-delay:.16s}.wz .s:nth-child(4){animation-delay:.24s}.wz .s:hover{transform:translateY(-3px);box-shadow:0 8px 20px rgba(30,107,255,.18)}.wz .n{width:30px;height:30px;border-radius:50%;background:#eef3ff;color:#1e6bff;display:flex;align-items:center;justify-content:center;font-weight:700}.wz .s.on{background:linear-gradient(135deg,#1e6bff,#4a8dff);color:#fff;border-color:transparent;box-shadow:0 10px 24px rgba(30,107,255,.3)}.wz .s.on .n{background:#fff}.wz .s b{display:block;font-size:14px}.wz .s small{opacity:.75}@keyframes wzIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}.wzc{animation:wzIn .4s ease both}.wzl{margin:8px 0 0;padding-left:18px;line-height:1.9}.wzl li.req::after{content:" (required)";color:#d33;font-size:12px}.wzl li.opt::after{content:" (optional)";color:#6b7a99;font-size:12px}.wzz{border:1px solid #e3e8f2;border-radius:10px;padding:10px;margin-top:10px}.wzz .chip{display:inline-block;background:#eef3ff;border-radius:20px;padding:4px 10px;margin:3px;font-size:13px}.wzz .chip span{cursor:pointer;color:#d33;margin-left:6px}.wzr{display:flex;gap:8px;margin-bottom:10px}.wzr input,.wzr select{flex:1}body.dark .wz .s{background:#14213d;color:#dbe6ff;border-color:#2a3a5c}@media (prefers-reduced-motion:reduce){.wz .s,.wzc{animation:none}}';
document.head.appendChild(st);
var STEPS=[['1','File','Upload your customers'],['2','Zones','Zone / subzone'],['3','Packages','Plans and monthly bill'],['4','Devices','MikroTik / OLT']];
var cur=1,skip=false,PK=[];
function $$(i){return document.getElementById(i)}
function ol(u){return api(u).then(function(r){return Array.isArray(r)?r:[]}).catch(function(e){if(e&&e.message==='auth')throw e;return []})}
function bar(){return '<div class="wz">'+STEPS.map(function(s){return '<div class="s'+(cur===+s[0]?' on':'')+'" onclick="wzGo('+s[0]+')"><span class="n">'+s[0]+'</span><div><b>'+s[1]+'</b><small>'+s[2]+'</small></div></div>'}).join('')+'</div>'}
window.wzGo=function(n){skip=false;cur=n;if(n===4)window.hbGo('devices');else V.hub()};
window.wzUp=function(){skip=true;cur=1;window.hbGo('imp')};
function need(){var rows=[['Customer name',1],['Phone number',1],['PPPoE username',1],['PPPoE password',0],['Package / profile name',1],['Monthly bill (taka)',0],['Previous due amount',0],['Zone',0],['Subzone',0],['Address',0],['IP address',0],['MAC address',0]];
 return '<div class="card wzc"><h3>Information BillKora needs from your old software</h3><p class="muted">Your Excel / CSV file should have these columns. If monthly bill is missing, it is taken from the customer package price.</p><ul class="wzl">'+rows.map(function(r){return '<li class="'+(r[1]?'req':'opt')+'">'+r[0]+'</li>'}).join('')+'</ul><div class="bar2" style="margin-top:14px"><button class="btn" onclick="wzUp()">Go to file upload</button><button class="btn o2" onclick="wzGo(2)">Next: Zones</button></div></div>'}
function zones(){return ol('admin/zones').then(function(z){var top=z.filter(function(x){return !x.parent});
 var h='<div class="card wzc"><h3>Zones and subzones</h3><p class="muted">Create the same zones you use on your network. Customers are placed into these during import.</p><div class="wzr"><input id="wz1" placeholder="New zone name"><button class="btn" onclick="wzAdd()">Add Zone</button></div>';
 if(top.length)h+='<div class="wzr"><select id="wzp">'+top.map(function(x){return '<option value="'+x.id+'">'+esc(x.name)+'</option>'}).join('')+'</select><input id="wz2" placeholder="New subzone name"><button class="btn o2" onclick="wzAdd(1)">Add Subzone</button></div>';
 h+=top.length?top.map(function(x){return '<div class="wzz"><b>'+esc(x.name)+'</b> <button class="btn sm red" onclick="wzDel(\''+x.id+'\')">Delete</button><div>'+(z.filter(function(s){return s.parent===x.id}).map(function(s){return '<span class="chip">'+esc(s.name)+'<span onclick="wzDel(\''+s.id+'\')">&times;</span></span>'}).join('')||'<small class="muted">No subzones yet</small>')+'</div></div>'}).join(''):'<p class="muted">No zones yet.</p>';
 h+='<div class="bar2" style="margin-top:14px"><button class="btn o2" onclick="wzGo(1)">Back</button><button class="btn" onclick="wzGo(3)">Next: Packages</button></div></div>';return h})}
window.wzAdd=function(sub){var n=$$(sub?'wz2':'wz1').value.trim();if(!n){toast('Enter a name',1);return}
 api('admin/zones','POST',{name:n,parent:sub?$$('wzp').value:''}).then(function(){toast('Added');V.hub()}).catch(function(e){if(e.message!=='auth')toast(e.message,1)})};
window.wzDel=function(id){api('admin/zones/'+id,'DELETE').then(function(){V.hub()}).catch(function(e){if(e.message!=='auth')toast(e.message,1)})};
function pkgs(){return Promise.all([ol('admin/packages'),ol('admin/customers')]).then(function(r){PK=r[0];var C=r[1];
 var h='<div class="card wzc"><h3>Packages and monthly bill</h3><p class="muted">Each package is one speed plan. Put the router PPPoE profile name and the monthly bill. Customers import into these packages.</p><div class="bar2"><button class="btn" onclick="wzPk()"><i data-i="plus"></i> Add Package</button></div>';
 h+=tbl(['Package','Router profile','Monthly bill','Customers','Actions'],PK.map(function(p){var n=C.filter(function(c){return c.packageId===p.id}).length;return [esc(p.name),esc(p.profile||'-'),money(p.price),n,'<div class="act"><button class="btn sm" onclick="wzPk(\''+p.id+'\')">Edit</button><button class="btn sm red" onclick="wzPkDel(\''+p.id+'\')">Delete</button></div>']}));
 h+='<div class="bar2" style="margin-top:14px"><button class="btn o2" onclick="wzGo(2)">Back</button><button class="btn" onclick="wzGo(4)">Next: Devices</button></div></div>';return h})}
window.wzPk=function(id){var p=id?PK.filter(function(x){return x.id===id})[0]:{};
 form(id?'Edit Package':'Add Package',[{k:'name',l:'Package name',r:1,p:'e.g. 10 Mbps'},{k:'profile',l:'Router PPPoE profile name',p:'same name as on MikroTik'},{k:'speed',l:'Speed (Mbps)',t:'number'},{k:'price',l:'Monthly bill (taka)',t:'number',r:1},{k:'desc',l:'Note'}],p||{},function(d){return api('admin/packages'+(id?'/'+id:''),id?'PUT':'POST',d).then(function(){return function(){toast('Saved');V.hub()}})})};
window.wzPkDel=function(id){sure('Delete this package?',function(){api('admin/packages/'+id,'DELETE').then(function(){toast('Deleted');V.hub()}).catch(function(e){if(e.message!=='auth')toast(e.message,1)})})};
function fill(){var b=$$('hbody');if(!b)return;
 if(cur===1)b.innerHTML=need();
 else if(cur===2)zones().then(function(h){b.innerHTML=h;icons()});
 else if(cur===3)pkgs().then(function(h){b.innerHTML=h;icons()});
 icons()}
var ov=V.hub;
V.hub=function(){
 if(!skip&&cur<4){P('Migration & Network Devices','<div id="wzbar">'+bar()+'</div><div id="hbody"></div>');fill();return Promise.resolve()}
 return Promise.resolve(ov()).then(function(){var t=$$('hbtabs');if(t)t.style.display='none';if(!$$('wzbar')&&$$('v'))$$('v').insertAdjacentHTML('afterbegin','<div id="wzbar">'+bar()+'</div>')})};
new MutationObserver(function(){
 if(location.hash!=='#hub')return;
 var v=$$('v');if(v&&v.firstChild&&!$$('wzbar'))v.insertAdjacentHTML('afterbegin','<div id="wzbar">'+bar()+'</div>');
 var t=$$('hbtabs');if(t&&t.style.display!=='none')t.style.display='none';
}).observe(document.body,{childList:true,subtree:true});
if(typeof go==='function')go();
})();