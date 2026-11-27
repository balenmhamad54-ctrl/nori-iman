/* ============================================================
   نوری ئیمان — مینۆی تەواو شاشە (Drawer)
   یەک فایل بۆ هەموو لاپەڕەکان: CSS + HTML + JS لێرەدایە.
   ============================================================ */
(function () {
  if (window.NiMenu) return;

  /* ---------- ئایکۆنەکان ---------- */
  var I = {
    home: '<path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M9.5 20v-6h5v6"/>',
    quran: '<rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="13" y2="16"/>',
    book: '<path d="M12 6c-2-1.5-5-2-8-1.5v14c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-14c-3-.5-6 0-8 1.5z"/><path d="M12 6v14"/>',
    bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>',
    compass: '<circle cx="12" cy="12" r="9"/><polygon points="15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5 15.5 8.5"/>',
    drop: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
    grid: '<rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/>',
    beads: '<circle cx="12" cy="5" r="2"/><circle cx="18.5" cy="12" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="5.5" cy="12" r="2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/>',
    heart: '<path d="M12 20s-7-4.5-9-9.2C1.8 7.4 4 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3 0 5.2 2.9 4 6.3C19 15.5 12 20 12 20z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    star: '<polygon points="12 3 14.7 9 21 9.6 16.2 13.9 17.7 20.2 12 16.9 6.3 20.2 7.8 13.9 3 9.6 9.3 9"/>',
    scroll: '<path d="M8 4h11v13a3 3 0 0 1-3 3H6a3 3 0 0 0 3-3V6a2 2 0 0 0-1-2z"/><path d="M8 4a2 2 0 0 0-2 2v1h3"/><line x1="12" y1="9" x2="16" y2="9"/><line x1="12" y1="13" x2="16" y2="13"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M18 14.8c2 .6 3.2 2.4 3.5 5.2"/>',
    kaaba: '<path d="M4 8l8-4 8 4v10l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v10"/>',
    play: '<rect x="3" y="5" width="18" height="14" rx="3"/><polygon points="10.5 9.5 15 12 10.5 14.5 10.5 9.5"/>',
    cap: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M14.5 9c-.5-1-1.5-1.5-2.7-1.5-1.5 0-2.600.8-2.600 2 0 3 5.500 1.500 5.500 4.500 0 1.200-1.200 2-2.800 2-1.300 0-2.400-.6-2.900-1.700M12 5.500v1.500M12 17v1.500"/>',
    calc: '<rect x="5" y="3" width="14" height="18" rx="2.5"/><rect x="8" y="6" width="8" height="3.500" rx=".8"/><path d="M8.500 13h.01M12 13h.01M15.500 13h.01M8.500 17h.01M12 17h.01M15.500 17h.01"/>',
    scale: '<path d="M12 3v18M6 21h12M5 7h14"/><path d="M5 7l-3 7a3.500 3.500 0 0 0 6 0zM19 7l-3 7a3.500 3.500 0 0 0 6 0z"/>',
    baby: '<circle cx="12" cy="9" r="5"/><path d="M9.500 9.500h.01M14.500 9.500h.01M10 12c.6.6 1.300.9 2 .9s1.400-.3 2-.9"/><path d="M6 20c.8-2.400 3-3.700 6-3.700s5.200 1.300 6 3.700"/>',
    info: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16.500"/><circle cx="12" cy="7.800" r=".7" fill="currentColor"/>',
    quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.500 9.500a2.500 2.500 0 1 1 3.500 2.300c-.7.4-1 .9-1 1.700"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
    hands: '<path d="M7 11V6.500a1.500 1.500 0 0 1 3 0V11M10 10V4.500a1.500 1.500 0 0 1 3 0V10M13 10V5.500a1.500 1.500 0 0 1 3 0V12"/><path d="M16 9.500a1.500 1.500 0 0 1 3 0V14c0 4-2.500 7-6.500 7-3 0-5-1.500-6.500-4L3.500 13a1.600 1.600 0 0 1 2.600-1.800L8 13"/>'
  };

  /* ---------- لیستی بەشەکان ---------- */
  var GROUPS = [
    { t: 'سەرەکی', items: [
      ['index', 'سەرەکی', 'home', 'home'],
      ['quran', 'قورئان', 'quran', 'quran'],
      ['chirokPexambaran', 'چیرۆکەکانی پێغەمبەران', 'bookmark', 'chirok prophets story'],
      ['katakanyBang', 'کاتەکانی بانگ', 'clock', 'prayer times bang adhan'],
      ['qiblanma', 'قیبلەنما', 'compass', 'qibla'],
      ['tasbih', 'سەبەحەی ئەلیکترۆنی', 'beads', 'tasbih']
    ]},
    { t: 'نوێژ و پاکبوونەوە', items: [
      ['nwezh', 'نوێژ', 'moon', 'nwezh salah'],
      ['jorakanynwezh', 'جۆرەکانی نوێژ', 'grid', 'types of prayer'],
      ['ferbwni-nwez', 'فێربوونی نوێژ', 'cap', 'learn prayer'],
      ['dastnwezh', 'دەستنوێژ', 'drop', 'wudu'],
      ['nyatwDastnwezh', 'نیەتی دەستنوێژ', 'heart', 'niyyah'],
      ['duayDastpek', 'دوعای دەستپێکی نوێژ', 'hands', 'dua opening'],
      ['takbirwDastpekrdnyNwezh', 'تەکبیر و دەستپێکردنی نوێژ', 'star', 'takbir']
    ]},
    { t: 'دوعا و زیکر', items: [
      ['dua', 'دوعا و زیکر', 'hands', 'dua zikr'],
      ['zikrBaynyan', 'زیکری بەیانی و ئێواران', 'sun', 'morning evening adhkar'],
      ['du3a', 'دوعای بارودۆخەکان', 'heart', 'situations dua'],
      ['hadith', 'حەدیسی پیرۆز', 'scroll', 'hadith'],
      ['naw', 'ناوە جوانەکانی خوا', 'star', 'asma ul husna names of allah']
    ]},
    { t: 'فێربوون و زانیاری', items: [
      ['nawPexambaran', 'پێغەمبەران', 'users', 'prophets'],
      ['mezhuwi-islam', 'مێژووی ئیسلام', 'scroll', 'history'],
      ['payekaniBawar', 'پایەکانی ئیسلام و باوەڕ', 'kaaba', 'pillars iman'],
      ['ebadat', 'خشتەی عیبادەت', 'calendar', 'worship schedule'],
      ['zhyanyRozhana', 'ژیانی ڕۆژانەی موسڵمان', 'sun', 'daily life'],
      ['hajj', 'فێربوونی حەج', 'kaaba', 'hajj'],
      ['umrah', 'فێربوونی عومرە', 'kaaba', 'umrah'],
      ['library', 'ڤیدیۆکان', 'play', 'video library'],
      ['acadimyayislam', 'ئەکادیمیا', 'cap', 'academy'],
      ['quiz', 'تاقیکردنەوەی ئیسلامی', 'quiz', 'quiz test']
    ]},
    { t: 'ئامراز و زیاتر', items: [
      ['taqweem', 'ڕۆژژمێری هیجری', 'calendar', 'calendar hijri'],
      ['zakat', 'زەکات', 'coin', 'zakat'],
      ['calculator', 'ژمێرەر', 'calc', 'calculator'],
      ['talaq', 'تەڵاق و مافە داراییەکان', 'scale', 'talaq rights'],
      ['nameMnal', 'ناوی منداڵان', 'baby', 'baby names'],
      ['about', 'دەربارەی ئێمە', 'info', 'about']
    ]}
  ];

  var THEMES = [
    ['emerald', 'زمرووت', '#0b3026', '#e9c777'],
    ['sapphire', 'یاقووت', '#0d1f3c', '#8fd0ff'],
    ['amethyst', 'ئەمەتیست', '#21153a', '#e8b4f8'],
    ['copper', 'مس', '#351619', '#ffb88a'],
    ['night', 'شەو', '#141416', '#f5c542']
  ];
  var TH_K = 'ni-theme', TH_C = 'ni-accent';

  var ARROW = '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>';
  function svg(k) { return '<svg viewBox="0 0 24 24">' + (I[k] || I.grid) + '</svg>'; }
  function ls(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lset(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} }

  var cur = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';

  /* ---------- CSS ---------- */
  var css = '' +
    '.nx-bd{position:fixed;inset:0;z-index:10020;background:rgba(0,0,0,.72);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);opacity:0;visibility:hidden;transition:.3s ease}' +
    '.nx-bd.show{opacity:1;visibility:visible}' +
    '.nx{--a:var(--t-acc,#f5ca5c);--a2:var(--t-acc2,#fae08c);position:fixed;inset:0;z-index:10021;display:flex;justify-content:center;align-items:flex-start;overflow-y:auto;overscroll-behavior:contain;padding:14px 12px calc(40px + env(safe-area-inset-bottom));direction:rtl;font-family:"Vazirmatn","Noto Sans Arabic",system-ui,sans-serif;' +
      'background:radial-gradient(ellipse at 85% 0,color-mix(in srgb,var(--a) 14%,transparent),transparent 45%),radial-gradient(ellipse at 0 90%,color-mix(in srgb,var(--a) 9%,transparent),transparent 40%),linear-gradient(180deg,#07080a,#0b0d10);' +
      'opacity:0;visibility:hidden;transform:translateY(22px) scale(.985);transition:opacity .3s ease,transform .38s cubic-bezier(.22,1,.36,1),visibility .3s}' +
    '.nx.show{opacity:1;visibility:visible;transform:none}' +
    '.nx *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}' +
    '.nx a{text-decoration:none;color:inherit}' +
    '.nx-box{width:min(100%,460px);display:flex;flex-direction:column;gap:12px;transition:transform .25s ease}' +
    /* hero */
    '.nx-hero{position:relative;overflow:hidden;border-radius:26px;padding:18px;border:1px solid color-mix(in srgb,var(--a) 30%,transparent);' +
      'background:radial-gradient(circle at 85% 22%,color-mix(in srgb,var(--a) 30%,transparent),transparent 62%),linear-gradient(145deg,color-mix(in srgb,var(--a) 20%,#14120d),#14130f 80%);box-shadow:0 16px 38px rgba(0,0,0,.5)}' +
    '.nx-hero::before{content:"";position:absolute;inset:-40%;background:conic-gradient(from 0deg,transparent 0 70%,color-mix(in srgb,var(--a) 22%,transparent) 85%,transparent);animation:nx-spin 9s linear infinite;pointer-events:none;opacity:.55}' +
    '.nx-hero::after{content:"";position:absolute;inset:1px;border-radius:25px;background:linear-gradient(145deg,color-mix(in srgb,var(--a) 14%,#15130e),#12110e 85%);pointer-events:none;z-index:0}' +
    '.nx-hero>*{position:relative;z-index:1}' +
    '@keyframes nx-spin{to{transform:rotate(360deg)}}' +
    '.nx-top{display:flex;align-items:center;justify-content:space-between;gap:14px}' +
    '.nx-brand{display:flex;align-items:center;gap:14px}' +
    '.nx-moon{width:58px;height:58px;border-radius:18px;background:linear-gradient(135deg,var(--a2),var(--a));color:#111317;display:grid;place-items:center;flex-shrink:0;box-shadow:0 8px 24px color-mix(in srgb,var(--a) 38%,transparent);animation:nx-float 4.5s ease-in-out infinite}' +
    '.nx-moon svg{width:29px;height:29px;fill:currentColor}' +
    '@keyframes nx-float{50%{transform:translateY(-3px) rotate(-4deg)}}' +
    '.nx-titles h3{font-size:22px;font-weight:800;color:#fff;line-height:1.35;margin:0}' +
    '.nx-titles p{font-size:12.5px;color:#d6ceb8;margin:2px 0 0}' +
    '.nx-close{width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.08);color:#fff;font-size:16px;display:grid;place-items:center;flex-shrink:0;cursor:pointer;transition:.25s}' +
    '.nx-close:hover,.nx-close:active{background:rgba(255,255,255,.18);transform:rotate(90deg)}' +
    '.nx-pill{margin-top:15px;padding:10px 14px;border-radius:15px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:10px;font-size:12.5px;color:#ebe4d3}' +
    '.nx-pill i{width:8px;height:8px;border-radius:50%;background:var(--a);box-shadow:0 0 10px var(--a);flex-shrink:0;animation:nx-pulse 2s ease-in-out infinite}' +
    '@keyframes nx-pulse{50%{opacity:.35;transform:scale(.75)}}' +
    '.nx-pill b{font-weight:700;color:#fff;flex:1}' +
    '.nx-pill em{font-style:normal;direction:ltr;font-variant-numeric:tabular-nums;color:var(--a);font-weight:700;letter-spacing:.5px}' +
    /* search */
    '.nx-search{position:relative;display:flex;align-items:center}' +
    '.nx-search svg{position:absolute;inset-inline-start:15px;width:19px;height:19px;fill:none;stroke:var(--a);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}' +
    '.nx-search input{width:100%;height:50px;border-radius:18px;border:1px solid rgba(255,255,255,.09);background:#111316;color:#f5f2eb;font:inherit;font-size:14.5px;padding:0 46px;outline:none;transition:.25s}' +
    '.nx-search input::placeholder{color:#8b8f97}' +
    '.nx-search input:focus{border-color:color-mix(in srgb,var(--a) 55%,transparent);box-shadow:0 0 0 4px color-mix(in srgb,var(--a) 14%,transparent)}' +
    '.nx-clear{position:absolute;inset-inline-end:12px;width:26px;height:26px;border-radius:50%;border:0;background:rgba(255,255,255,.1);color:#ddd;font-size:12px;display:none;place-items:center;cursor:pointer}' +
    '.nx-clear.on{display:grid}' +
    /* groups */
    '.nx-list{display:flex;flex-direction:column;gap:10px}' +
    '.nx-gt{display:flex;align-items:center;gap:10px;margin:8px 4px 0;font-size:12.5px;font-weight:700;color:color-mix(in srgb,var(--a) 85%,#fff);letter-spacing:.2px}' +
    '.nx-gt::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,color-mix(in srgb,var(--a) 35%,transparent),transparent)}' +
    '.nx-gt:first-child{margin-top:0}' +
    '.nx-item{position:relative;overflow:hidden;display:flex;align-items:center;gap:14px;padding:11px 14px;border-radius:20px;border:1px solid rgba(255,255,255,.07);background:linear-gradient(180deg,#17191d,#111316);color:#f5f2eb;box-shadow:0 6px 18px rgba(0,0,0,.3);transition:transform .22s ease,border-color .22s ease}' +
    '.nx-item:active{transform:scale(.975)}' +
    '@media(hover:hover){.nx-item:hover{border-color:color-mix(in srgb,var(--a) 42%,transparent);transform:translateY(-2px)}}' +
    '.nx-ico{width:42px;height:42px;border-radius:13px;background:#22252b;border:1px solid rgba(255,255,255,.06);color:var(--a);display:grid;place-items:center;flex-shrink:0}' +
    '.nx-ico svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}' +
    '.nx-label{flex:1;font-size:15.5px;font-weight:700;text-align:right;line-height:1.5}' +
    '.nx-arrow{width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.06);color:#b6bac2;display:grid;place-items:center;flex-shrink:0;transition:.25s}' +
    '.nx-arrow svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}' +
    '.nx-item:hover .nx-arrow{transform:translateX(-3px)}' +
    '.nx-item.active{background:linear-gradient(135deg,var(--a2),var(--a));border-color:transparent;color:#111317;box-shadow:0 10px 28px color-mix(in srgb,var(--a) 30%,transparent)}' +
    '.nx-item.active .nx-ico{background:#14171c;border-color:transparent;color:var(--a)}' +
    '.nx-item.active .nx-label{color:#111317;font-weight:800}' +
    '.nx-item.active .nx-arrow{background:rgba(0,0,0,.13);color:#111317}' +
    '.nx-item.active::after{content:"";position:absolute;top:0;bottom:0;width:60%;left:-70%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.45),transparent);transform:skewX(-18deg);animation:nx-shine 3.6s ease-in-out infinite}' +
    '@keyframes nx-shine{0%,55%{left:-70%}100%{left:130%}}' +
    /* stagger */
    '.nx.show .nx-hero,.nx.show .nx-search,.nx.show .nx-item,.nx.show .nx-gt,.nx.show .nx-foot{animation:nx-in .55s cubic-bezier(.22,1,.36,1) both;animation-delay:calc(var(--i,0)*30ms)}' +
    '@keyframes nx-in{from{opacity:0;transform:translateY(16px)}}' +
    /* empty */
    '.nx-empty{display:none;text-align:center;padding:30px 10px;color:#9a9ea6;font-size:14px}' +
    '.nx-empty.on{display:block}' +
    '.nx-empty svg{width:42px;height:42px;fill:none;stroke:var(--a);stroke-width:1.5;opacity:.7;margin-bottom:6px}' +
    /* footer */
    '.nx-foot{margin-top:6px;padding:16px;border-radius:22px;border:1px solid rgba(255,255,255,.07);background:linear-gradient(180deg,#15171b,#101215);display:flex;flex-direction:column;gap:14px}' +
    '.nx-foot h4{margin:0;font-size:13px;font-weight:700;color:color-mix(in srgb,var(--a) 85%,#fff)}' +
    '.nx-sw{display:flex;gap:12px;flex-wrap:wrap;align-items:center}' +
    '.nx-sw button{width:42px;height:42px;border-radius:50%;border:3px solid transparent;cursor:pointer;background:linear-gradient(135deg,var(--c1) 50%,var(--c2) 50%);transition:.2s;padding:0}' +
    '.nx-sw button.on{border-color:#fff;transform:scale(1.12)}' +
    '.nx-sw label{display:flex;align-items:center;gap:8px;font-size:12px;color:#a8acb4;cursor:pointer}' +
    '.nx-sw input[type=color]{width:42px;height:42px;border:0;border-radius:50%;padding:0;background:none;cursor:pointer}' +
    '.nx-acts{display:flex;gap:10px;flex-wrap:wrap}' +
    '.nx-act{flex:1;min-width:130px;height:46px;border-radius:15px;border:1px solid color-mix(in srgb,var(--a) 35%,transparent);background:color-mix(in srgb,var(--a) 10%,#14161a);color:var(--a);font:inherit;font-size:13.5px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:.2s}' +
    '.nx-act:active{transform:scale(.96)}' +
    '.nx-act svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
    '.nx-ver{text-align:center;font-size:11.5px;color:#6f737b;margin-top:2px}' +
    /* fab (تەنها لەو لاپەڕانەی داک نییە) */
    '.nx-fab{position:fixed;z-index:9980;bottom:calc(16px + env(safe-area-inset-bottom));inset-inline-start:16px;width:54px;height:54px;border-radius:18px;border:0;background:linear-gradient(135deg,var(--t-acc2,#fae08c),var(--t-acc,#f5ca5c));color:#111317;display:grid;place-items:center;box-shadow:0 10px 28px rgba(0,0,0,.45);cursor:pointer;transition:transform .2s}' +
    '.nx-fab:active{transform:scale(.92)}' +
    '.nx-fab svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
    '@media(prefers-reduced-motion:reduce){.nx *,.nx::before,.nx *::before,.nx *::after{animation:none!important;transition:none!important}}';

  var st = document.createElement('style');
  st.id = 'nx-style';
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- HTML ---------- */
  var drawer, backdrop, listEl, inp, clearBtn, emptyEl, pillB, pillE, deferredPrompt = null;
  var isOpen = false, built = false, tick = null;

  function build() {
    if (built) return;
    built = true;

    var n = 1, html = '';
    GROUPS.forEach(function (g) {
      html += '<div class="nx-gt" data-g style="--i:' + Math.min(n++, 14) + '">' + g.t + '</div>';
      g.items.forEach(function (it) {
        html += '<a href="' + it[0] + '.html" class="nx-item' + (cur === it[0] ? ' active' : '') + '" data-k="' + (it[1] + ' ' + it[3]).toLowerCase() + '" style="--i:' + Math.min(n++, 14) + '">' +
          '<span class="nx-ico">' + svg(it[2]) + '</span><span class="nx-label">' + it[1] + '</span><span class="nx-arrow">' + ARROW + '</span></a>';
      });
    });

    var sw = '';
    THEMES.forEach(function (t) {
      sw += '<button type="button" data-t="' + t[0] + '" title="' + t[1] + '" aria-label="' + t[1] + '" style="--c1:' + t[2] + ';--c2:' + t[3] + '"></button>';
    });

    backdrop = document.createElement('div');
    backdrop.className = 'nx-bd';

    drawer = document.createElement('aside');
    drawer.className = 'nx';
    drawer.setAttribute('aria-hidden', 'true');
    drawer.setAttribute('aria-label', 'مینۆی بەشەکانی ماڵپەڕ');
    drawer.innerHTML =
      '<div class="nx-box">' +
        '<div class="nx-hero" style="--i:0">' +
          '<div class="nx-top"><div class="nx-brand"><div class="nx-moon"><svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg></div>' +
          '<div class="nx-titles"><h3>نوری ئیمان</h3><p>ماڵپەڕی ئیسلامی</p></div></div>' +
          '<button class="nx-close" type="button" aria-label="داخستنی مینۆ">✕</button></div>' +
          '<div class="nx-pill"><i></i><b>...</b><em>--:--</em></div>' +
        '</div>' +
        '<div class="nx-search" style="--i:1"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>' +
          '<input type="search" inputmode="search" enterkeyhint="search" autocomplete="off" placeholder="بگەڕێ لە هەموو بەشەکانی ماڵپەڕ..." aria-label="گەڕان">' +
          '<button class="nx-clear" type="button" aria-label="سڕینەوە">✕</button></div>' +
        '<div class="nx-list">' + html +
          '<div class="nx-empty"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg><div>هیچ بەشێک نەدۆزرایەوە</div></div>' +
        '</div>' +
        '<div class="nx-foot" style="--i:14">' +
          '<h4>🎨 ڕەنگی ئەپەکە</h4>' +
          '<div class="nx-sw">' + sw + '<label><input type="color" value="#e9c777">ڕەنگی دڵخواز</label></div>' +
          '<div class="nx-acts">' +
            '<button class="nx-act" data-act="install" type="button" style="display:none"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 11l5 5 5-5M5 21h14"/></svg>دابەزاندنی ئەپ</button>' +
            '<button class="nx-act" data-act="share" type="button"><svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.600-4.400M8.200 13.200l7.600 4.400"/></svg>بڵاوکردنەوەی ئەپ</button>' +
          '</div>' +
          '<div class="nx-ver">نوری ئیمان ✦ هەموو بەشەکان لە یەک شوێن</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    listEl = drawer.querySelector('.nx-list');
    inp = drawer.querySelector('.nx-search input');
    clearBtn = drawer.querySelector('.nx-clear');
    emptyEl = drawer.querySelector('.nx-empty');
    pillB = drawer.querySelector('.nx-pill b');
    pillE = drawer.querySelector('.nx-pill em');

    drawer.querySelector('.nx-close').addEventListener('click', close);
    backdrop.addEventListener('click', close);
    listEl.addEventListener('click', function (e) {
      if (e.target.closest('.nx-item')) { buzz(); close(); }
    });

    inp.addEventListener('input', filter);
    clearBtn.addEventListener('click', function () { inp.value = ''; filter(); inp.focus(); });

    /* ڕەنگەکان */
    var sws = drawer.querySelectorAll('[data-t]');
    var col = drawer.querySelector('input[type=color]');
    function mark() {
      var t = ls(TH_K) || 'emerald';
      sws.forEach(function (b) { b.classList.toggle('on', b.dataset.t === t && !ls(TH_C)); });
    }
    mark();
    sws.forEach(function (b) {
      b.addEventListener('click', function () { lset(TH_K, b.dataset.t); lset(TH_C, null); applyTheme(); mark(); buzz(); });
    });
    col.addEventListener('input', function (e) { lset(TH_C, e.target.value); applyTheme(); mark(); });

    /* دابەزاندن / بڵاوکردنەوە */
    var instBtn = drawer.querySelector('[data-act=install]');
    function showInstall() { if (deferredPrompt) instBtn.style.display = 'flex'; }
    window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferredPrompt = e; showInstall(); });
    showInstall();
    instBtn.addEventListener('click', function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(function () { deferredPrompt = null; instBtn.style.display = 'none'; });
    });
    drawer.querySelector('[data-act=share]').addEventListener('click', function (e) {
      var url = location.origin + location.pathname.replace(/[^\/]*$/, '');
      var btn = e.currentTarget;
      if (navigator.share) {
        navigator.share({ title: 'نوری ئیمان', text: 'ماڵپەڕی ئیسلامی نوری ئیمان', url: url }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () {
          var old = btn.innerHTML;
          btn.textContent = '✓ لینکەکە کۆپی کرا';
          setTimeout(function () { btn.innerHTML = old; }, 1800);
        });
      }
    });

    /* کێشانی بۆ خوارەوە بۆ داخستن */
    var box = drawer.querySelector('.nx-box'), y0 = null, dy = 0;
    drawer.addEventListener('touchstart', function (e) {
      y0 = drawer.scrollTop <= 0 ? e.touches[0].clientY : null; dy = 0;
    }, { passive: true });
    drawer.addEventListener('touchmove', function (e) {
      if (y0 == null) return;
      dy = e.touches[0].clientY - y0;
      if (dy > 0 && drawer.scrollTop <= 0) {
        box.style.transition = 'none';
        box.style.transform = 'translateY(' + Math.min(dy * .6, 220) + 'px)';
      }
    }, { passive: true });
    drawer.addEventListener('touchend', function () {
      box.style.transition = '';
      box.style.transform = '';
      if (y0 != null && dy > 110) close();
      y0 = null; dy = 0;
    });

    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) close(); });
  }

  /* ---------- یارمەتیدەرەکان ---------- */
  function buzz() { try { navigator.vibrate && navigator.vibrate(8); } catch (e) {} }

  function norm(s) {
    return String(s || '').toLowerCase()
      .replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/ى/g, 'ی').replace(/ة/g, 'ە')
      .replace(/[\u064B-\u065F\u0640]/g, '').replace(/\s+/g, ' ').trim();
  }

  function filter() {
    var q = norm(inp.value);
    clearBtn.classList.toggle('on', !!q);
    var items = listEl.querySelectorAll('.nx-item'), shown = 0;
    items.forEach(function (a) {
      var ok = !q || norm(a.dataset.k).indexOf(q) > -1;
      a.style.display = ok ? '' : 'none';
      if (ok) shown++;
    });
    /* سەردێڕی گرووپەکان: تەنها ئەگەر ئایتمێک لەژێریدا ماوە */
    listEl.querySelectorAll('[data-g]').forEach(function (g) {
      var el = g.nextElementSibling, any = false;
      while (el && !el.hasAttribute('data-g') && !el.classList.contains('nx-empty')) {
        if (el.style.display !== 'none') any = true;
        el = el.nextElementSibling;
      }
      g.style.display = any ? '' : 'none';
    });
    emptyEl.classList.toggle('on', shown === 0);
  }

  function applyTheme() {
    if (typeof window.niApplyTheme === 'function') return window.niApplyTheme();
    var d = document.documentElement, t = ls(TH_K) || 'emerald', a = ls(TH_C);
    d.setAttribute('data-theme', t);
    if (a) { d.style.setProperty('--t-acc', a); d.style.setProperty('--t-acc2', 'color-mix(in srgb,' + a + ' 60%,white)'); }
    else { d.style.removeProperty('--t-acc'); d.style.removeProperty('--t-acc2'); }
  }

  /* ---------- بەرواری هیجری و کاتژمێر ---------- */
  var DAYS = ['یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'هەینی', 'شەممە'];
  var HM = ['موحەڕەم', 'سەفەر', 'ڕەبیعی یەکەم', 'ڕەبیعی دووەم', 'جومادەلئوولا', 'جومادەلئاخیرە', 'ڕەجەب', 'شەعبان', 'ڕەمەزان', 'شەووال', 'زولقەعدە', 'زولحەججە'];
  function ar(x) { return String(x).replace(/\d/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[d]; }); }

  function hijri(d) {
    try {
      var p = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(d), o = {};
      p.forEach(function (x) { o[x.type] = x.value; });
      var y = parseInt(o.year, 10), m = parseInt(o.month, 10), dd = parseInt(o.day, 10);
      if (!y || !m || !dd) return '';
      return ar(dd) + ' ' + HM[m - 1] + ' ' + ar(y);
    } catch (e) { return ''; }
  }

  function updatePill() {
    var d = new Date();
    var h = hijri(d);
    pillB.textContent = (DAYS[d.getDay()]) + (h ? ' ، ' + h : '');
    pillE.textContent = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }

  /* ---------- کردنەوە / داخستن ---------- */
  function open() {
    build();
    if (isOpen) return;
    isOpen = true;
    inp.value = ''; filter();
    updatePill();
    clearInterval(tick); tick = setInterval(updatePill, 15000);
    drawer.classList.add('show');
    backdrop.classList.add('show');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    drawer.scrollTop = 0;
    var act = drawer.querySelector('.nx-item.active');
    if (act) setTimeout(function () { try { act.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {} }, 380);
    buzz();
  }
  function close() {
    if (!isOpen) return;
    isOpen = false;
    clearInterval(tick);
    drawer.classList.remove('show');
    backdrop.classList.remove('show');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  window.NiMenu = { open: open, close: close, toggle: function () { isOpen ? close() : open(); } };

  /* ---------- بەستنەوە بە دوگمەکانەوە ---------- */
  /* دوگمەی «زیاتر»ی داک (و دوگمەکانی کۆنی index) دەکاتەوە، پێش ئەوەی شیتی کۆن بیکاتەوە */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('#ni-more,#menuBtn,#niMoreBtn,[data-ni-menu]');
    if (!b) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    open();
  }, true);

  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferredPrompt = e; });

  /* ئەو لاپەڕانەی داکیان نییە: دوگمەیەکی بازنەیی دادەنێین */
  function fab() {
    if (document.getElementById('ni-dock') || document.querySelector('.nx-fab')) return;
    var b = document.createElement('button');
    b.className = 'nx-fab';
    b.type = 'button';
    b.setAttribute('aria-label', 'کردنەوەی مینۆ');
    b.setAttribute('data-ni-menu', '');
    b.innerHTML = svg('grid');
    document.body.appendChild(b);
  }
  function ready() { setTimeout(fab, 60); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
