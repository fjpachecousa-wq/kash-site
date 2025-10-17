// public/reset-on-home.js
(function(){
  var FLAG = "__kash_reset_on_home";
  var RELOADED = "__kash_reloaded_once";

  function clearMemory(){
    try {
      localStorage.removeItem("kashId");
      localStorage.removeItem("kash_form");
      localStorage.removeItem("kash_company");
      localStorage.removeItem("kash_members");
    } catch(e){}
  }
  function markForReset(){
    try { sessionStorage.setItem(FLAG, "1"); } catch(e){}
  }
  function unmarkReset(){ try { sessionStorage.removeItem(FLAG); } catch(e){} }
  function wasMarked(){ try { return sessionStorage.getItem(FLAG) === "1"; } catch(e){ return false; } }
  function atHome(){ return location.pathname === "/" || location.pathname === ""; }

  function maybeDoResetNow(){
    if (!atHome() || !wasMarked()) return false;
    clearMemory();
    try {
      if (!sessionStorage.getItem(RELOADED)) {
        sessionStorage.setItem(RELOADED, "1");
        location.replace(location.pathname || "/");
        return true;
      } else {
        sessionStorage.removeItem(RELOADED);
      }
    } catch(e){}
    unmarkReset();
    return false;
  }
  if (maybeDoResetNow()) return;

  document.addEventListener("click", function(ev){
    var a = ev.target && ev.target.closest && ev.target.closest('a[href="/"], a[href="./"], a[href="#/"], a[href="#"]');
    if (a) markForReset();
  }, true);

  try {
    var origPush = history.pushState;
    var origReplace = history.replaceState;
    function wrap(fn){
      return function(state, title, url){
        try {
          var dest = (typeof url === "string") ? new URL(url, location.origin) : null;
          if (dest && (dest.pathname === "/" || dest.pathname === "")) markForReset();
        } catch(e){}
        return fn.apply(this, arguments);
      };
    }
    history.pushState = wrap(origPush);
    history.replaceState = wrap(origReplace);
    window.addEventListener("popstate", function(){
      if (atHome()) { markForReset(); maybeDoResetNow(); }
    });
  } catch(e){}

  var tries = 0;
  var timer = setInterval(function(){
    tries++;
    if (maybeDoResetNow() || tries > 40) clearInterval(timer);
  }, 100);
})();