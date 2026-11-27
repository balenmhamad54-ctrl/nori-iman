(function(){
var K='ni-theme',C='ni-accent',d=document.documentElement;
function get(k){try{return localStorage.getItem(k)}catch(e){return null}}
function set(k,v){try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}}
function apply(){var t=get(K)||'emerald',a=get(C);d.setAttribute('data-theme',t);
 if(a){d.style.setProperty('--t-acc',a);d.style.setProperty('--t-acc2','color-mix(in srgb,'+a+' 60%,white)')}else{d.style.removeProperty('--t-acc');d.style.removeProperty('--t-acc2')}
 var m=document.querySelector('meta[name=theme-color]');if(m)setTimeout(function(){m.content=getComputedStyle(d).getPropertyValue('--t-bg').trim()},30)}
apply();window.niApplyTheme=apply;
var themes=[['emerald','زمرووت','#0b3026','#e9c777'],['sapphire','یاقووت','#0d1f3c','#8fd0ff'],['amethyst','ئەمەتیست','#21153a','#e8b4f8'],['copper','مس','#351619','#ffb88a'],['night','شەو','#141416','#f5c542']];
var pages=[['index','سەرەکی'],['nwezh','نوێژ'],['jorakanynwezh','جۆرەکانی نوێژ'],['ferbwni-nwez','فێربوونی نوێژ'],['dua','دوعا و زیکر'],['zikrBaynyan','زیکری بەیانیان'],['tasbih','تەسبیح'],['quran','قورئان'],['hadith','حەدیس'],['katakanyBang','کاتەکانی بانگ'],['qiblanma','قیبلەنما'],['taqweem','ڕۆژژمێر'],['zakat','زەکات'],['naw','ناوەکانی خوا'],['nawPexambaran','ناوی پێغەمبەران'],['chirokPexambaran','ژیاننامەی پێغەمبەران'],['mezhuwi-islam','مێژووی ئیسلام'],['ebadat','پەرستش'],['payekaniBawar','پایەکانی باوەڕ'],['talaq','تەلاق'],['quiz','تاقیکردنەوە'],['acadimyayislam','ئەکادیمیا'],['about','دەربارە']];
var ic={index:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',quran:'<path d="M12 6c-2-1.5-5-2-8-1.5v14c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-14c-3-.5-6 0-8 1.5z"/><path d="M12 6v14"/>',katakanyBang:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',tasbih:'<circle cx="12" cy="6" r="2"/><circle cx="18" cy="12" r="2"/><circle cx="12" cy="18" r="2"/><circle cx="6" cy="12" r="2"/>',more:'<rect x="4" y="4" width="6" height="6" rx="2"/><rect x="14" y="4" width="6" height="6" rx="2"/><rect x="4" y="14" width="6" height="6" rx="2"/><rect x="14" y="14" width="6" height="6" rx="2"/>'};
var cur=(location.pathname.split('/').pop()||'index.html').replace('.html','')||'index';
function build(){
 var dock=document.createElement('nav');dock.id='ni-dock';
 [['index','سەرەکی'],['quran','قورئان'],['katakanyBang','بانگ'],['tasbih','تەسبیح']].forEach(function(p){dock.innerHTML+='<a href="'+p[0]+'.html" class="'+(cur==p[0]?'on':'')+'"><svg viewBox="0 0 24 24">'+ic[p[0]]+'</svg>'+p[1]+'</a>'});
 dock.innerHTML+='<button id="ni-more"><svg viewBox="0 0 24 24">'+ic.more+'</svg>زیاتر</button>';
 var sh=document.createElement('div');sh.id='ni-sheet';
 var h='<div class="box"><h4>🎨 ڕەنگی ئەپ</h4><div class="ni-sw">';
 themes.forEach(function(t){h+='<button data-t="'+t[0]+'" title="'+t[1]+'" style="--c1:'+t[2]+';--c2:'+t[3]+'"></button>'});
 h+='<label><input type="color" id="ni-col" value="#e9c777">ڕەنگی دڵخواز</label></div><h4>بەشەکان</h4><div class="ni-grid">';
 pages.forEach(function(p){h+='<a href="'+p[0]+'.html" class="'+(cur==p[0]?'on':'')+'">'+p[1]+'</a>'});
 sh.innerHTML=h+'</div></div>';
 document.body.append(dock,sh);
 function mark(){var t=get(K)||'emerald';sh.querySelectorAll('[data-t]').forEach(function(b){b.classList.toggle('on',b.dataset.t==t&&!get(C))})}
 mark();
 dock.querySelector('#ni-more').onclick=function(){sh.classList.add('open')};
 sh.onclick=function(e){if(e.target===sh)sh.classList.remove('open')};
 sh.querySelectorAll('[data-t]').forEach(function(b){b.onclick=function(){set(K,b.dataset.t);set(C,null);apply();mark()}});
 sh.querySelector('#ni-col').oninput=function(e){set(C,e.target.value);apply();mark()};
 document.addEventListener('keydown',function(e){if(e.key=='Escape')sh.classList.remove('open')});
}
if(document.readyState!='loading')build();else document.addEventListener('DOMContentLoaded',build);
})();
