(function(){
  window.is_mobile = true;
  function iOS(){
    var platforms = ['iPad Simulator','iPhone Simulator','iPod Simulator','iPad','iPhone','iPod'];
    return platforms.indexOf(navigator.platform) !== -1 || (navigator.userAgent.indexOf('Mac') !== -1 && 'ontouchend' in document);
  }
  window.is_ios = iOS();

  function startWhenReady(){
    if (typeof window.FullScreenMario === 'function') {
      try { window.FullScreenMario(); } catch(e) {}
    } else {
      setTimeout(startWhenReady, 50);
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    startWhenReady();
  } else {
    window.addEventListener('DOMContentLoaded', startWhenReady);
  }
})();
