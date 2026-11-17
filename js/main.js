/* AI 숏드라마 온라인 전시 · 상호작용
   - 데이터: window.COMPARISON (data/comparison.json과 같은 내용)
   - 모든 수치는 content 파일과 comparison.json에 있는 값만 사용 */
(function () {
  'use strict';

  var D = window.COMPARISON || { works: [] };
  var byId = {};
  D.works.forEach(function (w) { byId[w.id] = w; });

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function mmss(sec) {
    sec = Math.round(sec);
    var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    var ss = (s < 10 ? '0' : '') + s;
    return h ? h + ':' + (m < 10 ? '0' : '') + m + ':' + ss : m + ':' + ss;
  }
  // 한자가 들어간 문자열을 중국어 글꼴로 감싸기
  // 앞에 붙은 영문(예: AI剧热播榜)까지 한 덩어리로 묶어 중간에서 줄이 바뀌지 않게 한다
  function zh(s) { return esc(s).replace(/([A-Za-z]*[㐀-鿿，：。！《》]+)/g, '<span class="zh">$1</span>'); }

  var SHORT = { yishuangshou: '一双手闯出一片天', guancheng: '莞城往事', xiaozhen: '小镇是非多', chixie: '持械入宋', tainainai: '十八岁太奶奶驾到 5' };
  window.EXHIBIT = { byId: byId, SHORT: SHORT, zh: zh, esc: esc, mmss: mmss };

  /* ---------- 스크롤 진행 표시 ---------- */
  var progress = $("#progress"), ticking = false;
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? window.scrollY / h : 0;
    if (progress) progress.style.transform = "scaleX(" + p.toFixed(4) + ")";
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- 등장 애니메이션 ---------- */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); rio.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
    revealEls.forEach(function (n) { rio.observe(n); });
  } else revealEls.forEach(function (n) { n.classList.add('in'); });

  /* ---------- 설문 막대 ---------- */
  var survey = $('#surveyCard');
  if (survey) {
    var fill = function () { $$('.bar i', survey).forEach(function (i) { i.style.width = i.getAttribute('data-w') + '%'; }); };
    if ('IntersectionObserver' in window) {
      var sio = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { fill(); sio.disconnect(); } }, { threshold: 0.3 });
      sio.observe(survey);
    } else fill();
  }

  /* ---------- 기준작 장면 카드 ---------- */
  var F = 'assets/frames/yishuangshou/';
  var timeline = [
    ['ys_00m03s', '0:03', '배경', 'k-bg', '국영 기계공장, 위험한 작업을 막는 손', ''],
    ['ys_00m15s', '0:15', '억압', 'k-oppress', '스승 “톄주가 쓸 수 없다고 했어” 그러나 무시됨', '铁柱说不能用'],
    ['ys_00m35s', '0:35', '사고', 'k-oppress', '크레인 와이어가 끊어짐', ''],
    ['ys_00m50s', '0:50', '억압', 'k-oppress', '아내가 남편이 아닌 친구의 다리를 먼저 돌봄', ''],
    ['ys_01m10s', '1:10', '억압', 'k-oppress', '“즈창 먼저 보내” 주인공은 뒤로 밀림', '先送志强'],
    ['ys_01m30s', '1:30', '전환', 'k-turn', '“十五年前” 죽음 직후 15년 전으로 회귀', '十五年前'],
    ['ys_02m00s', '2:00', '전환', 'k-turn', '약혼 자리, 진급 추천을 양보하라는 요구 반복', '你已经是高级钳工了'],
    ['ys_02m30s', '2:30', '반격', 'k-strike', '“선반공만 십수 년” 이번에는 양보를 거부', '我干了十几年钳工']
  ];
  var space = [
    ['ys_05m00s', '5:00', '배경', 'k-bg', '가정: 아내와 친구 사이의 갈등이 반복되는 식탁', '我只是问他一句要不要'],
    ['ys_10m00s', '10:00', '배경', 'k-bg', '국영 공장: 상사, 동료와 얽힌 조직 생활', ''],
    ['ys_20m00s', '20:00', '전환', 'k-turn', '공장 문 앞: 조직을 떠나는 장면', ''],
    ['ys_40m00s', '40:00', '반격', 'k-strike', '수리점: 자기 손으로 부품을 만드는 공간', '这边48件'],
    ['ys_1h20m00s', '1:20:00', '반격', 'k-strike', '도면 검토: 기술과 품질을 다투는 장면', '那更得查清是哪一版']
  ];
  function sceneCards(target, list) {
    var box = document.getElementById(target);
    if (!box) return;
    list.forEach(function (s) {
      var cap = 'YouTube 합본 ' + s[1] + ' · ' + s[4] + ' · 출처: 红果短剧 / 一双手闯出一片天';
      box.appendChild(el('article', { class: 'scene ' + s[3] },
        '<div class="head"><span>' + s[1] + '</span><span class="fn">' + s[2] + '</span></div>' +
        '<div class="img"><img src="' + F + s[0] + '.jpg" alt="' + esc(s[4]) + '" loading="lazy" data-zoom data-cap="' + esc(cap) + '"></div>' +
        '<div class="txt">' + zh(s[4]) + (s[5] ? '<span class="q">' + esc(s[5]) + '</span>' : '') + '</div>'));
    });
  }
  sceneCards('ysTimeline', timeline);
  sceneCards('ysSpace', space);

  $$('[data-hs]').forEach(function (b) {
    b.addEventListener('click', function () {
      var box = document.getElementById(b.getAttribute('data-target'));
      var card = box.firstElementChild; var step = card ? card.getBoundingClientRect().width + 16 : 220;
      box.scrollBy({ left: (b.getAttribute('data-hs') === 'next' ? 1 : -1) * step * 2, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- 持械入宋 장면 ---------- */
  var cx = [
    ['cx_00m01s', '0:01', '장갑차가 절벽으로 추락하며 시작', '사고'],
    ['cx_08m00s', '8:00', '표범 습격. 화면에 “AI制作，无真实动物受伤” 표기', '볼거리'],
    ['cx_12m00s', '12:00', '약탈자 기병이 마을을 습격', '억압'],
    ['cx_13m00s', '13:00', '현대 화기로 반격', '반격, 볼거리']
  ];
  var cxBox = $('#chixieFrames');
  if (cxBox) cx.forEach(function (c) {
    var cap = 'YouTube 합본 ' + c[1] + ' · ' + c[2] + ' · 출처: 红果短剧 / 持械入宋';
    cxBox.appendChild(el('figure', null,
      '<div class="phone"><div class="screen"><img src="assets/frames/chixie/' + c[0] + '.jpg" alt="' + esc(c[2]) + '" loading="lazy" data-zoom data-cap="' + esc(cap) + '"></div></div>' +
      '<figcaption class="phone-cap"><b>' + c[1] + ' · ' + c[3] + '</b><br>' + zh(c[2]) + '</figcaption>'));
  });

  /* ---------- 비교작 카드 ---------- */
  var cardInfo = {
    yishuangshou: { poster: 'assets/posters/yishuangshou.jpg', purpose: '<b>기준점.</b> 모든 비교의 출발점', metric: '열도 4,873만 · 평점 7.5 · 126화' },
    guancheng: { poster: 'assets/posters/guancheng.jpg', purpose: '<b>같은 공식의 AI 작품.</b> “기술 있는 노동자의 창업 역전”이 AI 작품 사이에서 반복되는지 확인', metric: 'AI剧热播榜 18위 · 열도 5,456만 · 평점 8.7 · 150화 이상' },
    xiaozhen: { poster: "assets/posters/xiaozhen.jpg", purpose: '<b>같은 정서의 실사 작품.</b> “아내의 배신 + 성실한 남자의 재기”를 실사는 어떤 속도와 연기로 풀어내는지 비교', metric: '真人剧热播榜 2위 · 열도 5,982만 · 평점 7.9' },
    chixie: { poster: 'assets/posters/chixie.jpg', purpose: '<b>다른 장르의 AI 작품.</b> 실사로는 비싼 전투, 사극 스케일을 AI가 얼마나 넓혔는지(볼거리 축)', metric: 'AI剧热播榜 6위 · 평점 9.5 · 저장 444.9만' },
    tainainai: { poster: "assets/posters/tainainai.jpg", purpose: '<b>실사 최상위 대조군.</b> 실사가 아직 이기는 지점(배우, 시리즈 IP)을 보여 주는 반대 사례', metric: '真人剧热播榜 1위 · 열도 6,901만 · 평점 9.6' }
  };
  var worksBox = $('#works');
  if (worksBox) ['yishuangshou', 'guancheng', 'xiaozhen', 'chixie', 'tainainai'].forEach(function (id) {
    var w = byId[id], c = cardInfo[id]; if (!w) return;
    var isAI = w.production === 'AI';
    var flags = (id === 'yishuangshou' ? '<span class="badge base">기준작</span>' : '') + '<span class="badge ' + (isAI ? 'ai' : 'real') + '" style="background:var(--surface)">' + (isAI ? 'AI' : '실사') + '</span>';
    var poster = c.poster
      ? '<div class="poster"><div class="flag">' + flags + '</div><img src="' + c.poster + '" alt="' + esc(w.title) + ' 공식 포스터" loading="lazy" data-zoom data-cap="' + esc('출처: 红果短剧 / ' + w.title + ' 공식 포스터') + '"></div>'
      : '<div class="poster noimg"><div class="flag">' + flags + '</div><div><div class="ttl">' + esc(SHORT[id]) + '</div><div class="why">실존 배우 출연 작품이라<br>사진을 싣지 않았습니다</div></div></div>';
    worksBox.appendChild(el('article', { class: 'work' }, poster +
      '<div class="body"><div class="t">' + esc(w.title) + '</div><div class="ko">' + esc(w.title_ko) + '</div>' +
      '<div class="premise">' + zh(w.premise) + '</div>' +
      '<div class="metric">' + zh(c.metric) + '</div>' +
      '<div class="purpose">' + c.purpose + '</div>' +
      '<a class="out" href="' + w.url + '" target="_blank" rel="noopener">红果 작품 페이지 ↗</a>' +
      (c.poster ? '<span class="xs muted">포스터 출처: 红果短剧 / ' + esc(SHORT[id]) + '</span>' : '') + '</div>'));
  });

  /* ---------- 차트 공통 ---------- */
  var SVGNS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs, text) {
    var n = document.createElementNS(SVGNS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text != null) n.textContent = text;
    return n;
  }
  function tooltipFor(box) {
    var t = el('div', { class: 'tooltip', role: 'status' });
    box.appendChild(t);
    return {
      show: function (html, x, y) {
        t.innerHTML = html; t.classList.add('show');
        var bw = box.clientWidth, tw = t.offsetWidth, th = t.offsetHeight;
        var left = Math.min(Math.max(8, x + 14), bw - tw - 8);
        var top = y - th - 12; if (top < -10) top = y + 18;
        t.style.left = left + 'px'; t.style.top = top + 'px';
      },
      hide: function () { t.classList.remove('show'); }
    };
  }
  function bindHover(g, box, tip, html) {
    function pos(e) { var r = box.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    g.addEventListener('pointermove', function (e) { var p = pos(e); tip.show(html, p[0], p[1]); });
    g.addEventListener('pointerdown', function (e) { var p = pos(e); tip.show(html, p[0], p[1]); });
    g.addEventListener('pointerleave', function () { tip.hide(); });
    g.addEventListener('focus', function () {
      var r = g.getBoundingClientRect(), b = box.getBoundingClientRect();
      g.classList.add('focus'); tip.show(html, r.left - b.left + r.width / 2, r.top - b.top + 10);
    });
    g.addEventListener('blur', function () { g.classList.remove('focus'); tip.hide(); });
  }
  function legend(box, items) {
    if (!box) return;
    box.innerHTML = items.map(function (it) { return '<span class="sw">' + it[0] + esc(it[1]) + '</span>'; }).join('');
  }
  var swLineAI = '<svg viewBox="0 0 22 12" aria-hidden="true"><line x1="1" y1="6" x2="15" y2="6" stroke="var(--ai)" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="6" r="4.5" fill="var(--ai)"/></svg>';
  var swLineReal = '<svg viewBox="0 0 22 12" aria-hidden="true"><line x1="1" y1="6" x2="15" y2="6" stroke="var(--real)" stroke-width="2" stroke-dasharray="4 3" stroke-linecap="round"/><circle cx="16" cy="6" r="4.5" fill="var(--real)"/></svg>';
  var swHollow = '<svg viewBox="0 0 22 12" aria-hidden="true"><circle cx="11" cy="6" r="4" fill="var(--surface)" stroke="var(--ink-2)" stroke-width="2"/></svg>';
  var swFilled = '<svg viewBox="0 0 22 12" aria-hidden="true"><circle cx="11" cy="6" r="4.5" fill="var(--ink-2)"/></svg>';
  var swDot = function (c) { return '<svg viewBox="0 0 22 12" aria-hidden="true"><circle cx="11" cy="6" r="4.5" fill="var(' + c + ')"/></svg>'; };
  var swTick = '<svg viewBox="0 0 22 12" aria-hidden="true"><line x1="11" y1="0" x2="11" y2="12" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round"/></svg>';

  /* 차트 1: 첫 갈등 → 첫 반격 (덤벨) */
  function drawReversal() {
    var box = $('#chartReversal'); if (!box) return;
    box.innerHTML = '';
    var tip = tooltipFor(box);
    var order = ['yishuangshou', 'guancheng', 'chixie', 'xiaozhen'];
    var W = Math.max(280, box.clientWidth), rowH = 64, top = 4, axisH = 30;
    var H = top + order.length * rowH + axisH;
    var padL = 6, padR = 18, max = 720;
    var x = function (sec) { return padL + (sec / max) * (W - padL - padR); };
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H });
    for (var m = 0; m <= 12; m += 2) {
      var gx = x(m * 60);
      svg.appendChild(s('line', { class: 'gridline', x1: gx, x2: gx, y1: top + 26, y2: H - axisH + 4 }));
      if (W >= 520 || m % 4 === 0) svg.appendChild(s('text', { class: 'axis', x: gx, y: H - 8, 'text-anchor': m === 0 ? 'start' : (m === 12 ? 'end' : 'middle') }, m + '분'));
    }
    order.forEach(function (id, i) {
      var w = byId[id]; if (!w) return;
      var y0 = top + i * rowH, ty = y0 + 44;
      var isAI = w.production === 'AI', col = isAI ? 'var(--ai)' : 'var(--real)';
      var g = s('g', { class: 'row', tabindex: '0', role: 'listitem' });
      g.appendChild(s('rect', { class: 'row-hover', x: 0, y: y0 + 2, width: W, height: rowH - 4, rx: 10 }));
      var lab = s('text', { class: 'zh', x: padL, y: y0 + 22 }, SHORT[id]);
      g.appendChild(lab);
      var x1 = x(w.first_conflict_sec);
      var endSec = w.first_reversal_sec != null ? w.first_reversal_sec : w.observed_until_sec;
      var x2 = x(endSec);
      var line = s('line', { x1: x1, x2: x2, y1: ty, y2: ty, stroke: col, 'stroke-width': 2, 'stroke-linecap': 'round' });
      if (w.first_reversal_sec == null) line.setAttribute('stroke-dasharray', '6 5');
      g.appendChild(line);
      g.appendChild(s('circle', { cx: x1, cy: ty, r: 5, fill: 'var(--surface)', stroke: col, 'stroke-width': 2 }));
      if (w.first_reversal_sec != null) {
        g.appendChild(s('circle', { cx: x2, cy: ty, r: 7, fill: col, stroke: 'var(--surface)', 'stroke-width': 2 }));
        g.appendChild(s('text', { class: 'val', x: x2 + 13, y: ty + 5 }, mmss(w.first_reversal_sec)));
      } else {
        g.appendChild(s('circle', { cx: x2, cy: ty, r: 6, fill: 'var(--surface)', stroke: col, 'stroke-width': 2 }));
        g.appendChild(s('text', { class: 'val-muted', x: W - padR, y: y0 + 22, 'text-anchor': 'end' }, mmss(endSec) + '까지 반격 없음'));
      }
      g.appendChild(s('rect', { class: 'hit', x: 0, y: y0, width: W, height: rowH }));
      var html = '<b class="zh">' + esc(w.title) + '</b> · ' + (isAI ? 'AI' : '실사') +
        '<span class="m">첫 갈등 ' + mmss(w.first_conflict_sec) + ' · ' + zh(w.first_conflict_note) + '</span>' +
        '<span class="m">첫 반격 ' + (w.first_reversal_sec != null ? mmss(w.first_reversal_sec) : '없음') + ' · ' + zh(w.first_reversal_note) + '</span>';
      g.setAttribute('aria-label', w.title + ', ' + (isAI ? 'AI' : '실사') + ', 첫 갈등 ' + mmss(w.first_conflict_sec) + ', 첫 반격 ' + (w.first_reversal_sec != null ? mmss(w.first_reversal_sec) : mmss(endSec) + '까지 없음'));
      bindHover(g, box, tip, html);
      svg.appendChild(g);
      // 이름 옆 AI/실사 표시 (색에만 의존하지 않도록)
      requestAnimationFrame(function () {
        var bb = 0; try { bb = lab.getBBox().width; } catch (e) { bb = 90; }
        g.insertBefore(s('text', { class: 'axis', x: padL + bb + 8, y: y0 + 22 }, isAI ? 'AI' : '실사'), g.querySelector('.hit'));
      });
    });
    svg.setAttribute('role', 'list');
    box.insertBefore(svg, box.firstChild);
  }
  legend($('#legendReversal'), [[swLineAI, 'AI 작품'], [swLineReal, '실사 작품 (점선: 관찰 범위 안에 반격 없음)'], [swHollow, '첫 갈등'], [swFilled, '첫 반격']]);

  /* 차트 2: 1~5화 회차 길이 (점 + 평균) */
  function drawLength() {
    var box = $('#chartLength'); if (!box) return;
    box.innerHTML = '';
    var tip = tooltipFor(box);
    var order = ['yishuangshou', 'guancheng', 'chixie', 'xiaozhen', 'tainainai'];
    var W = Math.max(280, box.clientWidth), rowH = 58, top = 4, axisH = 30;
    var H = top + order.length * rowH + axisH;
    var padL = 10, padR = 14, max = 200;
    var x = function (sec) { return padL + (sec / max) * (W - padL - padR); };
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H });
    [0, 60, 120, 180].forEach(function (t) {
      var gx = x(t);
      svg.appendChild(s('line', { class: 'gridline', x1: gx, x2: gx, y1: top + 26, y2: H - axisH + 4 }));
      svg.appendChild(s('text', { class: 'axis', x: gx, y: H - 8, 'text-anchor': t === 0 ? 'start' : 'middle' }, t === 0 ? '0초' : (t / 60) + '분'));
    });
    order.forEach(function (id, i) {
      var w = byId[id]; if (!w) return;
      var y0 = top + i * rowH, ty = y0 + 42;
      var isAI = w.production === 'AI', col = isAI ? 'var(--ai)' : 'var(--real)';
      var g = s('g', { class: 'row' });
      g.appendChild(s('rect', { class: 'row-hover', x: 0, y: y0 + 2, width: W, height: rowH - 4, rx: 10 }));
      g.appendChild(s('text', { class: 'zh', x: padL, y: y0 + 21 }, SHORT[id]));
      g.appendChild(s('text', { class: 'val', x: W - padR, y: y0 + 21, 'text-anchor': 'end' }, '평균 ' + Math.round(w.ep_len_avg_sec) + '초'));
      var lens = w.ep_len_sec_ep1_5;
      var mn = Math.min.apply(null, lens), mx = Math.max.apply(null, lens);
      g.appendChild(s('line', { x1: x(mn), x2: x(mx), y1: ty, y2: ty, stroke: 'var(--line-strong)', 'stroke-width': 2, 'stroke-linecap': 'round' }));
      var ax = x(w.ep_len_avg_sec);
      g.appendChild(s('line', { x1: ax, x2: ax, y1: ty - 11, y2: ty + 11, stroke: 'var(--ink)', 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
      svg.appendChild(g);
      lens.forEach(function (len, k) {
        var dg = s('g', { tabindex: '0', class: 'row', 'aria-label': w.title + ' ' + (k + 1) + '화 ' + Math.round(len) + '초' });
        dg.appendChild(s('circle', { cx: x(len), cy: ty, r: 5.5, fill: col, stroke: 'var(--surface)', 'stroke-width': 2 }));
        dg.appendChild(s('circle', { class: 'hit', cx: x(len), cy: ty, r: 12 }));
        bindHover(dg, box, tip, '<b class="zh">' + esc(SHORT[id]) + '</b> · ' + (k + 1) + '화<span class="m">' + Math.round(len) + '초 (' + mmss(len) + ') · ' + (isAI ? 'AI' : '실사') + '</span>');
        svg.appendChild(dg);
      });
    });
    box.appendChild(svg);
  }
  legend($('#legendLength'), [[swDot('--ai'), 'AI 작품의 한 회차'], [swDot('--real'), '실사 작품의 한 회차'], [swTick, '1~5화 평균']]);

  function drawCharts() { drawReversal(); drawLength(); }
  drawCharts();
  var lastW = 0, rT;
  window.addEventListener('resize', function () {
    clearTimeout(rT);
    rT = setTimeout(function () { var w = ($('#chartReversal') || {}).clientWidth; if (w && w !== lastW) { lastW = w; drawCharts(); } }, 150);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawCharts);

  /* 차트 3: 회차 끝 钩子 */
  var hooksBox = $('#hooks');
  if (hooksBox) ['yishuangshou', 'guancheng', 'chixie', 'xiaozhen'].forEach(function (id) {
    var w = byId[id]; if (!w) return;
    var chips = w.ending_hooks_ep1_5.map(function (h, k) {
      var cls = (h === '대결' || h === '위기') ? 'strong' : (h === '여운' ? 'soft' : '');
      return '<div class="chip ' + cls + '"><span class="ep">' + (k + 1) + '화</span>' + esc(h) + '</div>';
    }).join('');
    hooksBox.appendChild(el('div', { class: 'row' }, '<div class="name">' + esc(SHORT[id]) + '<span class="badge ' + (w.production === 'AI' ? 'ai' : 'real') + '">' + (w.production === 'AI' ? 'AI' : '실사') + '</span></div><div class="chips">' + chips + '</div>'));
  });
  if (hooksBox && byId.yishuangshou) hooksBox.appendChild(el('p', { class: 'table-note' }, '<span class="zh">一双手</span> 5화 마지막 대사: “<span class="zh">这个婚到此为止</span>”(이 결혼은 여기까지)'));

  /* ---------- 비교 기록표 ---------- */
  var tbl = $('#compareTable');
  if (tbl) {
    var cols = ['yishuangshou', 'guancheng', 'xiaozhen', 'chixie'].map(function (id) { return byId[id]; }).filter(Boolean);
    var lenStr = function (w) { return w.ep_len_sec_ep1_5.map(function (v) { return Math.round(v); }).join(', ') + ' <span class="sub">평균 ' + Math.round(w.ep_len_avg_sec) + '초</span>'; };
    var rows = [
      ['1화 첫 갈등까지', function (w) { return '약 ' + w.first_conflict_sec + '초<span class="sub">' + zh(w.first_conflict_note) + '</span>'; }],
      ['첫 역전/반격까지', function (w) { return zh(w.first_reversal_note); }],
      ['1~5화 반전 횟수<span class="sub">주도권이 바뀐 순간 · 관찰 결과</span>', function (w) { return w.reversals_ep1_5 + '회<span class="sub">' + zh(w.reversals_note) + '</span>'; }],
      ['회차 끝 钩子 유형 (1~5화)<span class="sub">관찰 결과</span>', function (w) { return esc(w.ending_hooks_ep1_5.join(' / ')) + (w.ending_hooks_note ? '<span class="sub">' + zh(w.ending_hooks_note) + '</span>' : ''); }],
      ['억압의 가해자', function (w) { return esc(w.oppressor); }],
      ['전환 장치', function (w) { return zh(w.device); }],
      ['보상의 종류', function (w) { return esc(w.reward); }],
      ['한 화 길이 (초, 1~5화)', lenStr],
      ['등장인물 얼굴 유사도<span class="sub">팀 판단 · 관찰 결과</span>', function (w) { return '<b>' + esc(w.face_similarity) + '</b><span class="sub">' + esc(w.face_note) + '</span>'; }],
      ['실사로 찍기 어려운 장면 수 (1~5화)<span class="sub">관찰 결과</span>', function (w) { return esc(w.hard_to_film_scenes); }]
    ];
    var thead = '<thead><tr><th>항목</th>' + cols.map(function (w) {
      var isAI = w.production === 'AI';
      return '<th' + (w.id === 'yishuangshou' ? ' class="base"' : '') + '><span class="zh">' + esc(SHORT[w.id]) + '</span> <span class="badge ' + (isAI ? 'ai' : 'real') + '">' + (isAI ? 'AI' : '실사') + (w.id === 'yishuangshou' ? ', 기준' : '') + '</span></th>';
    }).join('') + '</tr></thead>';
    var tbody = '<tbody>' + rows.map(function (r) {
      return '<tr><th>' + r[0].replace(/钩子/, '<span class="zh">钩子</span>') + '</th>' + cols.map(function (w) { return '<td' + (w.id === 'yishuangshou' ? ' class="base"' : '') + '>' + r[1](w) + '</td>'; }).join('') + '</tr>';
    }).join('') + '</tbody>';
    tbl.innerHTML = '<caption class="sr-only" style="position:absolute;left:-9999px">작품 비교 기록표 (1~5화, 红果 공식 플레이어, 2026.11.9)</caption>' + thead + tbody;
  }

  /* ---------- 상영관 ---------- */
  var YT = '3F80jCzxyj4';
  var CX_NANO = '출처: 红果短剧 / 持械入宋 · 영상: YouTube 《持械入宋：第一季》 합본(Nano Review). 장면 캡처와 다른 업로드라 시간이 캡처와 다릅니다';
  var theater = {
    yishuangshou: {
      tab: '<span class="zh">一双手闯出一片天</span> · 영상', wide: false,
      credit: '출처: 红果短剧 / 一双手闯出一片天 · 영상: YouTube 합본(KK爱看)',
      items: [
        { type: 'local', src: 'assets/video/yishuangshou_ep1_intro_30s.mp4', thumb: 'ys_00m03s', t: '0:00–0:30', title: '1화 도입부 30초', desc: '끊어지기 직전의 와이어, 이름 자막, 하단 AI 표기' },
        { type: 'yt', start: 30, end: 85, thumb: 'ys_00m50s', title: '사고와 외면', desc: '와이어가 끊어지고, 아내는 남편보다 친구를 먼저 돌본다' },
        { type: 'yt', start: 85, end: 112, thumb: 'ys_01m30s', title: '회귀 “十五年前”', desc: '죽음 직후 15년 전 약혼 자리로 돌아간다' },
        { type: 'yt', start: 115, end: 170, thumb: 'ys_02m30s', title: '첫 반격: 양보 거부', desc: '“지금 내게 가장 필요한 건 기회야”' },
        { type: 'yt', start: 1185, end: 1245, thumb: 'ys_20m00s', title: '공장을 떠나다', desc: '조직을 떠나는 공장 문 앞' },
        { type: 'yt', start: 2390, end: 2450, thumb: 'ys_40m00s', title: '수리점의 왕톄주', desc: '자기 손으로 부품을 만드는 공간' },
        { type: 'yt', start: 4790, end: 4850, thumb: 'ys_1h20m00s', title: '도면 검토', desc: '기술과 품질을 다투는 장면' }
      ]
    },
    guancheng: {
      tab: '<span class="zh">莞城往事</span> · 영상', wide: true, dir: 'guancheng', pre: 'gc_',
      clipCredit: '출처: 红果短剧 / 莞城往事 · 영상: YouTube 《莞城往事：我的房东叫红姐》 합본(KK爱看)',
      clips: [
        { type: 'yt', vid: '3PeNajvCJ0s', start: 0, end: 35, thumbSrc: 'assets/frames/guancheng/gc_00m03s.jpg', title: '도입: 둥관 기차역', desc: '2005년 둥관에 맨몸으로 도착, 이름 자막으로 인물 소개' },
        { type: 'yt', vid: '3PeNajvCJ0s', start: 55, end: 80, thumbSrc: 'assets/frames/guancheng/gc_01m00s.jpg', title: '귀인 등장: 집주인 자오훙메이', desc: '회귀 대신 이 인물이 전환 장치가 된다' },
        { type: 'yt', vid: '3PeNajvCJ0s', start: 180, end: 205, thumbSrc: 'assets/frames/guancheng/gc_03m00s.jpg', title: '억압: “내겐 85위안뿐”', desc: '고향 사람마저 외면한다' },
        { type: 'yt', vid: '3PeNajvCJ0s', start: 305, end: 335, thumbSrc: 'assets/frames/guancheng/gc_05m22s.jpg', title: '반전: 세탁기 수리', desc: '집주인의 시험을 기술로 통과한다' }
      ],
      credit: '출처: 红果短剧 / 莞城往事：八十五块闯出亿万身家 · YouTube 합본 화면 캡처',
      url: 'https://hongguoduanju.com/detail?series_id=7698351941423729689',
      items: [
        ['00m03s', '0:03', '2005년 둥관 기차역, 맨몸으로 도착한 주인공 천환'],
        ['00m10s', '0:10', '“여자친구에게 돈을 다 뜯김” 자막으로 출발 (억압)'],
        ['01m00s', '1:00', '셋방 집주인 자오훙메이 등장'],
        ['03m00s', '3:00', '“내겐 85위안뿐” 천환 클로즈업 (억압)'],
        ['03m12s', '3:12', '고향 사람마저 “방세 빌려줄 순 없지” 외면 (억압)'],
        ['04m34s', '4:34', '집주인과 “남은 돈” 대화'],
        ['05m10s', '5:10', '“지금 세탁기 고쳐 봐” 집주인의 시험 (전환)'],
        ['05m22s', '5:22', '세탁기를 고치며 기술로 인정받기 시작 (반격)'],
        ['1h00m00s', '1:00:00', '중반부 장면'],
        ['1h56m40s', '1:56:40', '후반부 장면']
      ]
    },
    chixie: {
      tab: '<span class="zh">持械入宋</span> · 영상', wide: false, dir: 'chixie', pre: 'cx_',
      clipCredit: '출처: 红果短剧 / 持械入宋 · 영상: YouTube 《持械入宋超长版：第一季》 합본(KK爱看). 장면 캡처와 다른 업로드라 시간이 캡처와 다릅니다',
      clips: [
        { type: 'yt', vid: 'OOpGiD7p_sk', start: 0, end: 40, thumbSrc: 'assets/frames/chixie/cx_00m01s.jpg', title: '도입: 장갑차 추락 직후', desc: '첫 장면부터 생존 위기' },
        { type: 'yt', vid: '2m_ZaRnJxI8', start: 435, end: 480, thumbSrc: 'assets/frames/chixie/cx_08m00s.jpg', title: '첫 반격: 맹수 제압', desc: '맹수와의 싸움, 실사로는 부담이 큰 장면', credit: CX_NANO },
        { type: 'yt', vid: '2m_ZaRnJxI8', start: 685, end: 735, thumbSrc: 'assets/frames/chixie/cx_13m00s.jpg', title: '현대 화기로 반격', desc: '마을을 덮친 약탈자를 현대 무기로 압도한다', credit: CX_NANO }
      ],
      credit: '출처: 红果短剧 / 持械入宋 第一季 · YouTube 합본 화면 캡처',
      url: 'https://hongguoduanju.com/detail?series_id=7671966197985856536',
      items: [
        ['00m01s', '0:01', '장갑차가 절벽으로 추락하며 시작 (사고)'],
        ['00m30s', '0:30', '“대장!” 첫 장면부터 생존 위기'],
        ['01m30s', '1:30', '낯선 산속, 송나라로 시간이동 (전환)'],
        ['05m00s', '5:00', '“너희는 송나라 사람이 아니다” (억압)'],
        ['08m00s', '8:00', '표범 습격, “AI制作，无真实动物受伤” 표기 (볼거리)'],
        ['12m00s', '12:00', '약탈자 기병이 마을을 습격 (억압)'],
        ['13m00s', '13:00', '현대 화기로 반격 (반격, 볼거리)']
      ]
    },
    real: { tab: '실사 2편', real: true }
  };
  var tabsBox = $('#theaterTabs'), stage = $('#stage'), plWrap = $('#playlistWrap');
  var icoPlay = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>';
  var icoL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg>';
  var icoR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>';

  function playClip(it, autoplay, cfg) {
    cfg = cfg || theater.yishuangshou;
    var vid = it.vid || YT, thumb = it.thumbSrc || ('assets/frames/yishuangshou/' + it.thumb + '.jpg');
    var phone = el('div', { class: 'phone' + (it.vid && it.vid !== YT ? ' wide' : '') });
    var scr = el('div', { class: 'screen' }); phone.appendChild(scr);
    var cap = el('div', { class: 'stage-cap' });
    var timeTxt = it.type === 'yt' ? 'YouTube 합본 ' + mmss(it.start) + '–' + mmss(it.end) : it.t;
    if (it.type === 'local') {
      scr.innerHTML = '<video src="' + it.src + '" poster="assets/frames/yishuangshou/' + it.thumb + '.jpg" muted playsinline controls preload="metadata"' + (autoplay ? ' autoplay' : '') + '></video>';
    } else {
      var f = el('button', { class: 'facade', type: 'button', 'aria-label': it.title + ' 재생' },
        '<img src="' + thumb + '" alt=""><span class="play">' + icoPlay + '</span><span class="fl">' + zh(it.title) + '<br>' + timeTxt + '</span>');
      f.addEventListener('click', function () {
        scr.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + vid + '?start=' + it.start + '&end=' + it.end + '&autoplay=1&playsinline=1&rel=0&modestbranding=1" title="' + esc(it.title) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>';
      });
      scr.appendChild(f);
    }
    cap.innerHTML = '<b>' + zh(it.title) + '</b> · ' + timeTxt + '<br>' + zh(it.desc) +
      '<span class="cr">' + zh(it.credit || cfg.clipCredit || cfg.credit) + (it.type === 'yt' ? ' · <a href="https://www.youtube.com/watch?v=' + vid + '&t=' + it.start + 's" target="_blank" rel="noopener">YouTube에서 열기 ↗</a>' : '') + '</span>';
    stage.innerHTML = ''; stage.appendChild(phone); stage.appendChild(cap);
  }

  function showStill(cfg, idx) {
    var it = cfg.items[idx];
    var phone = el('div', { class: 'phone' + (cfg.wide ? ' wide' : '') });
    var src = 'assets/frames/' + cfg.dir + '/' + cfg.pre + it[0] + '.jpg';
    phone.innerHTML = '<div class="screen"><img src="' + src + '" alt="' + esc(it[2]) + '" data-zoom data-cap="' + esc('YouTube 합본 ' + it[1] + ' · ' + it[2] + ' · ' + cfg.credit) + '">' +
      '<button class="still-nav prev" type="button" aria-label="이전 장면">' + icoL + '</button><button class="still-nav next" type="button" aria-label="다음 장면">' + icoR + '</button></div>';
    var cap = el('div', { class: 'stage-cap' }, '<b>' + (idx + 1) + ' / ' + cfg.items.length + '</b> · YouTube 합본 ' + it[1] + '<br>' + zh(it[2]) + '<span class="cr">' + zh(cfg.credit) + '</span>');
    stage.innerHTML = ''; stage.appendChild(phone); stage.appendChild(cap);
    $('.prev', phone).addEventListener('click', function () { selectStill(cfg, (idx - 1 + cfg.items.length) % cfg.items.length); });
    $('.next', phone).addEventListener('click', function () { selectStill(cfg, (idx + 1) % cfg.items.length); });
  }
  function selectStill(cfg, idx) {
    showStill(cfg, idx);
    $('.playlist button', plWrap).forEach(function (b) { b.setAttribute('aria-current', b.getAttribute('data-still') === String(idx) ? 'true' : 'false'); });
  }
  function clipButton(it, cfg, ul, first) {
    var b = el('button', { type: 'button', 'aria-current': first ? 'true' : 'false' },
      '<span class="th"><img src="' + (it.thumbSrc || ('assets/frames/yishuangshou/' + it.thumb + '.jpg')) + '" alt="" loading="lazy"></span><span><span class="tt">' + zh(it.title) + '</span><span class="dd">' + zh(it.desc) + '</span></span><span class="tm"><span class="type">' + (it.type === 'yt' ? 'YouTube' : '영상 파일') + '</span>' + (it.type === 'yt' ? mmss(it.start) + '–' + mmss(it.end) : it.t) + '</span>');
    b.addEventListener('click', function () {
      $('button', ul).forEach(function (x) { x.setAttribute('aria-current', 'false'); });
      b.setAttribute('aria-current', 'true'); playClip(it, true, cfg);
      if (window.innerWidth < 800) stage.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
    return b;
  }

  function openTab(key) {
    $$('.tab', tabsBox).forEach(function (t) { t.setAttribute('aria-selected', t.getAttribute('data-key') === key ? 'true' : 'false'); });
    var cfg = theater[key];
    plWrap.innerHTML = '';
    if (cfg.real) {
      var xz = byId.xiaozhen, tn = byId.tainainai;
      stage.innerHTML = '<div class="real-box"><span class="badge real">실사</span><h3 class="sub" style="margin-top:12px">실사 작품은 포스터와 데이터로</h3><p class="small">두 실사 작품은 장면 캡처와 영상 클립 없이, 공식 포스터와 비교 기록표의 관찰 결과로 비교합니다. 작품은 <span class="zh">红果</span> 공식 페이지에서 볼 수 있습니다.</p></div>';
      plWrap.innerHTML = [xz, tn].filter(Boolean).map(function (w) {
        return '<div class="card real-card"><img class="real-poster" src="assets/posters/' + w.id + '.jpg" alt="' + esc(w.title) + ' 공식 포스터" loading="lazy" data-zoom data-cap="' + esc('출처: 红果短剧 / ' + w.title + ' 공식 포스터') + '"><div><span class="k">' + esc(w.role) + '</span><h3 class="zh">' + esc(w.title) + '</h3><p class="small muted" style="margin-top:-6px">' + esc(w.title_ko) + '</p><p>' + zh(w.premise) + '</p>' +
          (w.first_conflict_sec != null ? '<p class="small">첫 갈등 약 ' + w.first_conflict_sec + '초 · ' + zh(w.first_reversal_note) + ' <span class="badge obs">관찰 결과</span></p>' : '<p class="small">1~5화 평균 회차 길이 약 ' + Math.round(w.ep_len_avg_sec) + '초 · 장면 분석은 하지 않음</p>') +
          '<p class="small muted">' + zh((w.metrics_2026_11_09.rank || '') + ' · 열도 ' + w.metrics_2026_11_09.heat + ' · 평점 ' + w.metrics_2026_11_09.rating) + ' (2026.11.9)</p>' +
          '<a href="' + w.url + '" target="_blank" rel="noopener">红果에서 보기 ↗</a><p class="xs muted" style="margin-top:6px">포스터 출처: 红果短剧 / ' + esc(SHORT[w.id]) + '</p></div></div>';
      }).join('');
      return;
    }
    var ul = el('ul', { class: 'playlist' });
    (cfg.clips || []).forEach(function (it, i) { var li = el('li'); li.appendChild(clipButton(it, cfg, ul, i === 0)); ul.appendChild(li); });
    cfg.items.forEach(function (it, i) {
      var li = el('li');
      var b;
      if (key === 'yishuangshou') {
        var t = it.type === 'yt' ? mmss(it.start) + '–' + mmss(it.end) : it.t;
        b = el('button', { type: 'button', 'aria-current': i === 0 ? 'true' : 'false' },
          '<span class="th"><img src="assets/frames/yishuangshou/' + it.thumb + '.jpg" alt="" loading="lazy"></span><span><span class="tt">' + zh(it.title) + '</span><span class="dd">' + zh(it.desc) + '</span></span><span class="tm"><span class="type">' + (it.type === 'yt' ? 'YouTube' : '영상 파일') + '</span>' + t + '</span>');
        b.addEventListener('click', function () {
          $$('button', ul).forEach(function (x) { x.setAttribute('aria-current', 'false'); });
          b.setAttribute('aria-current', 'true'); playClip(it, true);
          if (window.innerWidth < 860) stage.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        });
      } else {
        b = el('button', { type: 'button', 'data-still': String(i), 'aria-current': 'false' },
          '<span class="th"><img src="assets/frames/' + cfg.dir + '/' + cfg.pre + it[0] + '.jpg" alt="" loading="lazy"></span><span><span class="tt">' + zh(it[2]) + '</span></span><span class="tm"><span class="type">장면</span>' + it[1] + '</span>');
        b.addEventListener('click', function () { $('button', ul).forEach(function (x) { x.setAttribute('aria-current', 'false'); }); selectStill(cfg, i); });
      }
      li.appendChild(b); ul.appendChild(li);
    });
    plWrap.appendChild(ul);
    var note = el('p', { class: 'theater-note' });
    if (key === 'yishuangshou') {
      note.innerHTML = '모든 시간은 <b>YouTube 합본 기준</b>입니다 (<span class="zh">红果</span> 공식 플레이어보다 10~20초 이릅니다). YouTube 클립은 업로더(KK爱看)의 합본에서 해당 구간만 재생하며, 영상이 내려가거나 지역에 따라 재생되지 않을 수 있습니다. <a href="https://hongguoduanju.com/detail?series_id=7696903115634658329" target="_blank" rel="noopener">红果에서 전편 보기 ↗</a>';
      playClip(cfg.items[0], false);
    } else {
      note.innerHTML = '위의 영상 클립은 YouTube 합본' + (key === 'chixie' ? '' : '(KK爱看)') + '에서 해당 구간만 재생하고, 아래 “장면”은 팀이 확인한 화면 캡처입니다. 시간은 <b>YouTube 합본 기준</b>입니다.' + (key === 'chixie' ? ' 영상 클립은 캡처와 다른 업로드(도입: KK爱看 超长版 第一季, 맹수 제압과 현대 화기: Nano Review 第一季)라 시간이 캡처와 다릅니다.' : '') + ' <a href="' + cfg.url + '" target="_blank" rel="noopener">红果에서 보기 ↗</a>';
      if (cfg.clips && cfg.clips.length) playClip(cfg.clips[0], false, cfg); else showStill(cfg, 0);
    }
    plWrap.appendChild(note);
  }
  if (tabsBox) {
    Object.keys(theater).forEach(function (k, i) {
      var t = el('button', { class: 'tab', role: 'tab', type: 'button', 'data-key': k, 'aria-selected': i === 0 ? 'true' : 'false' }, theater[k].tab);
      t.addEventListener('click', function () { openTab(k); });
      tabsBox.appendChild(t);
    });
    openTab('yishuangshou');
  }

  /* ---------- 홈: 1분 소개 영상 ---------- */
  var intro = $('#introVideo'), soundBtn = $('#soundBtn');
  if (intro) {
    // 들어오자마자 소리 없이 재생 (브라우저는 소리 없는 자동 재생만 허용)
    if (!reduceMotion) { var p = intro.play(); if (p && p.catch) p.catch(function () {}); }
    if (soundBtn) soundBtn.addEventListener('click', function () {
      intro.muted = false; intro.loop = false; intro.currentTime = 0;
      var q = intro.play(); if (q && q.catch) q.catch(function () {});
      soundBtn.hidden = true;
    });
    intro.addEventListener('volumechange', function () { if (soundBtn && !intro.muted) soundBtn.hidden = true; });

    // 전체화면: 휴대폰에서는 세로 방향으로 고정 (지원하는 브라우저에서만)
    var onFs = function () {
      var fsEl = document.fullscreenElement || document.webkitFullscreenElement;
      var o = screen.orientation;
      if (!o) return;
      if (fsEl === intro && o.lock) { var r = o.lock('portrait'); if (r && r.catch) r.catch(function () {}); }
      else if (!fsEl && o.unlock) { try { o.unlock(); } catch (e) {} }
    };
    document.addEventListener('fullscreenchange', onFs);
    document.addEventListener('webkitfullscreenchange', onFs);

    // 작은 화면에서는 기본 조작부에 전체화면 버튼이 숨으므로 직접 버튼을 둔다
    var fsBtn = $('#fsBtn');
    if (fsBtn) fsBtn.addEventListener('click', function () {
      var go = function () { var q = intro.play(); if (q && q.catch) q.catch(function () {}); };
      if (intro.requestFullscreen) { var r = intro.requestFullscreen(); if (r && r.then) r.then(go, function () {}); else go(); }
      else if (intro.webkitRequestFullscreen) { intro.webkitRequestFullscreen(); go(); }
      else if (intro.webkitEnterFullscreen) { intro.webkitEnterFullscreen(); go(); } // iPhone: 기본 플레이어가 세로 영상 비율 그대로 연다
    });
  }

  /* ---------- 반전 장면: 해당 구간만 재생 ---------- */
  $$('.clips').forEach(function (box) {
    var player = $('.clip-player', box);
    $$('.clip-btn', box).forEach(function (b) {
      var s0 = +b.getAttribute('data-s'), e0 = +b.getAttribute('data-e');
      var vid = b.getAttribute('data-vid'), title = b.getAttribute('data-t'), work = b.getAttribute('data-work'), up = b.getAttribute('data-up') || 'KK爱看';
      var range = mmss(s0) + '–' + mmss(e0);
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>' + zh(title) + ' <span>' + (e0 - s0) + '초</span>';
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-pressed') === 'true';
        $$('.clip-btn', box).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        if (on) { player.hidden = true; player.innerHTML = ''; return; }
        b.setAttribute('aria-pressed', 'true');
        player.className = 'clip-player' + (b.getAttribute('data-wide') === '1' ? ' wide' : '');
        player.hidden = false;
        player.innerHTML = '<div class="cp-frame"><iframe src="https://www.youtube-nocookie.com/embed/' + vid + '?start=' + s0 + '&end=' + e0 + '&autoplay=1&playsinline=1&rel=0&modestbranding=1" title="' + esc(title) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>' +
          '<p class="cp-cap"><b>' + zh(title) + '</b> · YouTube 합본 ' + range + '<br><span class="cr">출처: 红果短剧 / ' + zh(work) + ' · 영상: YouTube 합본(' + zh(up) + ') · <a href="https://www.youtube.com/watch?v=' + vid + '&t=' + s0 + 's" target="_blank" rel="noopener">YouTube에서 열기 ↗</a></span></p>';
      });
    });
  });

  /* ---------- 아카이브 슬라이드 ---------- */
  function buildViewer(v) {
    if (v.dataset.built || !v.dataset.slides) return;
    v.dataset.built = '1';
    var n = +v.dataset.count, pat = v.dataset.slides, label = v.dataset.label, idx = 0;
    var src = function (i) { var k = i + 1; return pat.replace('{n}', (k < 10 ? '0' : '') + k); };
    v.innerHTML = '<div class="vimg"><img alt=""></div><div class="vbar"><span class="cnt"></span>' +
      '<button class="icon-btn" type="button" data-d="-1" aria-label="이전 쪽">' + icoL + '</button><button class="icon-btn" type="button" data-d="1" aria-label="다음 쪽">' + icoR + '</button></div><div class="thumbs"></div>';
    var img = $('.vimg img', v), cnt = $('.cnt', v), th = $('.thumbs', v);
    for (var i = 0; i < n; i++) (function (i) {
      var b = el('button', { type: 'button', 'aria-label': (i + 1) + '쪽' }, '<img src="' + src(i) + '" alt="" loading="lazy">');
      b.addEventListener('click', function () { go(i); });
      th.appendChild(b);
    })(i);
    function go(i) {
      idx = (i + n) % n;
      img.src = src(idx); img.alt = label + ' ' + (idx + 1) + '쪽';
      img.setAttribute('data-zoom', ''); img.setAttribute('data-cap', label + ' ' + (idx + 1) + ' / ' + n + ' · 3조 팀 발표자료');
      cnt.textContent = (idx + 1) + ' / ' + n + ' · ' + label;
      $$('button', th).forEach(function (b, k) { b.setAttribute('aria-current', k === idx ? 'true' : 'false'); });
      var cur = th.children[idx]; if (cur) th.scrollTo({ left: cur.offsetLeft - th.clientWidth / 2 + cur.clientWidth / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    $$('.vbar [data-d]', v).forEach(function (b) { b.addEventListener('click', function () { go(idx + (+b.getAttribute('data-d'))); }); });
    v.tabIndex = 0;
    v.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') go(idx - 1); if (e.key === 'ArrowRight') go(idx + 1); });
    go(0);
  }
  var archTabs = $$('#archiveTabs .tab');
  function openWeek(id) {
    archTabs.forEach(function (t) { t.setAttribute('aria-selected', t.getAttribute('data-week') === id ? 'true' : 'false'); });
    $$('.week').forEach(function (w) { w.hidden = w.id !== id; if (w.id === id) buildViewer(w); });
  }
  archTabs.forEach(function (t) { t.addEventListener('click', function () { openWeek(t.getAttribute('data-week')); }); });
  openWeek('w3');

  /* ---------- 라이트박스 ---------- */
  var lb = $('#lightbox');
  document.addEventListener('click', function (e) {
    var img = e.target.closest('img[data-zoom]');
    if (!img || !lb || typeof lb.showModal !== 'function') return;
    var cap = img.getAttribute('data-cap');
    if (!cap) { var fig = img.closest('figure'); var fc = fig && fig.querySelector('figcaption'); cap = fc ? fc.textContent : img.alt; }
    $('img', lb).src = img.currentSrc || img.src; $('img', lb).alt = img.alt;
    $('.lb-cap', lb).textContent = cap || '';
    lb.showModal();
  });
  if (lb) {
    $('.lb-close', lb).addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.tagName === 'IMG') lb.close(); });
  }
})();
