/* BillKora demo.js: demo Excel download on wizard step 1. Loads last. */
(function(){
function mk(){
 var H=['Customer Name','Phone','PPPoE Username','PPPoE Password','Package','Monthly Bill','Previous Due','Zone','Subzone','Address','IP Address','MAC Address'];
 var rows=[H,
  ['Rahim Uddin','01711000001','rahim01','pass1234','10 Mbps',500,0,'Mirpur','Block A','House 12, Road 3, Mirpur','10.10.1.11','AA:BB:CC:00:00:01'],
  ['Karim Hossain','01811000002','karim02','pass2345','20 Mbps',700,700,'Mirpur','Block B','House 5, Road 7, Mirpur','10.10.1.12','AA:BB:CC:00:00:02'],
  ['Salma Begum','01911000003','salma03','pass3456','30 Mbps',850,0,'Uttara','Sector 4','Flat 3B, Sector 4, Uttara','10.10.2.13','AA:BB:CC:00:00:03']];
 var ws=XLSX.utils.aoa_to_sheet(rows);
 ws['!cols']=H.map(function(h){return {wch:Math.max(14,h.length+2)}});
 var wb=XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb,ws,'Customers');
 XLSX.writeFile(wb,'billkora-demo-customers.xlsx');
}
window.wzDemo=function(){try{mk();toast('Demo Excel file downloaded')}catch(e){toast('Could not create file: '+e.message,1)}};
function inject(){
 var c=document.querySelector('.wzc');
 if(!c||document.getElementById('wzdemo'))return;
 if(c.textContent.indexOf('Information BillKora needs')<0)return;
 var bar=c.querySelector('.bar2');
 if(bar)bar.insertAdjacentHTML('afterbegin','<button class="btn" id="wzdemo" onclick="wzDemo()">Download demo Excel file</button>');
}
new MutationObserver(inject).observe(document.body,{childList:true,subtree:true});
inject();
})();