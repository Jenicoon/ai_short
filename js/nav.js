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
    '<text><textPath href="#ring" textLength="86">作品由AI生成  3조  </textPath></text>' +
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
      '<span>3조 「본 조는 AI로 생성되었습니다」<br>한양대학교 중국미디어문화의이해 2026</span></div>';
  }
  /* ---------- 자연스러운 줄바꿈 ----------
     CSS(keep-all, balance)에 더해, 끊기면 어색한 곳을 줄바꿈 없는 공백으로 묶는다.
     - "약 18초", "누적 2:30", "2분 30초"처럼 수와 단위가 갈라지지 않게
     - 문단 마지막 단어가 혼자 다음 줄로 떨어지지 않게 */
  var NB = ' ';
  var BLOCKS = 'p, li, h1, h2, h3, h4, figcaption, td, th, cite, dd, summary, .l, .s, .et, .em, .txt, .tt, .dd, .stage-cap, .premise, .purpose, .metric, .opt span:last-child, .xs, .cr, .src, .src-foot, .table-note, .phone-cap, .rev-read, .cp-cap, .note, .theater-note, .rw, .promo-d, .ko, .kl, .ks, .space3 span, .flow4 span, .icard p, .dcard p, .obs-card p, .ctl-chips span, .ds';
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
    // 사진 저작권 표기와 영어 하이픈 낱말은 한 덩어리로: "Wikimedia Commons", "CC BY-SA 4.0", "Micro-Drama"
    v = v.replace(/Wikimedia Commons/g, 'Wikimedia' + NB + 'Commons').replace(/CC BY-SA 4\.0/g, 'CC' + NB + 'BY‑SA' + NB + '4.0');
    v = v.replace(/([A-Za-z])-([A-Za-z])/g, '$1‑$2');
    // "~할 수 있다", "~기 때문에", "~는 것은"처럼 의존명사가 줄 맨 앞에 혼자 오지 않게
    v = v.replace(/ (수|것|때문|때|등|중|뿐|만큼|줄|듯)(?=[\s.,)”’]|[이을를은는가에도의으]|$)/g, NB + '$1');
    v = v.replace(/\(([^()]{1,60})\)/g, glueParen);
    // 닫는 따옴표·괄호와 뒤따르는 조사(’과, 》을, ”는)가 갈라지지 않게
    v = v.replace(/([’”」』》〉)）\]])(?=[가-힣])/g, '$1' + WJ);
    if (v !== o) t.nodeValue = v;
  }

  /* 어절 묶기: 꾸미는 말과 꾸밈 받는 말, 본용언과 보조용언, 수와 단위, 짧은 서술어와 그 앞 낱말이
     줄 끝과 줄 앞으로 갈리지 않게 한다. 묶음 길이는 글 상자 폭에 맞춰 제한해 좁은 칸에서도 넘치지 않게 */
  // 꾸미는 말(관형어)은 뒤 낱말과 강하게, 부사는 약하게 묶는다
  var ADN = /^(다른|같은|새로운|어떤|이런|그런|저런|모든|많은|적은|작은|큰|짧은|긴|높은|낮은|좋은|비슷한|익숙한|가까운|빠른|느린|여러|온갖|이번|지난|다음|해당|기존|신규|실제|전체)$/;
  var ADV = /^(가장|매우|아주|더욱|다시|서로|함께|직접|바로|모두|아직|이미|훨씬|조금|크게|먼저|모두|오히려|곧|또는|및)$/;
  var VADN = /(하는|되는|있는|없는|보는|주는|받는|라는|이라는|가는|오는|드는|내는|두는|하던|되던|한|된|운|던|할|될|적|인|른|의)$/;
  var FIN = /(은|는|이|가|을|를|에|와|과|도|만|로|고|며|면|서|다|요|지|게|데|나|야|까|터|럼|께|든|랑|여|해|어|아|워|져|라|자|니|음|함|됨|임|듯|록|엔)$/;
  var NOUNX = /(장면|화면|측면|방면|국면|전면|정면|순서|문서|보고서|최고|광고|참고|이미지|페이지|작가|평가|국가|전문가|자|하나|바다|사이다)$/;
  var INVIS = /[⁠​]/g;
  function vlen(s) { return s.replace(INVIS, '').length; }
  // 두 낱말 사이를 얼마나 붙여야 하나: 0 끊어도 됨, 1 가급적, 2 되도록, 3 꼭 붙임
  var POS = /^(뒤|전|후|때|중|앞|속|안|밖|위|사이|동안|직후|직전|이후|이전|가운데|이상|이하|미만|이내)([에는의도로서을를]{0,2})[,.]?$/;
  function glueLevel(a, b) {
    a = a.replace(INVIS, ''); b = b.replace(INVIS, '');
    if (!a || !b) return 0;
    if (/^\d[\d.]*,$/.test(a) && /^\d/.test(b)) return 3;                  // 10, 20, 30화
    if (/[.,!?:;…\/→·”’」』》〉)\]]$/.test(a)) return 0;                    // 문장부호 뒤는 끊어도 된다
    if (/^(이|그|저|늘|더|또|첫|약|각|내|새|못|잘|꼭|왜|총|매|본|한|두|세|네|몇|옛|온|좀|곧|참|꽤|딱|막)$/.test(a)) return 3; // 한 글자 꾸밈말: 이, 그, 늘, 더, 첫
    if (/[어아여해워져떠써줘지고게]$/.test(a) && /^(있|없|않|못하|보|봤|본|볼|주|준|줄|줬|버리|버린|놓|놨|둔|두|싶|내|낸|낼|냈)/.test(b)) return 3; // 떠 있고, 보여 준, 찍어 낸다
    if (/게$/.test(a) && /^(하|한|할|해|했|되|된|될|됐|만들|만든)/.test(b)) return 3; // 가능하게 하는, 쉽게 된
    if (/^(아닌|아니라|아니다|아닙니다)/.test(b)) return 3;                 // 남편이 아닌
    if (POS.test(b)) return 3;                                              // 죽음 뒤, 사고 때, 95% 이상
    if (/[A-Za-z0-9%]$/.test(a) && /^[가-힣]/.test(b)) return 3;           // AI 작품
    if (/\d[\d.,]*[가-힣]$/.test(a)) return 3;                             // 2026년 1분기, 3.57억 명
    if (/의$/.test(a)) return 2;                                           // 숏폼의 정서적: 다른 꾸밈보다는 약하게
    if (ADN.test(a) || /적$/.test(a)) return 3;                            // 새로운 시각적 경험
    if (VADN.test(a)) return 2;                                            // 반영한 이야기: 관형절 뒤는 명사구보다 약하게
    if (/^(되|하|있|없|이|보|오|가|주|받|두|놓|떠|해|돼|봐|와|줘|나|들)(고|며|면|서)[,]?$/.test(b)) return 2; // 재료가 되고
    if (ADV.test(a)) return 2;                                             // 먼저 돌보고, 다시 일어선다
    if (NOUNX.test(a) && !/(하자|보자|가자)$/.test(a)) return 2;           // 시청자, 장면, 이미지: 조사 없는 명사
    if (FIN.test(a)) {
      if (/^[가-힣]{1,4}(다|요)[.!?]?[”’]?$/.test(b)) return 1;            // 짧은 서술어는 앞 낱말과: 사람들은 봅니다.
      return 0;                                                             // 조사, 어미로 끝난 어절 뒤
    }
    if (/[가-힣]$/.test(a)) return 2;                                      // 조사 없는 명사: 인기 장면, 실사 작품
    return 0;
  }
  function canBreak(a, b) { return glueLevel(a, b) === 0; }
  // 띄어쓰기로 나눈 조각은 그 안에서 줄이 바뀌지 않는다. 붙이고 싶은 낱말들이 cap보다 길면
  // 가장 덜 어색한 곳(붙임 정도가 낮은 곳)에서 나눈다
  var COST = [0, 3, 10, 100];
  function phrase(v, cap) {
    var parts = v.split(' ');
    if (parts.length < 2) return v;
    var n = parts.length, len = parts.map(vlen), lv = [0], seps = [];
    for (var k = 1; k < n; k++) lv[k] = parts[k - 1] && parts[k] ? glueLevel(parts[k - 1].split(NB).pop(), parts[k].split(NB)[0]) : 0;
    var i = 0;
    while (i < n) {
      var j = i; while (j + 1 < n && lv[j + 1] > 0) j++;
      // parts[i..j]를 cap 안의 덩어리로 나누는 최소 비용
      var best = [], from = []; best[i] = 0;
      for (var e = i + 1; e <= j + 1; e++) {
        best[e] = Infinity; var w = -1;
        for (var st = e - 1; st >= i; st--) {
          w += len[st] + 1;
          if (w > cap && st < e - 1) break;
          var c = best[st] + (st > i ? COST[lv[st]] + 0.5 : 0);
          if (c <= best[e]) { best[e] = c; from[e] = st; } // 비용이 같으면 앞쪽에서 끊어 뒤의 명사구를 지킨다
        }
      }
      var starts = {}; for (var e2 = j + 1; e2 > i; e2 = from[e2]) starts[from[e2]] = 1;
      for (var m = i + 1; m <= j; m++) seps[m] = starts[m] ? ' ' : NB;
      if (j + 1 < n) seps[j + 1] = ' ';
      i = j + 1;
    }
    var out = parts[0];
    for (var q = 1; q < n; q++) out += seps[q] + parts[q];
    return out;
  }
  var capCache = typeof WeakMap === 'function' ? new WeakMap() : null;
  function boxOf(t) { var e = t.parentNode; while (e && e.nodeType === 1 && e !== document.body && getComputedStyle(e).display === 'inline') e = e.parentNode; return e; }
  function capFor(t) {
    var e = boxOf(t), box = e;
    if (capCache && e && capCache.has(e)) return capCache.get(e);
    while (box && box.nodeType === 1 && !box.clientWidth) box = box.parentElement;
    var fs = parseFloat(getComputedStyle(e && e.nodeType === 1 ? e : document.body).fontSize) || 16;
    var cpl = box && box.clientWidth ? box.clientWidth / fs : 20;
    var cap = Math.max(4, Math.min(12, Math.floor(cpl * 0.75)));
    if (capCache && e) capCache.set(e, cap);
    return cap;
  }
  function inFlow(t) { var p = t.parentNode; return p && p.closest && p.closest('main, footer') && !p.closest('script, style, svg, .nav'); }
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
    if ((el.textContent || '').length < 10) return;
    var t = lastText(el); if (!t) return;
    var v = t.nodeValue.replace(/\s+$/, ''), i = v.lastIndexOf(' ');
    if (i < 0) return;
    var tail = v.slice(i + 1);
    // 앞 낱말이 길면(“AI制作，无真实动物受伤”처럼) 붙였을 때 칸을 넘쳐 낱말 중간이 잘리므로 붙이지 않는다
    var before = v.slice(0, i), runBefore = before.slice(before.lastIndexOf(' ') + 1);
    if (tail.length <= 6 && vlen(runBefore) + 1 + vlen(tail) <= Math.max(capFor(t) + 3, 10)) t.nodeValue = before + NB + tail + t.nodeValue.slice(v.length);
  }
  function tidy(root) {
    if (!root || root.nodeType !== 1) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { return n.parentNode && /^(SCRIPT|STYLE|TEXTAREA)$/i.test(n.parentNode.nodeName) ? 2 : 1; } });
    var n, prev = null, all = []; while ((n = w.nextNode())) { tidyNode(n); tidyAcross(prev, n); prev = n; all.push(n); }
    // 같은 글 상자 안에서 이어지는 텍스트 노드를 한 줄의 글처럼 이어 붙여 어절을 묶고, 다시 노드별로 나눠 넣는다
    // (띄어쓰기를 NBSP로 바꿀 뿐이라 글자 수가 그대로여서 위치가 어긋나지 않는다)
    var group = [], gbox = null;
    var flush = function () {
      if (group.length) {
        var full = group.map(function (x) { return x.nodeValue; }).join(''), out = phrase(full, capFor(group[0])), pos = 0;
        if (out !== full) group.forEach(function (x) { var L = x.nodeValue.length, nv = out.substr(pos, L); pos += L; if (nv !== x.nodeValue) x.nodeValue = nv; });
      }
      group = [];
    };
    all.forEach(function (x) {
      if (!inFlow(x)) { flush(); gbox = null; return; }
      var b = boxOf(x), ps = x.previousSibling;
      if (b !== gbox || (ps && ps.nodeName === 'BR')) { flush(); gbox = b; }
      group.push(x);
    });
    flush();
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
