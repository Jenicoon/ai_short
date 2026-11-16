/* 공통 상단 메뉴, 바닥글, 테마 전환
   각 페이지의 <header id="siteNav"> 바로 뒤에서 불러 메뉴가 깜빡임 없이 그려지게 한다 */
(function () {
  'use strict';
  var PAGES = [
    ['index.html', '홈', '전시 입구'],
    ['research.html', '연구', '현상과 질문'],
    ['works.html', '작품', '기준작과 상영관'],
    ['analysis.html', '분석', '비교와 분석 축 4개'],
    ['evidence.html', '근거', '외부 근거, 맥락, 결론'],
    ['quiz.html', '테스트', '나에게 맞는 숏드라마'],
    ['about.html', '소개', '아카이브와 출처']
  ];
  var page = document.body.getAttribute('data-page') || 'index.html';
  var cur = function (href) { return href === page ? ' aria-current="page"' : ''; };

  var logo =
    '<svg viewBox="0 0 40 40" aria-hidden="true"><defs><path id="ring" d="M20,20 m-14,0 a14,14 0 1,1 28,0 a14,14 0 1,1 -28,0"/></defs>' +
    '<text><textPath href="#ring" textLength="86">作品由AI生成 · 3조 · </textPath></text>' +
    '<circle cx="20" cy="20" r="2.4" fill="currentColor"/></svg>';
  var sun = '<svg class="theme-ico-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var moon = '<svg class="theme-ico-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var menu = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 8h16M4 16h16"/></svg>';

  var nav = document.getElementById('siteNav');
  if (nav) {
    nav.className = 'site-nav';
    nav.innerHTML =
      '<div class="nav-pill">' +
        '<a class="logo" href="index.html" aria-label="홈으로">' + logo + '<span class="lt">본 조는 AI로 생성되었습니다</span></a>' +
        '<ul class="nav-links">' + PAGES.map(function (p) { return '<li><a href="' + p[0] + '"' + cur(p[0]) + '>' + p[1] + '</a></li>'; }).join('') + '</ul>' +
        '<div class="nav-right">' +
          '<button class="nav-btn" id="themeBtn" type="button" aria-label="밝은 화면, 어두운 화면 바꾸기">' + sun + moon + '</button>' +
          '<button class="nav-btn nav-menu-btn" id="menuBtn" type="button" aria-label="메뉴 열기" aria-expanded="false" aria-controls="navDrop">' + menu + '</button>' +
        '</div>' +
      '</div>' +
      '<nav class="nav-drop" id="navDrop" aria-label="전체 메뉴">' + PAGES.map(function (p) { return '<a href="' + p[0] + '"' + cur(p[0]) + '>' + p[1] + '<span>' + p[2] + '</span></a>'; }).join('') + '</nav>';

    var root = document.documentElement;
    document.getElementById('themeBtn').addEventListener('click', function () {
      var t = root.getAttribute('data-theme') || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      var next = t === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
    var btn = document.getElementById('menuBtn'), drop = document.getElementById('navDrop');
    function setOpen(o) { drop.classList.toggle('open', o); btn.setAttribute('aria-expanded', o ? 'true' : 'false'); }
    btn.addEventListener('click', function () { setOpen(!drop.classList.contains('open')); });
    document.addEventListener('click', function (e) { if (!nav.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  function footer() {
    var f = document.getElementById('siteFooter');
    if (!f) return;
    f.className = 'site-foot';
    f.innerHTML = '<div class="in"><nav aria-label="바닥글 메뉴">' +
      '<a href="about.html#credits">만든 사람들</a><a href="about.html#credits">출처</a><a href="about.html#archive">발표 아카이브</a>' +
      '<a href="https://github.com/Jenicoon/ai_short" target="_blank" rel="noopener">GitHub</a></nav>' +
      '<span>3조 「본 조는 AI로 생성되었습니다」 · 한양대학교 중국미디어문화의이해 · 2026</span></div>';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', footer); else footer();
})();
