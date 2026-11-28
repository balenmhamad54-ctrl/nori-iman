(function () {
  var root = document.documentElement;
  function saved(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function applyTheme() {
    var theme = saved('ni-theme') || 'emerald', accent = saved('ni-accent');
    root.setAttribute('data-theme', theme);
    if (accent) {
      root.style.setProperty('--t-acc', accent);
      root.style.setProperty('--t-acc2', 'color-mix(in srgb,' + accent + ' 60%,white)');
    } else {
      root.style.removeProperty('--t-acc');
      root.style.removeProperty('--t-acc2');
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) setTimeout(function () {
      meta.content = getComputedStyle(root).getPropertyValue('--t-bg').trim();
    }, 30);
  }
  applyTheme();
  window.niApplyTheme = applyTheme;

  function dock() {
    if (document.querySelector('.ni-taskbar') || document.getElementById('ni-dock')) return;
    var icons = {
      home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
      quran: '<path d="M12 6c-2-1.5-5-2-8-1.5v14c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5z"/><path d="M12 6v14"/>',
      prayer: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      beads: '<circle cx="12" cy="6" r="2"/><circle cx="18" cy="12" r="2"/><circle cx="12" cy="18" r="2"/><circle cx="6" cy="12" r="2"/>',
      more: '<rect x="4" y="4" width="6" height="6" rx="2"/><rect x="14" y="4" width="6" height="6" rx="2"/><rect x="4" y="14" width="6" height="6" rx="2"/><rect x="14" y="14" width="6" height="6" rx="2"/>'
    };
    var current = location.pathname.split('/').pop() || 'index.html';
    var items = [
      ['index.html', 'سەرەکی', icons.home],
      ['quran.html', 'قورئان', icons.quran],
      ['katakanyBang.html', 'بانگ', icons.prayer],
      ['tasbih.html', 'تەسبیح', icons.beads]
    ];
    var nav = document.createElement('nav');
    nav.id = 'ni-dock';
    nav.setAttribute('aria-label', 'مینۆی سەرەکی');
    nav.innerHTML = items.map(function (item) {
      return '<a href="' + item[0] + '"' + (item[0] === current ? ' class="on" aria-current="page"' : '') +
        '><svg viewBox="0 0 24 24" aria-hidden="true">' + item[2] + '</svg>' + item[1] + '</a>';
    }).join('') + '<button id="ni-more" type="button" aria-label="زیاتر"><svg viewBox="0 0 24 24" aria-hidden="true">' + icons.more + '</svg>زیاتر</button>';
    document.body.appendChild(nav);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', dock);
  else dock();
})();
