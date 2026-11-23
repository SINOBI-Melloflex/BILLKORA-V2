(function(){
  var MIN=0.6;
  function fit(){
    var z=Math.min(window.innerWidth/2400,window.innerHeight/1100);
    z=Math.max(MIN,Math.min(1,Math.round(z*100)/100));
    document.documentElement.style.zoom=(z===1?'':z);
  }
  fit();
  window.addEventListener('resize',fit);
})();