/* BillKora support.js: Support & Ticketing with searchable New Ticket. Loads last. */
(function(){
function ol(u){return api(u).then(function(r){return Array.isArray(r)?r:[]}).catch(function(e){if(e&&e.message==='auth')throw e;return []})}
function $g(i){return document.getElementById(i)}
var CATS=['Connection problem','Slow speed','Billing question','Package change','New installation','Relocation','Equipment / router','Other'];
var PRI=[['low','Low'],['normal','Normal'],['high','High'],['urgent','Urgent']];
var TK={c:[],s:[],sel:null};
var st=document.createElement('style');
st.textContent='.tkr{margin-top:6px}.tki{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:10px 12px;border:1px solid #e3e8f2;border-radius:10px;margin-bottom:6px;cursor:pointer;background:#fff;transition:.15s}.tki:hover{background:#eef5ff;border-color:#9dbdff;transform:translateX(3px)}.tki small{color:#6b7a99}.tkc{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;background:#eaf8ef;border:1px solid #b9e6c8;margin-top:6px}.tkc span{cursor:pointer;color:#d33;font-size:20px;line-height:1}.tkh{color:#6b7a99;font-size:13px;padding:6px 2px}body.dark .tki{background:#14213d;border-color:#2a3a5c;color:#dbe6ff}body.dark .tkc{background:#12301f;border-color:#2c6b44;color:#dbf5e5}';
document.head.appendChild(st);
function opts(a){return a.map(function(o){return '<option value="'+esc(o[0])+'">'+esc(o[1])+'</option>'}).join('')}
window.tkNew=function(){
 Promise.all([ol('admin/customers'),ol('admin/staff')]).then(function(r){
  TK.c=r[0];TK.s=r[1];TK.sel=null;
  var h='<label>Customer: type ID, phone number or name</label><input id="tks" placeholder="e.g. 01712345678, Rahim, customer ID" autocomplete="off"><div id="tkp"></div><div id="tkr" class="tkr"></div>'
  +'<div id="tkn"><label>Caller name</label><input id="tkcn"><label>Caller phone</label><input id="tkcp"></div>'
  +'<label>Subject <b>*</b></label><input id="tksub">'
  +'<label>Category</label><select id="tkcat">'+opts(CATS.map(function(x){return [x,x]}))+'</select>'
  +'<label>Priority</label><select id="tkpri">'+opts(PRI).replace('value="normal"','value="normal" selected')+'</select>'
  +'<label>Assign to staff</label><select id="tkas">'+opts([['','- Not assigned -']].concat(TK.s.map(function(s){return [s.name,s.name+' ('+(s.role||'')+')']})))+'</select>'
  +'<label>Details</label><textarea id="tkmsg"></textarea>'
  +'<div class="mf"><button type="button" class="btn o2" onclick="closeBox()">Cancel</button><button type="button" class="btn" onclick="tkSave()">Create Ticket</button></div>';
  box('New Ticket',h);
  var inp=$g('tks');inp.addEventListener('input',tkFind);inp.focus();
 }).catch(function(e){if(e&&e.message!=='auth')box('Could not open New Ticket','<p>'+esc(e&&e.message||String(e))+'</p>')})};
function tkFind(){
 var q=$g('tks').value.trim().toLowerCase(),box_=$g('tkr');
 if(!q){box_.innerHTML='';return}
 var m=TK.c.filter(function(c){return [c.cid,c.phone,c.name,c.username].join(' ').toLowerCase().indexOf(q)>-1}).slice(0,6);
 if(m.length){box_.innerHTML=m.map(function(c){return '<div class="tki" onclick="tkPick(\''+c.id+'\')"><b>'+esc(c.name)+'</b><small>'+esc(c.cid||'')+' &middot; '+esc(c.phone||'')+'</small></div>'}).join('')}
 else{
  box_.innerHTML='<div class="tkh">No customer found. Fill the caller name and phone below.</div>';
  if(/^[0-9+\- ]{6,}$/.test(q)){if(!$g('tkcp').value)$g('tkcp').value=$g('tks').value.trim()}
  else if(!$g('tkcn').value)$g('tkcn').value=$g('tks').value.trim();
 }
}
window.tkPick=function(id){
 var c=TK.c.filter(function(x){return x.id===id})[0];if(!c)return;
 TK.sel=c;$g('tks').style.display='none';$g('tkr').innerHTML='';$g('tkn').style.display='none';
 $g('tkp').innerHTML='<div class="tkc"><div><b>'+esc(c.name)+'</b><br><small>'+esc(c.cid||'')+' &middot; '+esc(c.phone||'')+'</small></div><span onclick="tkClear()" title="Change">&times;</span></div>';
};
window.tkClear=function(){
 TK.sel=null;$g('tkp').innerHTML='';$g('tks').style.display='';$g('tks').value='';$g('tkn').style.display='';$g('tks').focus();
};
window.tkSave=function(){
 var d={subject:$g('tksub').value.trim(),category:$g('tkcat').value,priority:$g('tkpri').value,assignedTo:$g('tkas').value,message:$g('tkmsg').value};
 if(TK.sel){d.customerId=TK.sel.id}
 else{d.customerId='';d.contactName=$g('tkcn').value.trim();d.contactPhone=$g('tkcp').value.trim();
  if(!d.contactName){toast('Search a customer, or type the caller name',1);return}}
 if(!d.subject){toast('Subject is required',1);return}
 api('admin/tkt2','POST',d).then(function(){closeBox();toast('Ticket created');go()}).catch(function(e){if(e.message!=='auth')toast(e.message,1)});
};
V.support=function(){return api('admin/tickets').then(function(t){D.t=t;
 var open=t.filter(function(x){return x.status!=='closed'}).length,urg=t.filter(function(x){return x.status!=='closed'&&(x.priority==='urgent'||x.priority==='high')}).length;
 P('Support & Ticketing','<div class="grid">'+stat('hp','Total Tickets',t.length)+stat('alert','Open',open)+stat('shield','High / Urgent',urg)+stat('home','Closed',t.length-open)+'</div>'
 +'<div class="card" style="margin-top:16px"><div class="bar2"><button class="btn" onclick="tkNew()"><i data-i="plus"></i> New Ticket</button></div>'
 +tbl(['Ticket','Customer','Subject','Category','Priority','Staff','Date','Status','Actions'],t.map(function(x){var who=(x.customer&&x.customer!=='-')?x.customer:(x.contactName?x.contactName+(x.contactPhone?' ('+x.contactPhone+')':''):'-');return [x.no,esc(who),esc(x.subject),esc(x.category||'-'),bdg(x.priority||'normal'),esc(x.assignedTo||'-'),fdate(x.date),bdg(x.status),'<div class="act"><button class="btn sm" onclick="repT(\''+x.id+'\')">View / Reply</button><button class="btn sm red" onclick="delT(\''+x.id+'\')">Delete</button></div>']}))+'</div>')})};
if(typeof go==='function')go();
})();