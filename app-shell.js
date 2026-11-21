/* نوری ئیمان — پێکهاتەی ئەپ: دوگمەی گەڕانەوە بۆ پەڕەی سەرەکی لە هەموو پەڕەکان */
(function () {
  "use strict";
  var head = document.head;

  function add(tag, attrs) {
    var sel = tag + (attrs.rel ? '[rel="' + attrs.rel + '"]' : attrs.name ? '[name="' + attrs.name + '"]' : "");
    if (document.querySelector(sel)) return;
    var el = document.createElement(tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    head.appendChild(el);
  }
  add("link", { rel: "manifest", href: "./manifest.webmanifest" });
  add("link", { rel: "apple-touch-icon", href: "./icons/apple-touch-icon.png" });
  add("meta", { name: "apple-mobile-web-app-capable", content: "yes" });
  add("meta", { name: "mobile-web-app-capable", content: "yes" });
  add("meta", { name: "apple-mobile-web-app-title", content: "نوری ئیمان" });
  add("meta", { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./service-worker.js").catch(function () {});
    });
  }

  var css = ".ni-home{position:fixed;z-index:2147483000;inset-inline-start:14px;" +
    "bottom:calc(14px + env(safe-area-inset-bottom,0px));display:inline-flex;align-items:center;gap:8px;" +
    "padding:10px 16px 10px 14px;border-radius:999px;border:1px solid rgba(233,199,119,.7);" +
    "background:linear-gradient(135deg,#0f5a43,#06261d);color:#f7f3e8;font:700 14px/1.2 'Noto Sans Arabic',system-ui,sans-serif;" +
    "text-decoration:none;box-shadow:0 8px 24px rgba(0,0,0,.45),inset 0 0 0 1px rgba(255,255,255,.06);" +
    "-webkit-tap-highlight-color:transparent;transition:transform .2s,box-shadow .2s}" +
    ".ni-home svg{width:20px;height:20px;flex:none;color:#e9c777}" +
    ".ni-home:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(0,0,0,.5)}" +
    ".ni-home:active{transform:scale(.97)}" +
    ".ni-home:focus-visible{outline:3px solid #e9c777;outline-offset:3px}" +
    "@media(max-width:420px){.ni-home{padding:10px 14px 10px 12px;font-size:13px}}" +
    "@media print{.ni-home{display:none}}" +
    "@media(prefers-reduced-motion:reduce){.ni-home{transition:none}}";
  var st = document.createElement("style");
  st.textContent = css;
  head.appendChild(st);

  function mount() {
    if (document.querySelector(".ni-home")) return;
    var a = document.createElement("a");
    a.className = "ni-home";
    a.href = "index.html";
    a.setAttribute("aria-label", "گەڕانەوە بۆ پەڕەی سەرەکی");
    a.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9.5h5v-6h4v6h5V10"/></svg><span>پەڕەی سەرەکی</span>';
    document.body.appendChild(a);
  }
  /* ئەگەر پەڕەکە شریتێکی چەسپاوی خوارەوەی هەبوو (وەک مینۆی خوارەوە)، دوگمەکە بەرزتر دەبێتەوە */
  function lift() {
    var btn = document.querySelector(".ni-home");
    if (!btn) return;
    var top = window.innerHeight, els = document.body.querySelectorAll("*");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el === btn || btn.contains(el)) continue;
      var cs = getComputedStyle(el);
      if (cs.position !== "fixed" || cs.display === "none" || cs.visibility === "hidden") continue;
      var r = el.getBoundingClientRect();
      if (r.height < 30 || r.width < window.innerWidth * 0.5) continue;
      if (r.bottom >= window.innerHeight - 48 && r.top > window.innerHeight * 0.5) top = Math.min(top, r.top);
    }
    btn.style.bottom = top < window.innerHeight ? (window.innerHeight - top + 12) + "px" : "";
  }
  function init() { mount(); lift(); window.addEventListener("resize", lift); window.addEventListener("load", lift); setTimeout(lift, 600); }
  if (document.body) init(); else document.addEventListener("DOMContentLoaded", init);
})();
