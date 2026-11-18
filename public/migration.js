/* BillKora - Data/Device Migration page + read-only Network view */
(function(){
var FIELDS=[
{k:'username',l:'Username / PPPoE login',g:['username','user','login','loginid','pppoe','pppoeuser','secret','name']},
{k:'pass',l:'Password',g:['password','pass','pwd']},
{k:'name',l:'Customer name',g:['customername','fullname','customer','client','clientname','subscriber','comment','name']},
{k:'phone',l:'Phone',g:['phone','mobile','mobileno','phoneno','contact','cell']},
{k:'email',l:'Email',g:['email','mail','emailaddress']},
{k:'address',l:'Address',g:['address','location','area']},
{k:'nid',l:'NID / ID no.',g:['nid','nidno','nationalid','idno']},
{k:'pkg',l:'Package / Profile',g:['package','profile','plan','service','speed']},
{k:'status',l:'Status / Disabled',g:['status','disabled','state']}];
var S={};
function reset(){S={step:1,pm:{},mode:'skip',inv:false,map:{},pk:[]}}
function g(r,k){var i=S.map[k];return i>=0?String(r[i]==null?'':r[i]).trim():''}
function mapSt(v){v=v.toLowerCase();if(!v)return 'active';if(/disconn|terminat|inactive|cancel|left/.test(v))return 'disconnected';if(/suspend|disable|expire|block|hold|^(yes|true|y|1)$/.test(v))return 'suspended';return 'active'}
function guess(){var n=S.head.map(function(x){return String(x).toLowerCase().replace(/[^a-z0-9]/g,'')}),used={},m={};
 FIELDS.forEach(function(f){var j=-1;
  f.g.forEach(function(a){if(j<0)j=n.findIndex(function(x,i){return !used[i]&&x===a})});
  if(j<0)f.g.forEach(function(a){if(j<0&&a.length>3&&a!=='name')j=n.findIndex(function(x,i){return !used[i]&&x.indexOf(a)>-1})});
  m[f.k]=j;if(j>=0)used[j]=true});
 return m}
function loadSheet(n){S.sheet=n;
 var a=XLSX.utils.sheet_to_json(S.wb.Sheets[n],{header:1,defval:'',raw:false,blankrows:false}).filter(function(r){return r.some(function(c){return String(c).trim()!==''})});
 if(a.length<2){toast('This sheet has no data rows',1);return}
 S.head=a[0].map(function(h,i){return String(h).trim()||('Column '+(i+1))});S.data=a.slice(1);S.map=guess();S.pm={};S.step=2;draw()}
function build(){var seen={},dup=0,bad=0,out=[];
 S.data.forEach(function(r){var u=g(r,'username').toLowerCase(),n=g(r,'name'),ph=g(r,'phone');
  if(!u&&!n){bad++;return}
  if(u){if(seen[u])dup++;seen[u]=1}
  if(/^1[3-9]\d{8}$/.test(ph))ph='0'+ph;
  out.push({username:u,pass:g(r,'pass'),name:n,phone:ph,email:g(r,'email'),address:g(r,'address'),nid:g(r,'nid'),pkg:g(r,'pkg'),status:S.map.status<0?'':mapSt(g(r,'status'))})});
 return {rows:out,dup:dup,bad:bad}}
function pkgKeyList(){if(S.map.pkg<0)return [''];var seen={},out=[];S.data.forEach(function(r){var v=g(r,'pkg');if(v&&!seen[v]){seen[v]=1;out.push(v)}});return out}
function autoPm(v){if(v==='')return S.pk[0]?{t:S.pk[0].id}:{t:'__none'};
 var l=v.toLowerCase().replace(/\s+/g,''),n=parseInt(v.replace(/[^0-9]/g,''),10)||0,p=S.pk.filter(function(x){return x.name.toLowerCase().replace(/\s+/g,'')===l})[0];
 if(!p&&n)p=S.pk.filter(function(x){return Number(x.speed)===n})[0];
 return p?{t:p.id}:{t:'__new',price:''}}
function pkgKey(r){return S.map.pkg<0?'':r.pkg}
function pmLabel(r){var k=pkgKey(r);if(S.map.pkg>=0&&!k)return 'First package';var c=S.pm[k];if(!c||c.t==='__none')return 'First package';if(c.t==='__new')return 'New: '+k;var p=S.pk.filter(function(x){return x.id===c.t})[0];return p?p.name:'First package'}
function pid(r,ids){var k=pkgKey(r);if(S.map.pkg>=0&&!k)return '';var c=S.pm[k];if(!c||c.t==='__none')return '';if(c.t==='__new')return ids[k]||'';return c.t}
function sel(k){return '<select onchange="mgMap(\''+k+'\',this.value)"><option value="-1">- not in my file -</option>'+S.head.map(function(h,i){return '<option value="'+i+'"'+(S.map[k]===i?' selected':'')+'>'+esc(h)+'</option>'}).join('')+'</select>'}
function pmSel(k){var c=S.pm[k]||{t:'__none'};
 return '<select data-k="'+esc(k)+'" onchange="mgPm(this.dataset.k,this.value)">'+S.pk.map(function(p){return '<option value="'+esc(p.id)+'"'+(c.t===p.id?' selected':'')+'>'+esc(p.name)+' - '+money(p.price)+'</option>'}).join('')
  +(k!==''?'<option value="__new"'+(c.t==='__new'?' selected':'')+'>+ Create new package "'+esc(k)+'"</option>':'')
  +'<option value="__none"'+(c.t==='__none'?' selected':'')+'>Use the first package</option></select>'}
function steps(){var t=['Upload file','Match columns','Check & import','Done'];return '<div class="bar2">'+t.map(function(x,i){return '<span class="bd '+(S.step===i+1?'l':'g')+'">'+(i+1)+'. '+x+'</span>'}).join(' ')+'</div>'}
function d1(){return '<div class="card"><h3>Moving from another billing software?</h3><p class="muted" style="margin:6px 0 14px;line-height:1.6">Put your user list (for example MikroTik PPP Secrets, or an export from your old billing software) into an Excel or CSV file and upload it here. You match the columns in the next step, so any file layout works. Nothing is saved until you press Import.</p><div class="bar2"><input id="mgf" type="file" accept=".xlsx,.xls,.csv" style="display:none" onchange="mgFile(this)"><button class="btn" onclick="document.getElementById(\'mgf\').click()">Choose Excel / CSV file</button><button class="btn o2" onclick="mgTpl()">Download blank Excel template</button></div></div>'}
function d2(){var shs=S.wb.SheetNames,ss=shs.length>1?' Sheet: <select onchange="mgSheet(this.value)">'+shs.map(function(x){return '<option'+(x===S.sheet?' selected':'')+'>'+esc(x)+'</option>'}).join('')+'</select>':'';
 var rows=FIELDS.map(function(f){var i=S.map[f.k];return [esc(f.l)+((f.k==='username'||f.k==='name')?' <span class="muted">(at least one)</span>':''),sel(f.k),'<span class="muted">'+(i>=0&&S.data[0]?esc(S.data[0][i]):'')+'</span>']});
 return '<div class="card"><h3>Match your columns</h3><p class="muted" style="margin:6px 0 12px">'+esc(S.fname)+' - '+S.data.length+' rows found.'+ss+' We guessed the matches. Change any that look wrong.</p>'+tbl(['BillKora field','Column in your file','Example (first row)'],rows)+'<div class="bar2" style="margin-top:14px"><button class="btn o2" onclick="mgBack(1)">Back</button><button class="btn" onclick="mgNext()">Next</button></div></div>'}
function d3(){var b=build(),keys=pkgKeyList(),
 pr=keys.map(function(k){var c=S.pm[k]||{t:'__none'};return [k===''?'All customers':esc(k),pmSel(k)+(c.t==='__new'?' <input type="number" min="1" placeholder="Monthly price" value="'+esc(c.price||'')+'" data-k="'+esc(k)+'" oninput="mgPrice(this.dataset.k,this.value)" style="width:150px">':'')]}),
 ex=b.rows.slice(0,8).map(function(r){return [esc(r.username||'(auto)'),esc(r.name||r.username),esc(r.phone),esc(pmLabel(r)),bdg(r.status||'active')]});
 return '<div class="card"><h3>Packages</h3><p class="muted" style="margin:6px 0 12px">Match each package/profile in your file with a BillKora package.</p>'+tbl(['In your file','BillKora package'],pr)+'</div>'
 +'<div class="card" style="margin-top:16px"><h3>Options</h3><p class="muted" style="margin:6px 0 8px">If a username already exists in BillKora:</p><select onchange="mgOpt(\'mode\',this.value)"><option value="skip"'+(S.mode==='skip'?' selected':'')+'>Skip it (keep the existing customer)</option><option value="update"'+(S.mode==='update'?' selected':'')+'>Update the existing customer</option></select><label style="display:flex;gap:8px;align-items:center;margin-top:12px"><input type="checkbox"'+(S.inv?' checked':'')+' onchange="mgOpt(\'inv\',this.checked)"> Also create this month\'s bill for every imported customer</label></div>'
 +'<div class="card" style="margin-top:16px"><h3>Check before importing</h3><p style="margin:6px 0 12px"><b>'+b.rows.length+'</b> customers ready to import'+(b.bad?' &middot; '+b.bad+' empty rows will be ignored':'')+(b.dup?' &middot; '+b.dup+' repeated usernames inside the file':'')+'</p>'+tbl(['Username','Name','Phone','Package','Status'],ex)+'<p class="muted" style="margin-top:8px">First 8 rows shown. Status "yes / true / disabled / suspended" in your file becomes Suspended.</p><div class="bar2" style="margin-top:14px"><button class="btn o2" onclick="mgBack(2)">Back</button><button class="btn" onclick="mgGo()">Import '+b.rows.length+' customers</button></div></div>'}
function d4(){if(!S.res)return '<div class="card"><h3>Importing...</h3><p id="mgp" class="muted">'+esc(S.prog||'')+'</p></div>';
 var t=S.res.tot,h='';
 if(S.res.err)h+='<div class="card" style="border:1px solid #e5484d;margin-bottom:16px"><b>Stopped: '+esc(S.res.err)+'</b><p class="muted">Customers imported before the error are already saved.</p></div>';
 return h+'<div class="grid">'+stat('users','Added',t.added)+stat('clock','Updated',t.updated)+stat('alert','Skipped',t.skipped.length)+'</div>'
 +(t.skipped.length?'<div class="card" style="margin-top:16px"><h3>Skipped rows</h3>'+tbl(['Username / name','Reason'],t.skipped.slice(0,100).map(function(s){return [esc(s.who),esc(s.why)]}))+'<div class="bar2" style="margin-top:12px"><button class="btn o2" onclick="mgSkipCsv()">Download skipped list</button></div></div>':'')
 +'<div class="card" style="margin-top:16px"><p class="muted" style="line-height:1.6;margin-bottom:12px">Customers without a password in your file got their phone number as the password (or 123456 if there was no phone). Ask them to change it after the first login.</p><div class="bar2"><a class="btn" href="#customers">View Customers</a><button class="btn o2" onclick="mgAgain()">Import another file</button></div></div>'}
function draw(){P('Data / Device Migration',steps()+[d1,d2,d3,d4][S.step-1]());var a=document.querySelector('.side a[data-v=customers]');if(a)a.classList.add('on')}
function setProg(){var e=$('mgp');if(e)e.textContent=S.prog}
window.mgFile=function(inp){var f=inp.files[0];if(!f)return;
 if(typeof XLSX==='undefined'){toast('Excel reader file (xlsx.full.min.js) is missing',1);return}
 var csvf=/\.csv$/i.test(f.name),r=new FileReader();
 r.onload=function(){try{S.wb=XLSX.read(csvf?r.result:new Uint8Array(r.result),{type:csvf?'string':'array'});S.fname=f.name;loadSheet(S.wb.SheetNames[0])}catch(e){toast('Could not read this file',1)}};
 if(csvf)r.readAsText(f);else r.readAsArrayBuffer(f)};
window.mgSheet=function(n){loadSheet(n)};
window.mgMap=function(k,v){S.map[k]=parseInt(v,10);draw()};
window.mgBack=function(n){S.step=n;draw()};
window.mgNext=function(){if(!(S.map.username>=0||S.map.name>=0)){toast('Match at least the Username or the Customer name column',1);return}
 pkgKeyList().forEach(function(k){if(!S.pm[k])S.pm[k]=autoPm(k)});S.step=3;draw()};
window.mgPm=function(k,v){S.pm[k]=v==='__new'?{t:'__new',price:(S.pm[k]&&S.pm[k].price)||''}:{t:v};draw()};
window.mgPrice=function(k,v){if(S.pm[k])S.pm[k].price=v};
window.mgOpt=function(k,v){S[k]=v};
window.mgAgain=function(){reset();api('admin/packages').then(function(p){S.pk=p;draw()})};
window.mgSkipCsv=function(){csv('migration-skipped',S.res.tot.skipped)};
window.mgTpl=function(){if(typeof XLSX==='undefined'){toast('Excel reader file (xlsx.full.min.js) is missing',1);return}
 var ws=XLSX.utils.aoa_to_sheet([['username','password','name','phone','email','address','nid','package','status'],['rahim01','12345678','Rahim Uddin','01711-000000','','Mirpur, Dhaka','','10 Mbps','active']]),wb=XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb,ws,'Customers');XLSX.writeFile(wb,'billkora-customer-template.xlsx')};
window.mgGo=function(){var b=build(),keys=pkgKeyList(),ids={},tot={added:0,updated:0,skipped:[]},B=200,seq=Promise.resolve(),i;
 for(i=0;i<keys.length;i++){var c0=S.pm[keys[i]];if(c0&&c0.t==='__new'&&!(Number(c0.price)>0)){toast('Enter a monthly price for the new package '+keys[i],1);return}}
 if(!b.rows.length){toast('Nothing to import',1);return}
 S.step=4;S.res=null;S.prog='Preparing...';draw();
 keys.forEach(function(k){var c=S.pm[k];if(c&&c.t==='__new')seq=seq.then(function(){return api('admin/packages','POST',{name:k,speed:parseInt(k.replace(/[^0-9]/g,''),10)||0,price:Number(c.price),desc:'Imported'}).then(function(r){ids[k]=r.id})})});
 for(i=0;i<b.rows.length;i+=B)(function(from){var part=b.rows.slice(from,from+B);
  seq=seq.then(function(){S.prog='Importing '+(from+1)+' - '+Math.min(from+B,b.rows.length)+' of '+b.rows.length+' ...';setProg();
   return api('admin/customers/import','POST',{mode:S.mode,invoice:S.inv,rows:part.map(function(r){return Object.assign({},r,{packageId:pid(r,ids)})})}).then(function(x){tot.added+=x.added;tot.updated+=x.updated;tot.skipped=tot.skipped.concat(x.skipped)})})})(i);
 seq.then(function(){S.res={tot:tot};draw()}).catch(function(e){if(e.message==='auth')return;S.res={tot:tot,err:e.message};draw()})};
V.migration=function(){reset();return api('admin/packages').then(function(p){S.pk=p;draw()})};
if(typeof go==='function'&&['#customers','#network','#migration'].indexOf(location.hash)>-1)go();
})();