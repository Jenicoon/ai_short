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
    ['quiz.html', '나에게 어울리는 숏드라마', '6문항 심리테스트'],
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

  var qrIco = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v.01M14 21h7M21 17v4"/></svg>';
  var nav = document.getElementById('siteNav');
  if (nav) {
    nav.className = 'site-nav';
    nav.innerHTML =
      '<div class="nav-pill">' +
        '<a class="logo" href="index.html" aria-label="홈으로">' + logo + '<span class="lt">본 조는 AI로 생성되었습니다</span></a>' +
        '<ul class="nav-links">' + PAGES.map(function (p) { return '<li><a href="' + p[0] + '"' + cur(p[0]) + '>' + p[1] + '</a></li>'; }).join('') + '</ul>' +
        '<div class="nav-right">' +
          '<button class="nav-btn nav-qr-btn" id="qrBtn" type="button" aria-label="사이트 접속 QR 코드 크게 보기">' + qrIco + '</button>' +
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
  /* ---------- 자연스러운 줄바꿈 ----------
     CSS(keep-all, balance)에 더해, 끊기면 어색한 곳을 줄바꿈 없는 공백으로 묶는다.
     - "약 18초", "누적 2:30", "2분 30초"처럼 수와 단위가 갈라지지 않게
     - 문단 마지막 단어가 혼자 다음 줄로 떨어지지 않게 */
  var NB = ' ';
  var BLOCKS = 'p, li, h1, h2, h3, h4, figcaption, td, th, cite, dd, summary, .l, .s, .et, .em, .txt, .tt, .dd, .stage-cap, .premise, .purpose, .metric, .opt span:last-child, .xs, .cr, .src, .src-foot, .table-note, .phone-cap, .rev-read, .cp-cap, .note, .theater-note, .rw, .promo-d, .ko';
  var WJ = '⁠'; // 줄바꿈을 막는 보이지 않는 이음표
  // 괄호 안: 쉼표 뒤에서는 줄이 바뀌어도 되고, 쉼표 사이의 짧은 덩어리(10자 이하)는 한 덩어리로
  function glueParen(m, inner) {
    return '(' + inner.split(/(,\s*)/).map(function (seg) {
      if (/^,/.test(seg)) return seg;
      // 짧으면 통째로, 길면 마지막 두 낱말만 붙여 ")" 앞에 낱말 하나가 홀로 떨어지지 않게
      if (seg.length <= 8) return seg.replace(/ /g, NB);
      // 첫 낱말이 한두 글자면("이 결혼은", "예: 新浪") 다음 낱말과 함께
      return seg.replace(/ (\S+)$/, NB + '$1').replace(/^(\S{1,2}) /, '$1' + NB);
    }).join('') + ')';
  }
  function tidyNode(t) {
    var v = t.nodeValue, o = v;
    // "누적 약 8분", "첫 반격", "각 근거"처럼 앞에서 꾸미는 말은 뒤 낱말과 함께
    // ("누적 약 8분"처럼 꾸밈말이 잇달아 오면 한 번에 다 잡히지 않아, 바뀌지 않을 때까지 되풀이)
    for (var k = 0, pv; k < 3 && pv !== v; k++) { pv = v; v = v.replace(/(^|[\s(（“‘·])(약|누적|평균|총|각|최근|매|첫) (?=\S)/g, '$1$2' + NB); }
    // "두 편", "다섯 가지"처럼 수와 세는 말은 함께
    v = v.replace(/(^|[\s(])(한|두|세|네|다섯|여섯|일곱|여덟|아홉|열) (?=편|명|개|번|가지|화|곳|장|컷|갈래|문항)/g, '$1$2' + NB);
    // 앞 태그에서 열린 괄호가 이 글에서 닫힐 때: "》 계열)", " 第一季)" → 마지막 짧은 낱말을 앞에 붙임
    v = v.replace(/^([^()]*?) ([^\s()]{1,4})\)/, '$1' + NB + '$2)');
    // 닫는 따옴표 바로 뒤의 여는 괄호 앞에서는 줄이 바뀌어도 되게: “…”(이 결혼은 …) 가 통째로 길어져 낱말 중간이 잘리는 것 방지
    v = v.replace(/([”’])\(/g, '$1​(');
    v = v.replace(/(\d[\d.,:]*\s?(?:분|초|화|위|편|명|만|억|년|월|일|%|배)?) (?=\d[\d.,:]*\s?(?:분|초|화|위|편|명|만|억|%))/g, '$1' + NB);
    // 구분 기호(·, →)는 앞 낱말 쪽에 붙여 줄 맨 앞에 오지 않게
    v = v.replace(/(\S) (→|·) /g, '$1' + NB + '$2 ');
    // "30초~8분", "0:00–0:35"는 갈라지지 않게
    v = v.replace(/(\S)([~–])(?=\S)/g, '$1' + WJ + '$2' + WJ);
    v = v.replace(/榜 (?=\d+위)/g, '榜' + NB);
    // "Nano Review", "Sixth Tone"처럼 짧은 영어 이름 두 낱말은 함께
    v = v.replace(/\b([A-Z][a-z]{1,7}) (?=[A-Z][a-z]{1,7}\b)/g, '$1' + NB);
    // "~할 수 있다", "~기 때문에", "~는 것은"처럼 의존명사가 줄 맨 앞에 혼자 오지 않게
    v = v.replace(/ (수|것|때문|때|등|중|뿐|만큼|줄|듯)(?=[\s.,)”’]|[이을를은는가에도의으]|$)/g, NB + '$1');
    v = v.replace(/\(([^()]{1,60})\)/g, glueParen);
    // 닫는 따옴표·괄호와 뒤따르는 조사(’과, 》을, ”는)가 갈라지지 않게
    v = v.replace(/([’”」』》〉)）\]])(?=[가-힣])/g, '$1' + WJ);
    if (v !== o) t.nodeValue = v;
  }
  // 태그 경계를 넘는 경우: <b>“…”</b>로, <span>《…》</span>을, <span>…</span> · 영상
  function tidyAcross(prev, t) {
    if (!prev) return;
    var a = prev.nodeValue, b = t.nodeValue, o = b;
    if (/[’”」』》〉)）\]]$/.test(a) && /^[가-힣]/.test(b)) b = WJ + b;
    if (/\S$/.test(a) && /^ (·|→) /.test(b)) b = NB + b.slice(1);
    if (/\S$/.test(a) && /^ [^\s()]{1,4}\)/.test(b)) b = NB + b.slice(1);
    if (/\S$/.test(a) && /^[~–]/.test(b)) b = WJ + b;
    if (b !== o) t.nodeValue = b;
  }
  function lastText(el) {
    for (var n = el.lastChild; n; n = n.previousSibling) {
      if (n.nodeType === 3) { if (/\S/.test(n.nodeValue)) return n; continue; }
      if (n.nodeType === 1) { if (/^(SCRIPT|STYLE|SVG|BR)$/i.test(n.nodeName) || n.matches('.badge, .ph')) return null; var d = lastText(n); if (d) return d; return null; }
    }
    return null;
  }
  function noOrphan(el) {
    if ((el.textContent || '').length < 24) return;
    var t = lastText(el); if (!t) return;
    var v = t.nodeValue.replace(/\s+$/, ''), i = v.lastIndexOf(' ');
    if (i < 0) return;
    var tail = v.slice(i + 1);
    if (tail.length <= 6) t.nodeValue = v.slice(0, i) + NB + tail + t.nodeValue.slice(v.length);
  }
  function tidy(root) {
    if (!root || root.nodeType !== 1) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { return n.parentNode && /^(SCRIPT|STYLE|TEXTAREA)$/i.test(n.parentNode.nodeName) ? 2 : 1; } });
    var n, prev = null; while ((n = w.nextNode())) { tidyNode(n); tidyAcross(prev, n); prev = n; }
    var blocks = root.matches && root.matches(BLOCKS) ? [root] : [];
    blocks = blocks.concat(Array.prototype.slice.call(root.querySelectorAll(BLOCKS)));
    blocks.forEach(noOrphan);
  }
  window.tidyText = tidy;

  /* ---------- 홈: 심리테스트 알림 ---------- */
  function promoToast() {
    if (page !== 'index.html') return;
    try { if (sessionStorage.getItem('quizToastClosed')) return; } catch (e) {}
    var t = document.createElement('div');
    t.className = 'quiz-toast';
    t.setAttribute('role', 'status');
    t.innerHTML = '<a href="quiz.html"><span class="qt-k">30초 심리테스트</span><b>나에게 어울리는 숏드라마는?</b><span class="qt-go">해 보기 →</span></a>' +
      '<button type="button" aria-label="알림 닫기">×</button>';
    t.querySelector('button').addEventListener('click', function () {
      t.classList.remove('show');
      try { sessionStorage.setItem('quizToastClosed', '1'); } catch (e) {}
    });
    document.body.appendChild(t);
    var closed = false;
    t.querySelector('button').addEventListener('click', function () { closed = true; });
    var video = document.querySelector('.intro-video');
    if (video && 'IntersectionObserver' in window) {
      // 1분 소개 영상이 화면에 보이는 동안에는 알림을 숨겨 영상 조작부를 가리지 않게 한다
      new IntersectionObserver(function (es) {
        var visible = es[0].intersectionRatio > 0.15;
        if (!closed) t.classList.toggle('show', !visible);
      }, { threshold: [0, 0.15, 0.5] }).observe(video);
    } else {
      setTimeout(function () { t.classList.add('show'); }, 1600);
    }
  }

  /* ---------- 발표용 QR: 상단바 왼쪽에 고정, 누르면 크게 ---------- */
  function qrDock() {
    var dock = document.createElement('button');
    dock.type = 'button';
    dock.className = 'qr-dock';
    dock.setAttribute('aria-label', '사이트 접속 QR 코드 크게 보기');
    dock.innerHTML = '<img src="assets/qr.png" alt="이 사이트로 들어오는 QR 코드" width="96" height="96"><span>구경하고 싶다면 촬영!</span>';
    document.body.appendChild(dock);

    var modal = document.createElement('dialog');
    modal.className = 'qr-modal';
    modal.setAttribute('aria-label', '사이트 접속 QR 코드');
    modal.innerHTML = '<div class="qr-card"><img src="assets/qr.png" alt="이 사이트로 들어오는 QR 코드"><p class="qr-k">구경하고 싶다면 촬영!</p><p class="qr-url">jenicoon.github.io/ai_short</p><button type="button" class="qr-close">닫기</button></div>';
    document.body.appendChild(modal);
    var open = function () { if (modal.showModal) modal.showModal(); else modal.setAttribute('open', ''); };
    var close = function () { if (modal.close) modal.close(); else modal.removeAttribute('open'); };
    dock.addEventListener('click', open);
    var btn = document.getElementById('qrBtn'); if (btn) btn.addEventListener('click', open);
    modal.querySelector('.qr-close').addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  }

  function ready() {
    qrDock();
    footer();
    tidy(document.body);
    promoToast();
    if ('MutationObserver' in window) {
      new MutationObserver(function (ms) {
        ms.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1) tidy(n); }); });
      }).observe(document.body, { childList: true, subtree: true });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
