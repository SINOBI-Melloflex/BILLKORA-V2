/* BillKora: one feature, one place. Loads last. */
(function(){
window.fillC=function(q){q=(q||'').toLowerCase();var t=document.getElementById('ct');if(!t)return;
 t.innerHTML=tbl(['ID','Name','Phone','Package','Status','Actions'],D.c.filter(function(c){return (c.name+c.phone+c.cid+c.username).toLowerCase().indexOf(q)>-1}).map(function(c){return [c.cid,esc(c.name),esc(c.phone),esc(pname(c.packageId)),bdg(c.status),'<div class="act"><button class="btn sm" onclick="editC(\''+c.id+'\')">Edit</button><button class="btn sm red" onclick="delC(\''+c.id+'\')">Delete</button></div>']}))};
window.fillI=function(){var f=document.getElementById('fl').value;
 document.getElementById('it').innerHTML=tbl(['Invoice','Customer','Month','Amount','Due Date','Status','Actions'],D.i.filter(function(i){return !f||i.status===f}).map(function(i){return [i.no,esc(i.customer),i.month,money(i.amount),i.due,bdg(i.status),'<div class="act"><button class="btn sm o2" onclick="viewI(\''+i.id+'\')">View</button><button class="btn sm red" onclick="delI(\''+i.id+'\')">Delete</button></div>']}))};
V.network=function(){return Promise.all([api('admin/customers'),api('admin/devices'),api('admin/packages')]).then(function(r){D.c=r[0];D.d=r[1];D.p=r[2];
 var on=r[1].filter(function(d){return d.status==='online'}).length;
 P('Network / Devices','<div class="grid">'+stat('wifi','Devices Online',on)+stat('alert','Devices Offline',r[1].length-on)+stat('home','Total Devices',r[1].length)+'</div><div class="card" style="margin-top:16px"><div class="bar2"><button class="btn" onclick="editD()"><i data-i="plus"></i> Add Device</button></div>'+tbl(['Customer','Type','IP','MAC','Status','Actions'],r[1].map(function(d){return [esc(cname(d.customerId)),esc(d.type),esc(d.ip),esc(d.mac),bdg(d.status),'<div class="act"><button class="btn sm" onclick="editD(\''+d.id+'\')">Edit</button><button class="btn sm red" onclick="delD(\''+d.id+'\')">Delete</button></div>']}))+'</div>')})};
if(typeof go==='function')go();
})();