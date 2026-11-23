/* AI 숏드라마 온라인 전시: 상호작용과 시각화
   데이터는 window.COMPARISON(data/comparison.json과 같은 내용)과 팀 자료에 있는 값만 쓴다. */
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
      else n.setAttribute(k, attrs[k]);
    });
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function mmss(sec) {
    sec = Math.round(sec);
    var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60, ss = (s < 10 ? '0' : '') + s;
    return h ? h + ':' + (m < 10 ? '0' : '') + m + ':' + ss : m + ':' + ss;
  }
  // 한자 덩어리를 중국어 글꼴로 감싸기 (앞에 붙은 영문까지 한 덩어리)
  function zh(s) { return esc(s).replace(/([A-Za-z]*[㐀-鿿，：。！《》]+)/g, '<span class="zh">$1</span>'); }

  var SHORT = { yishuangshou: '一双手闯出一片天', guancheng: '莞城往事', xiaozhen: '小镇是非多', chixie: '持械入宋', tainainai: '十八岁太奶奶驾到 5' };
  window.EXHIBIT = { byId: byId, SHORT: SHORT, zh: zh, esc: esc, mmss: mmss };

  var ICO = {
    l: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg>',
    r: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>'
  };

  /* ---------- 스크롤 진행 표시, 등장 효과 ---------- */
  var progress = $('#progress'), ticking = false;
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = 'scaleX(' + (h > 0 ? window.scrollY / h : 0).toFixed(4) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); rio.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
    revealEls.forEach(function (n) { rio.observe(n); });
  } else revealEls.forEach(function (n) { n.classList.add('in'); });

  // 막대가 화면에 들어오면 채우기 (설문, 점수 막대)
  // 막대는 처음부터 채워 둔다 (화면 감지에 기대지 않음, 움직임은 CSS가 담당)
  requestAnimationFrame(function () { $$('[data-w]').forEach(function (i) { i.style.width = i.getAttribute('data-w') + '%'; }); });

  /* ---------- 슬라이드: 좌우 스크롤 대신 버튼으로 한 장씩 ---------- */
  function initCarousel(c) {
    if (c.dataset.built) return;
    var track = $('.car-track', c); if (!track) return;
    c.dataset.built = '1';
    var ctrl = el('div', { class: 'car-ctrl' }, '<button class="car-btn prev" type="button" aria-label="이전">' + ICO.l + '</button><span class="car-count" aria-live="polite"></span><button class="car-btn next" type="button" aria-label="다음">' + ICO.r + '</button>');
    var dots = el('div', { class: 'car-dots', 'aria-hidden': 'true' });
    c.appendChild(ctrl); c.appendChild(dots);
    var prev = $('.prev', ctrl), next = $('.next', ctrl), count = $('.car-count', ctrl);
    function metrics() {
      var items = track.children; if (!items.length) return null;
      var w = items[0].getBoundingClientRect().width + 12;
      var per = Math.max(1, Math.round((track.clientWidth + 12) / w));
      var pages = Math.max(1, items.length - per + 1);
      return { w: w, per: per, pages: pages, n: items.length };
    }
    function update() {
      var m = metrics(); if (!m) return;
      c.classList.toggle('fits', m.pages <= 1);
      var idx = Math.min(m.pages - 1, Math.round(track.scrollLeft / m.w));
      count.textContent = (idx + 1) + ' / ' + m.pages;
      prev.disabled = idx <= 0; next.disabled = idx >= m.pages - 1;
      if (dots.children.length !== m.pages) { dots.innerHTML = ''; for (var i = 0; i < m.pages && m.pages <= 14; i++) dots.appendChild(el('i')); }
      Array.prototype.forEach.call(dots.children, function (d, i) { d.classList.toggle('on', i === idx); });
    }
    function go(d) { var m = metrics(); if (m) track.scrollBy({ left: d * m.w, behavior: reduceMotion ? 'auto' : 'smooth' }); }
    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });
    var t; track.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(update, 60); }, { passive: true });
    window.addEventListener('resize', update);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(update);
    update();
    c._update = update;
  }
  function initCarousels(root) { $$('.carousel', root).forEach(initCarousel); }

  /* ---------- 장면 슬라이드 데이터 ---------- */
  var YS = 'assets/frames/yishuangshou/', GC = 'assets/frames/guancheng/', CX = 'assets/frames/chixie/';
  var CAP_YS = '출처: 红果短剧 / 一双手闯出一片天, YouTube 합본 화면';
  var SCENES = {
    ysTimeline: { dir: YS, credit: CAP_YS, list: [
      ['ys_00m03s', '0:03 배경', 'k-bg', '국영 기계공장, 위험한 작업을 막는 손', ''],
      ['ys_00m15s', '0:15 억압', 'k-oppress', '스승 “톄주가 쓸 수 없다고 했어” 그러나 무시된다', '铁柱说不能用'],
      ['ys_00m35s', '0:35 사고', 'k-oppress', '크레인 와이어가 끊어진다', ''],
      ['ys_00m50s', '0:50 억압', 'k-oppress', '아내가 남편이 아닌 친구의 다리를 먼저 돌본다', ''],
      ['ys_01m10s', '1:10 억압', 'k-oppress', '“즈창 먼저 보내” 주인공은 뒤로 밀린다', '先送志强'],
      ['ys_01m30s', '1:30 전환', 'k-turn', '죽음 직후 15년 전으로 회귀', '十五年前'],
      ['ys_02m00s', '2:00 전환', 'k-turn', '약혼 자리, 진급 추천을 양보하라는 요구가 되풀이된다', '你已经是高级钳工了'],
      ['ys_02m30s', '2:30 반격', 'k-strike', '“선반공만 십수 년” 이번에는 양보를 거부한다', '我干了十几年钳工']
    ] },
    ysSpaceMore: { dir: YS, credit: CAP_YS, list: [
      ['ys_05m00s', '5:00 가정', 'k-bg', '아내와 친구 사이의 갈등이 되풀이되는 식탁', '我只是问他一句要不要'],
      ['ys_10m00s', '10:00 국영 공장', 'k-bg', '상사, 동료와 얽힌 조직 생활', ''],
      ['ys_20m00s', '20:00 공장 문 앞', 'k-turn', '조직을 떠나는 장면', ''],
      ['ys_40m00s', '40:00 수리점', 'k-strike', '자기 손으로 부품을 만드는 공간', '这边48件'],
      ['ys_1h20m00s', '1:20:00 도면 검토', 'k-strike', '기술과 품질을 다투는 장면', '那更得查清是哪一版']
    ] },
    gcFrames: { dir: GC, wide: true, credit: '출처: 红果短剧 / 莞城往事, YouTube 합본 화면', list: [
      ['gc_00m03s', '0:03 출발', 'k-bg', '2005년 둥관 기차역, 맨몸으로 도착한 천환', ''],
      ['gc_00m10s', '0:10 억압', 'k-oppress', '“여자친구에게 돈을 다 뜯김” 자막으로 출발', ''],
      ['gc_01m00s', '1:00 귀인', 'k-turn', '셋방 집주인 자오훙메이 등장', ''],
      ['gc_03m00s', '3:00 억압', 'k-oppress', '“내겐 85위안뿐”', ''],
      ['gc_03m12s', '3:12 억압', 'k-oppress', '고향 사람마저 “방세 빌려줄 순 없지” 외면', ''],
      ['gc_05m10s', '5:10 전환', 'k-turn', '집주인의 시험 “지금 세탁기 고쳐 봐”', ''],
      ['gc_05m22s', '5:22 반격', 'k-strike', '세탁기를 고치며 기술로 인정받기 시작', '']
    ] },
    cxFrames: { dir: CX, credit: '출처: 红果短剧 / 持械入宋, YouTube 합본 화면', list: [
      ['cx_00m01s', '0:01 사고', 'k-oppress', '장갑차가 절벽으로 추락하며 시작', ''],
      ['cx_01m30s', '1:30 전환', 'k-turn', '낯선 산속, 송나라로 시간이동', ''],
      ['cx_08m00s', '8:00 볼거리', 'k-bg', '표범 습격, 화면에 “AI制作，无真实动物受伤” 표기', ''],
      ['cx_12m00s', '12:00 억압', 'k-oppress', '약탈자 기병이 마을을 습격', ''],
      ['cx_13m00s', '13:00 반격', 'k-strike', '현대 화기로 반격', '']
    ] }
  };
  function sceneSlides(id) {
    var cfg = SCENES[id], box = document.getElementById(id);
    if (!cfg || !box) return;
    cfg.list.forEach(function (s) {
      var cap = s[1] + ', ' + s[3] + '. ' + cfg.credit;
      box.appendChild(el('figure', { class: 'slide-scene ' + s[2] + (cfg.wide ? ' wide' : '') },
        '<div class="img"><img src="' + cfg.dir + s[0] + '.jpg" alt="' + esc(s[3]) + '" loading="lazy" data-zoom data-cap="' + esc(cap) + '"></div>' +
        '<figcaption><span class="tag">' + esc(s[1]) + '</span><br>' + zh(s[3]) + (s[4] ? '<span class="q">' + esc(s[4]) + '</span>' : '') + '</figcaption>'));
    });
  }
  Object.keys(SCENES).forEach(sceneSlides);

  /* ---------- 1,000칸 점 그림 (히트율) ---------- */
  $$('.waffle').forEach(function (w) {
    var n = +w.getAttribute('data-total') || 1000, hit = +w.getAttribute('data-hit') || 0, html = '';
    for (var i = 0; i < n; i++) html += i < hit ? '<i class="hit"></i>' : '<i></i>';
    w.innerHTML = html;
  });

  /* ---------- 얼굴 비교: 합성 이미지에서 얼굴 칸만 잘라 보이기 ---------- */
  var FACE_IMG = { w: 1528, h: 1026, tile: 191 };
  var FACE_COL = [20, 236, 452, 668, 884, 1100, 1316], FACE_ROW = [108, 410, 712];
  var FACES = [
    [0, 0, '왕톄주', '기준작 장면', 'base'], [0, 1, '왕톄주', '기준작 포스터', 'base'], [0, 2, '마즈창', '기준작 장면', 'base'],
    [0, 3, '천환', '莞城往事 장면', 'cmp'], [0, 4, '특수부대원', '持械入宋 장면', 'cmp'], [0, 5, '남자 주인공', '退役归来', ''], [0, 6, '남자 주인공', '龙主归来', ''],
    [1, 0, '남자 주인공', '猎王的养家路', ''], [1, 1, '남자 주인공', '装穷提亲', ''], [1, 2, '남자 주인공', '妹妹心疼我穷', ''],
    [1, 3, '남자 주인공', '黄昏之恋', ''], [1, 4, '남자 주인공', '总裁是我前女友', ''], [1, 5, '남자 주인공', '满院亲戚全是上古大妖', ''],
    [2, 0, '쉬시우쥐안', '기준작 장면', 'base'], [2, 1, '자오훙메이', '莞城往事 장면', 'cmp'], [2, 2, '여자 주인공', '退役归来', ''],
    [2, 3, '여자 주인공', '装穷提亲', ''], [2, 4, '여자 주인공', '妹妹心疼我穷', ''], [2, 5, '여자 주인공', '总裁是我前女友', ''], [2, 6, '여자 주인공', '顾家四千金', '']
  ];
  $$('[data-faces]').forEach(function (box) {
    var which = box.getAttribute('data-faces'); // male | female
    FACES.filter(function (f) { return which === 'female' ? f[0] === 2 : f[0] !== 2; }).forEach(function (f) {
      var x = FACE_COL[f[1]], y = FACE_ROW[f[0]], t = FACE_IMG.tile;
      var style = '--bs:' + (FACE_IMG.w / t * 100).toFixed(2) + '%;--bx:' + (x / (FACE_IMG.w - t) * 100).toFixed(3) + '%;--by:' + (y / (FACE_IMG.h - t) * 100).toFixed(3) + '%';
      box.appendChild(el('figure', null,
        '<div class="face ' + f[4] + '" style="' + style + '" role="img" aria-label="' + esc(f[2] + ', ' + f[3]) + '" data-zoomsrc="assets/visuals/03_ai_face_comparison.jpg" data-cap="자료 3. AI 실사풍 인물 얼굴 비교. 출처: 红果短剧 / 각 작품 장면과 포스터, 팀 제작"></div>' +
        '<figcaption><b>' + esc(f[2]) + '</b><span class="zh">' + zh(f[3]) + '</span></figcaption>'));
    });
  });

  /* ---------- 모바일에서 표를 카드로: 머리글을 각 칸에 붙여 둔다 ---------- */
  $$('table.stack').forEach(function (t) {
    var heads = $$('thead th', t).map(function (th) { return th.textContent.trim(); });
    $$('tbody tr', t).forEach(function (tr) {
      var cells = Array.prototype.slice.call(tr.children);
      cells.forEach(function (td, i) { if (td.tagName === 'TD' && heads[i]) td.setAttribute('data-label', heads[i]); });
    });
  });

  /* ---------- 차트 공통 ---------- */
  var SVGNS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs, text) { var n = document.createElementNS(SVGNS, tag); Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); }); if (text != null) n.textContent = text; return n; }
  function tooltipFor(box) {
    var t = el('div', { class: 'tooltip', role: 'status' }); box.appendChild(t);
    return {
      show: function (html, x, y) { t.innerHTML = html; t.classList.add('show'); var bw = box.clientWidth, tw = t.offsetWidth, th = t.offsetHeight; t.style.left = Math.min(Math.max(8, x + 14), bw - tw - 8) + 'px'; var top = y - th - 12; t.style.top = (top < -10 ? y + 18 : top) + 'px'; },
      hide: function () { t.classList.remove('show'); }
    };
  }
  function bindHover(g, box, tip, html) {
    function pos(e) { var r = box.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    g.addEventListener('pointermove', function (e) { var p = pos(e); tip.show(html, p[0], p[1]); });
    g.addEventListener('pointerdown', function (e) { var p = pos(e); tip.show(html, p[0], p[1]); });
    g.addEventListener('pointerleave', function () { tip.hide(); });
    g.addEventListener('focus', function () { var r = g.getBoundingClientRect(), b = box.getBoundingClientRect(); g.classList.add('focus'); tip.show(html, r.left - b.left + r.width / 2, r.top - b.top + 10); });
    g.addEventListener('blur', function () { g.classList.remove('focus'); tip.hide(); });
  }
  function legend(box, items) { if (box) box.innerHTML = items.map(function (it) { return '<span class="sw">' + it[0] + esc(it[1]) + '</span>'; }).join(''); }
  var swLineAI = '<svg viewBox="0 0 22 12" aria-hidden="true"><line x1="1" y1="6" x2="15" y2="6" stroke="var(--ai)" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="6" r="4.5" fill="var(--ai)"/></svg>';
  var swLineReal = '<svg viewBox="0 0 22 12" aria-hidden="true"><line x1="1" y1="6" x2="15" y2="6" stroke="var(--real)" stroke-width="2" stroke-dasharray="4 3" stroke-linecap="round"/><circle cx="16" cy="6" r="4.5" fill="var(--real)"/></svg>';
  var swHollow = '<svg viewBox="0 0 22 12" aria-hidden="true"><circle cx="11" cy="6" r="4" fill="var(--surface)" stroke="var(--ink-2)" stroke-width="2"/></svg>';
  var swFilled = '<svg viewBox="0 0 22 12" aria-hidden="true"><circle cx="11" cy="6" r="4.5" fill="var(--ink-2)"/></svg>';
  var swDot = function (c) { return '<svg viewBox="0 0 22 12" aria-hidden="true"><circle cx="11" cy="6" r="4.5" fill="var(' + c + ')"/></svg>'; };
  var swTick = '<svg viewBox="0 0 22 12" aria-hidden="true"><line x1="11" y1="0" x2="11" y2="12" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round"/></svg>';

  // 비교 기록표와 툴팁에 쓰는 표시용 문장 (comparison.json 값을 괄호 없이 풀어 쓴 것)
  var T = {
    yishuangshou: { conflict: '약 18초', conflictN: '0:04 미래 장면 예고 뒤 0:18 “이 밧줄은 못 써”', rev: '누적 약 2분 30초', revN: '2화 “이제야 내 차례야”, 1화 끝 1:49에 회귀', cnt: '3회', cntN: '회귀, 추천 자리 양보 거부, 파혼 선언', hooksN: '5화 마지막 대사 “这个婚到此为止”', opp: '아내, 친구', oppN: '회귀 뒤에는 약혼녀', dev: '회귀 重生', devN: '', rew: '기술 인정, 창업', rewN: '', face: '상', faceN: '매끈한 미남미녀형, 같은 인물도 장면마다 얼굴이 바뀜', hard: '1개', hardN: '크레인 낙하 사고' },
    guancheng: { conflict: '약 5초', conflictN: '내레이션 “여자친구에게 돈을 뜯김”', rev: '누적 약 4분', revN: '2화 0:53 무렵, 세탁기 수리로 실력 인정', cnt: '2회', cntN: '세탁기 수리, 공장 회로 진단', hooksN: '2화 끝은 귀인과의 만남', opp: '여자친구, 고향 사람, 직장 상사', oppN: '', dev: '없음', devN: '기술과 귀인인 집주인이 전환점', rew: '기술 인정, 창업, 사랑', rewN: '', face: '중상', faceN: '주인공은 개성 있는 장발, 조연 얼굴이 장면마다 흔들림', hard: '1~2개', hardN: '2005년 기차역 군중' },
    xiaozhen: { conflict: '약 56초', conflictN: '느린 도입 뒤 아내의 외도 암시', rev: '없음', revN: '1~5화, 누적 약 11분 동안 반격이 없음', cnt: '0회', cntN: '억압이 쌓이는 단계', hooksN: '', opp: '아내', oppN: '외도와 거짓말', dev: '없음', devN: '현실극', rew: '성실한 재기', rewN: '5화까지는 아직 오지 않음', face: '하', faceN: '실제 배우, 평범한 생활형 외모', hard: '0개', hardN: '' },
    chixie: { conflict: '0초', conflictN: '장갑차 절벽 추락으로 시작', rev: '누적 약 8분 30초', revN: '5화 무렵, 맹수 제압', cnt: '1회', cntN: '맹수 제압', hooksN: '', opp: '외부의 적', oppN: '맹수와 약탈자', dev: '시간여행과 현대 무기', devN: '', rew: '무력, 기술 우위', rewN: '', face: '상', faceN: '대원들의 이목구비가 서로 비슷한 미남형', hard: '4개 이상', hardN: '장갑차 추락, 시간이동, 맹수, 활 공격' }
  };

  /* 차트 1: 첫 갈등에서 첫 반격까지 */
  function drawReversal() {
    var box = $('#chartReversal'); if (!box) return;
    box.innerHTML = '';
    var tip = tooltipFor(box);
    var order = ['yishuangshou', 'guancheng', 'chixie', 'xiaozhen'];
    var W = Math.max(280, box.clientWidth), rowH = 64, top = 4, axisH = 30, H = top + order.length * rowH + axisH, padL = 6, padR = 18, max = 720;
    var x = function (sec) { return padL + (sec / max) * (W - padL - padR); };
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'list' });
    for (var m = 0; m <= 12; m += 2) {
      var gx = x(m * 60);
      svg.appendChild(s('line', { class: 'gridline', x1: gx, x2: gx, y1: top + 26, y2: H - axisH + 4 }));
      if (W >= 520 || m % 4 === 0) svg.appendChild(s('text', { class: 'axis', x: gx, y: H - 8, 'text-anchor': m === 0 ? 'start' : (m === 12 ? 'end' : 'middle') }, m + '분'));
    }
    order.forEach(function (id, i) {
      var w = byId[id]; if (!w) return;
      var y0 = top + i * rowH, ty = y0 + 44, isAI = w.production === 'AI', col = isAI ? 'var(--ai)' : 'var(--real)';
      var g = s('g', { class: 'row', tabindex: '0', role: 'listitem' });
      g.appendChild(s('rect', { class: 'row-hover', x: 0, y: y0 + 2, width: W, height: rowH - 4, rx: 10 }));
      var lab = s('text', { class: 'zh', x: padL, y: y0 + 22 }, SHORT[id]); g.appendChild(lab);
      var x1 = x(w.first_conflict_sec), endSec = w.first_reversal_sec != null ? w.first_reversal_sec : w.observed_until_sec, x2 = x(endSec);
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
      var t = T[id];
      var html = '<b class="zh">' + esc(w.title) + '</b> ' + (isAI ? 'AI' : '실사') +
        '<span class="m">첫 갈등 ' + mmss(w.first_conflict_sec) + ', ' + zh(t.conflictN) + '</span>' +
        '<span class="m">첫 반격 ' + (w.first_reversal_sec != null ? mmss(w.first_reversal_sec) : '없음') + ', ' + zh(t.revN) + '</span>';
      g.setAttribute('aria-label', w.title + ', ' + (isAI ? 'AI' : '실사') + ', 첫 갈등 ' + mmss(w.first_conflict_sec) + ', 첫 반격 ' + (w.first_reversal_sec != null ? mmss(w.first_reversal_sec) : mmss(endSec) + '까지 없음'));
      bindHover(g, box, tip, html);
      svg.appendChild(g);
      requestAnimationFrame(function () { var bb = 90; try { bb = lab.getBBox().width; } catch (e) {} g.insertBefore(s('text', { class: 'axis', x: padL + bb + 8, y: y0 + 22 }, isAI ? 'AI' : '실사'), g.querySelector('.hit')); });
    });
    box.insertBefore(svg, box.firstChild);
  }
  legend($('#legendReversal'), [[swLineAI, 'AI 작품'], [swLineReal, '실사 작품, 점선은 관찰한 범위 안에 반격 없음'], [swHollow, '첫 갈등'], [swFilled, '첫 반격']]);

  /* 차트 2: 1~5화 회차 길이 */
  function drawLength() {
    var box = $('#chartLength'); if (!box) return;
    box.innerHTML = '';
    var tip = tooltipFor(box);
    var order = ['yishuangshou', 'guancheng', 'chixie', 'xiaozhen', 'tainainai'];
    var W = Math.max(280, box.clientWidth), rowH = 58, top = 4, axisH = 30, H = top + order.length * rowH + axisH, padL = 10, padR = 14, max = 200;
    var x = function (sec) { return padL + (sec / max) * (W - padL - padR); };
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H });
    [0, 60, 120, 180].forEach(function (t) {
      var gx = x(t);
      svg.appendChild(s('line', { class: 'gridline', x1: gx, x2: gx, y1: top + 26, y2: H - axisH + 4 }));
      svg.appendChild(s('text', { class: 'axis', x: gx, y: H - 8, 'text-anchor': t === 0 ? 'start' : 'middle' }, t === 0 ? '0초' : (t / 60) + '분'));
    });
    order.forEach(function (id, i) {
      var w = byId[id]; if (!w) return;
      var y0 = top + i * rowH, ty = y0 + 42, isAI = w.production === 'AI', col = isAI ? 'var(--ai)' : 'var(--real)';
      var g = s('g', { class: 'row' });
      g.appendChild(s('rect', { class: 'row-hover', x: 0, y: y0 + 2, width: W, height: rowH - 4, rx: 10 }));
      g.appendChild(s('text', { class: 'zh', x: padL, y: y0 + 21 }, SHORT[id]));
      g.appendChild(s('text', { class: 'val', x: W - padR, y: y0 + 21, 'text-anchor': 'end' }, '평균 ' + Math.round(w.ep_len_avg_sec) + '초'));
      var lens = w.ep_len_sec_ep1_5, mn = Math.min.apply(null, lens), mx = Math.max.apply(null, lens);
      g.appendChild(s('line', { x1: x(mn), x2: x(mx), y1: ty, y2: ty, stroke: 'var(--line-strong)', 'stroke-width': 2, 'stroke-linecap': 'round' }));
      var ax = x(w.ep_len_avg_sec);
      g.appendChild(s('line', { x1: ax, x2: ax, y1: ty - 11, y2: ty + 11, stroke: 'var(--ink)', 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
      svg.appendChild(g);
      lens.forEach(function (len, k) {
        var dg = s('g', { tabindex: '0', class: 'row', 'aria-label': w.title + ' ' + (k + 1) + '화 ' + Math.round(len) + '초' });
        dg.appendChild(s('circle', { cx: x(len), cy: ty, r: 5.5, fill: col, stroke: 'var(--surface)', 'stroke-width': 2 }));
        dg.appendChild(s('circle', { class: 'hit', cx: x(len), cy: ty, r: 12 }));
        bindHover(dg, box, tip, '<b class="zh">' + esc(SHORT[id]) + '</b> ' + (k + 1) + '화<span class="m">' + Math.round(len) + '초, ' + mmss(len) + '</span>');
        svg.appendChild(dg);
      });
    });
    box.appendChild(svg);
  }
  legend($('#legendLength'), [[swDot('--ai'), 'AI 작품의 한 회차'], [swDot('--real'), '실사 작품의 한 회차'], [swTick, '1~5화 평균']]);

  function drawCharts() { drawReversal(); drawLength(); }
  drawCharts();
  var lastW = 0, rT;
  window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { var w = ($('#chartReversal') || {}).clientWidth; if (w && w !== lastW) { lastW = w; drawCharts(); } }, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawCharts);

  /* 차트 3: 회차 끝 갈고리 */
  var hooksBox = $('#hooks');
  if (hooksBox) ['yishuangshou', 'guancheng', 'chixie', 'xiaozhen'].forEach(function (id) {
    var w = byId[id]; if (!w) return;
    var chips = w.ending_hooks_ep1_5.map(function (h, k) {
      var label = h.replace(/\(.*\)/, '');
      var cls = (label === '대결' || label === '위기') ? 'strong' : (label === '여운' ? 'soft' : '');
      return '<div class="chip ' + cls + '"><span class="ep">' + (k + 1) + '화</span>' + esc(label) + '</div>';
    }).join('');
    hooksBox.appendChild(el('div', { class: 'row' }, '<div class="name">' + esc(SHORT[id]) + '<span class="badge ' + (w.production === 'AI' ? 'ai' : 'real') + '">' + (w.production === 'AI' ? 'AI' : '실사') + '</span></div><div class="chips">' + chips + '</div>'));
  });

  /* ---------- 비교 기록표: 넓은 화면은 표, 모바일은 항목별 카드 ---------- */
  var tbl = $('#compareTable'), cards = $('#compareCards');
  if (tbl || cards) {
    var cols = ['yishuangshou', 'guancheng', 'xiaozhen', 'chixie'].filter(function (id) { return byId[id]; });
    var sub = function (t) { return t ? '<span class="sub">' + zh(t) + '</span>' : ''; };
    var ROWS = [
      ['1화 첫 갈등까지', '', function (id) { return zh(T[id].conflict) + sub(T[id].conflictN); }],
      ['첫 반격까지', '', function (id) { return zh(T[id].rev) + sub(T[id].revN); }],
      ['1~5화 반전 횟수', '관찰', function (id) { return zh(T[id].cnt) + sub(T[id].cntN); }],
      ['회차 끝 갈고리 钩子', '관찰', function (id) { return esc(byId[id].ending_hooks_ep1_5.map(function (h) { return h.replace(/\(.*\)/, ''); }).join(' / ')) + sub(T[id].hooksN); }],
      ['억압의 가해자', '', function (id) { return zh(T[id].opp) + sub(T[id].oppN); }],
      ['전환 장치', '', function (id) { return zh(T[id].dev) + sub(T[id].devN); }],
      ['보상의 종류', '', function (id) { return zh(T[id].rew) + sub(T[id].rewN); }],
      ['한 화 길이, 1~5화', '', function (id) { var w = byId[id]; return w.ep_len_sec_ep1_5.map(function (v) { return Math.round(v); }).join(', ') + '초' + sub('평균 ' + Math.round(w.ep_len_avg_sec) + '초'); }],
      ['얼굴 유사도', '관찰', function (id) { return '<b>' + esc(T[id].face) + '</b>' + sub(T[id].faceN); }],
      ['실사로 찍기 어려운 장면', '관찰', function (id) { return esc(T[id].hard) + sub(T[id].hardN); }]
    ];
    var badge = function (b) { return b ? ' <span class="badge obs">' + b + '</span>' : ''; };
    if (tbl) {
      tbl.innerHTML = '<caption style="position:absolute;left:-9999px">작품 비교 기록표, 1~5화, 红果 공식 플레이어, 2026.11.9</caption><thead><tr><th>항목</th>' + cols.map(function (id) {
        var isAI = byId[id].production === 'AI';
        return '<th' + (id === 'yishuangshou' ? ' class="base"' : '') + '><span class="zh">' + esc(SHORT[id]) + '</span> <span class="badge ' + (isAI ? 'ai' : 'real') + '">' + (isAI ? 'AI' : '실사') + (id === 'yishuangshou' ? ' 기준' : '') + '</span></th>';
      }).join('') + '</tr></thead><tbody>' + ROWS.map(function (r) {
        return '<tr><th>' + zh(r[0]) + badge(r[1]) + '</th>' + cols.map(function (id) { return '<td' + (id === 'yishuangshou' ? ' class="base"' : '') + '>' + r[2](id) + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody>';
    }
    if (cards) {
      cards.innerHTML = ROWS.map(function (r) {
        return '<div class="cmp-card"><h4>' + zh(r[0]) + badge(r[1]) + '</h4><dl>' + cols.map(function (id) {
          var isAI = byId[id].production === 'AI';
          return '<dt class="' + (isAI ? '' : 'real') + '">' + esc(SHORT[id]) + (id === 'yishuangshou' ? ' <span class="badge base">기준</span>' : '') + '</dt><dd>' + r[2](id) + '</dd>';
        }).join('') + '</dl></div>';
      }).join('');
    }
  }

  /* ---------- 상영관 ---------- */
  var YT = '3F80jCzxyj4';
  var CL = 'assets/clips/';
  var theater = {
    yishuangshou: {
      tab: '<span class="zh">一双手</span> 영상',
      credit: '출처: 红果短剧 / 一双手闯出一片天. 영상: YouTube 합본, KK爱看에서 해당 구간만 잘라 실음',
      items: [
        { type: 'local', src: 'assets/video/yishuangshou_ep1_intro_30s.mp4', thumb: YS + 'ys_00m03s.jpg', t: '0:00–0:30', title: '1화 도입부 30초', desc: '끊어지기 직전의 와이어, 이름 자막, 하단 AI 표기' },
        { type: 'local', src: CL + 'ys_accident.mp4', thumb: YS + 'ys_00m50s.jpg', t: '0:30–1:25', title: '사고와 외면', desc: '와이어가 끊어지고, 아내는 남편보다 친구를 먼저 돌본다' },
        { type: 'local', src: CL + 'ys_return.mp4', thumb: YS + 'ys_01m30s.jpg', t: '1:25–1:52', title: '회귀 “十五年前”', desc: '죽음 직후 15년 전 약혼 자리로 돌아간다' },
        { type: 'local', src: CL + 'ys_refuse.mp4', thumb: YS + 'ys_02m30s.jpg', t: '1:55–2:50', title: '첫 반격, 양보 거부', desc: '“지금 내게 가장 필요한 건 기회야”' },
        { type: 'local', src: CL + 'ys_leave.mp4', thumb: YS + 'ys_20m00s.jpg', t: '19:45–20:45', title: '공장을 떠나다', desc: '조직을 떠나는 공장 문 앞' },
        { type: 'local', src: CL + 'ys_shop.mp4', thumb: YS + 'ys_40m00s.jpg', t: '39:50–40:50', title: '수리점의 왕톄주', desc: '자기 손으로 부품을 만드는 공간' },
        { type: 'local', src: CL + 'ys_drawing.mp4', thumb: YS + 'ys_1h20m00s.jpg', t: '1:19:50–1:20:50', title: '도면 검토', desc: '기술과 품질을 다투는 장면' }
      ]
    },
    guancheng: {
      tab: '<span class="zh">莞城往事</span> 장면',
      slideshow: 'gcFrames',
      note: '분석에 쓴 YouTube 합본이 내려가 영상 대신 팀이 기록한 장면 캡처로 보여 줍니다. 시간은 YouTube 합본 기준입니다.',
      url: 'https://hongguoduanju.com/detail?series_id=7698351941423729689'
    },
    chixie: {
      tab: '<span class="zh">持械入宋</span> 영상',
      credit: '출처: 红果短剧 / 持械入宋. 영상: YouTube 합본, KK爱看과 Nano Review에서 해당 구간만 잘라 실음',
      items: [
        { type: 'local', wide: true, src: CL + 'cx_intro.mp4', thumb: CX + 'cx_00m01s.jpg', t: '0:00–0:40', title: '도입, 장갑차 추락 직후', desc: '첫 장면부터 생존 위기' },
        { type: 'local', wide: true, src: CL + 'cx_beast.mp4', thumb: CX + 'cx_08m00s.jpg', t: '7:15–8:00', title: '첫 반격, 맹수 제압', desc: '실사로는 부담이 큰 맹수와의 싸움' },
        { type: 'local', wide: true, src: CL + 'cx_guns.mp4', thumb: CX + 'cx_13m00s.jpg', t: '11:25–12:15', title: '현대 화기로 반격', desc: '마을을 덮친 약탈자를 현대 무기로 압도한다' }
      ],
      note: '영상 클립은 장면 캡처와 다른 업로드라 재생 시간이 캡처의 시간과 다릅니다.',
      url: 'https://hongguoduanju.com/detail?series_id=7671966197985856536'
    },
    real: { tab: '실사 2편', real: true }
  };
  var tabsBox = $('#theaterTabs'), stage = $('#stage'), plWrap = $('#playlistWrap');

  function ytSrc(vid, s0, e0) { return 'https://www.youtube-nocookie.com/embed/' + vid + '?start=' + s0 + '&end=' + e0 + '&autoplay=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3'; }
  function playClip(it, autoplay, cfg) {
    var phone = el('div', { class: 'phone' + (it.wide ? ' wide' : '') });
    var scr = el('div', { class: 'screen' }); phone.appendChild(scr);
    var timeTxt = it.type === 'yt' ? mmss(it.start) + '–' + mmss(it.end) : it.t;
    if (it.type === 'local') {
      scr.innerHTML = '<video class="clip-video" src="' + it.src + '" poster="' + it.thumb + '" muted playsinline controls preload="metadata"' + (autoplay ? ' autoplay' : '') + '></video>';
    } else {
      var f = el('button', { class: 'facade', type: 'button', 'aria-label': it.title + ' 재생' }, '<img src="' + it.thumb + '" alt=""><span class="play">' + ICO.play + '</span><span class="fl">' + zh(it.title) + '<br>' + timeTxt + '</span>');
      f.addEventListener('click', function () { scr.innerHTML = '<iframe src="' + ytSrc(it.vid, it.start, it.end) + '" title="' + esc(it.title) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>'; });
      scr.appendChild(f);
    }
    var cap = el('div', { class: 'stage-cap' }, '<b>' + zh(it.title) + '</b> ' + timeTxt + '<br>' + zh(it.desc) +
      '<span class="cr">' + zh(cfg.credit) + (it.type === 'yt' ? '<br><a href="https://www.youtube.com/watch?v=' + it.vid + '&t=' + it.start + 's" target="_blank" rel="noopener">YouTube에서 열기 ↗</a>' : '') + '</span>');
    stage.innerHTML = ''; stage.appendChild(phone); stage.appendChild(cap);
  }
  function openTab(key) {
    $$('.tab', tabsBox).forEach(function (t) { t.setAttribute('aria-selected', t.getAttribute('data-key') === key ? 'true' : 'false'); });
    var cfg = theater[key];
    plWrap.innerHTML = '';
    if (cfg.real) {
      stage.innerHTML = '<div class="real-box"><span class="badge real">실사</span><h3 class="sub" style="margin-top:12px">실사 작품은 포스터와 기록으로</h3><p class="small">두 실사 작품은 장면 캡처와 영상 클립 없이, 공식 포스터와 비교 기록표의 관찰 결과로 비교합니다.</p></div>';
      plWrap.innerHTML = [byId.xiaozhen, byId.tainainai].filter(Boolean).map(function (w) {
        var m = w.metrics_2026_11_09;
        return '<div class="card real-card"><img class="real-poster" src="assets/posters/' + w.id + '.jpg" alt="' + esc(w.title) + ' 공식 포스터" loading="lazy" data-zoom data-cap="' + esc('출처: 红果短剧 / ' + w.title + ' 공식 포스터') + '"><div><span class="k">' + esc(w.role) + '</span><h3 class="zh">' + esc(w.title) + '</h3><p>' + zh(w.premise) + '</p>' +
          '<ul class="chips">' + (m.rank ? '<li>' + zh(m.rank) + '</li>' : '') + (m.heat ? '<li>열도 <b>' + esc(m.heat) + '</b></li>' : '') + '<li>평점 <b>' + m.rating + '</b></li></ul>' +
          '<span class="src-line">2026.11.9 조회</span><a href="' + w.url + '" target="_blank" rel="noopener">红果에서 보기 ↗</a></div></div>';
      }).join('');
      return;
    }
    if (cfg.slideshow) {
      var sc = SCENES[cfg.slideshow];
      var ss = el('div', { class: 'slideshow', 'data-auto': '3200' });
      ss.innerHTML = sc.list.map(function (f, i) { return '<img src="' + sc.dir + f[0] + '.jpg" alt="' + esc(f[3]) + '"' + (i === 0 ? ' class="on"' : '') + ' data-t="' + esc(f[1]) + '" data-d="' + esc(f[3]) + '">'; }).join('') +
        '<span class="ss-badge">장면 캡처 자동 넘김</span><div class="ss-cap"></div>' +
        '<button class="ss-nav prev" type="button" aria-label="이전 장면">' + ICO.l + '</button><button class="ss-nav next" type="button" aria-label="다음 장면">' + ICO.r + '</button>';
      stage.innerHTML = ''; stage.appendChild(ss);
      stage.appendChild(el('div', { class: 'stage-cap' }, '<span class="cr">' + zh(sc.credit) + '</span>'));
      initSlideshow(ss);
      plWrap.innerHTML = '<p class="theater-note">' + zh(cfg.note) + ' <a href="' + cfg.url + '" target="_blank" rel="noopener">红果에서 보기 ↗</a></p>';
      return;
    }
    var ul = el('ul', { class: 'playlist' });
    cfg.items.forEach(function (it, i) {
      var li = el('li');
      var b = el('button', { type: 'button', 'aria-current': i === 0 ? 'true' : 'false' },
        '<span class="th"><img src="' + it.thumb + '" alt="" loading="lazy"></span><span><span class="tt">' + zh(it.title) + '</span><span class="dd">' + zh(it.desc) + '</span></span><span class="tm">' + (it.type === 'yt' ? mmss(it.start) + '–' + mmss(it.end) : it.t) + '</span>');
      b.addEventListener('click', function () {
        $$('button', ul).forEach(function (x) { x.setAttribute('aria-current', 'false'); });
        b.setAttribute('aria-current', 'true'); playClip(it, true, cfg);
        if (window.innerWidth < 800) stage.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      });
      li.appendChild(b); ul.appendChild(li);
    });
    plWrap.appendChild(ul);
    plWrap.appendChild(el('p', { class: 'theater-note' }, '시간은 YouTube 합본 기준입니다. 분석에 필요한 구간만 짧게 잘라 사이트에 직접 실었습니다. ' + (cfg.note ? zh(cfg.note) : '')));
    playClip(cfg.items[0], false, cfg);
  }
  if (tabsBox) {
    Object.keys(theater).forEach(function (k, i) {
      var t = el('button', { class: 'tab', role: 'tab', type: 'button', 'data-key': k, 'aria-selected': i === 0 ? 'true' : 'false' }, theater[k].tab);
      t.addEventListener('click', function () { openTab(k); });
      tabsBox.appendChild(t);
    });
    openTab('yishuangshou');
  }

  /* ---------- 자동으로 넘어가는 장면 스틸 ---------- */
  function initSlideshow(ss) {
    var imgs = $$('img', ss), cap = $('.ss-cap', ss), i = 0, timer;
    function show(k) {
      i = (k + imgs.length) % imgs.length;
      imgs.forEach(function (im, j) { im.classList.toggle('on', j === i); });
      cap.innerHTML = '<b>' + esc(imgs[i].getAttribute('data-t')) + '</b>' + zh(imgs[i].getAttribute('data-d'));
    }
    function play() { clearInterval(timer); if (!reduceMotion) timer = setInterval(function () { show(i + 1); }, +ss.getAttribute('data-auto') || 3200); }
    $('.prev', ss).addEventListener('click', function () { show(i - 1); play(); });
    $('.next', ss).addEventListener('click', function () { show(i + 1); play(); });
    show(0); play();
  }
  $$('.slideshow[data-auto]').forEach(function (ss) { if (!ss.closest('#stage')) initSlideshow(ss); });

  /* ---------- 홈: 1분 소개 영상 ---------- */
  var intro = $('#introVideo'), soundBtn = $('#soundBtn');
  if (intro) {
    if (!reduceMotion) { var p = intro.play(); if (p && p.catch) p.catch(function () {}); }
    if (soundBtn) soundBtn.addEventListener('click', function () {
      intro.muted = false; intro.loop = false; intro.currentTime = 0;
      var q = intro.play(); if (q && q.catch) q.catch(function () {});
      soundBtn.hidden = true;
    });
    intro.addEventListener('volumechange', function () { if (soundBtn && !intro.muted) soundBtn.hidden = true; });
    var onFs = function () {
      var fsEl = document.fullscreenElement || document.webkitFullscreenElement, o = screen.orientation;
      if (!o) return;
      if (fsEl === intro && o.lock) { var r = o.lock('portrait'); if (r && r.catch) r.catch(function () {}); }
      else if (!fsEl && o.unlock) { try { o.unlock(); } catch (e) {} }
    };
    document.addEventListener('fullscreenchange', onFs);
    document.addEventListener('webkitfullscreenchange', onFs);
    var fsBtn = $('#fsBtn');
    if (fsBtn) fsBtn.addEventListener('click', function () {
      var go = function () { var q = intro.play(); if (q && q.catch) q.catch(function () {}); };
      if (intro.requestFullscreen) { var r = intro.requestFullscreen(); if (r && r.then) r.then(go, function () {}); else go(); }
      else if (intro.webkitRequestFullscreen) { intro.webkitRequestFullscreen(); go(); }
      else if (intro.webkitEnterFullscreen) { intro.webkitEnterFullscreen(); go(); }
    });
  }

  /* ---------- 반전 장면: 해당 구간만 재생 ---------- */
  $$('.clips').forEach(function (box) {
    var player = $('.clip-player', box);
    $$('.clip-btn', box).forEach(function (b) {
      var s0 = +b.getAttribute('data-s'), e0 = +b.getAttribute('data-e'), vid = b.getAttribute('data-vid'), title = b.getAttribute('data-t'), work = b.getAttribute('data-work'), up = b.getAttribute('data-up') || 'KK爱看';
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = ICO.play + zh(title) + ' <span>' + (e0 - s0) + '초</span>';
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-pressed') === 'true';
        $$('.clip-btn', box).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        if (on) { player.hidden = true; player.innerHTML = ''; return; }
        b.setAttribute('aria-pressed', 'true');
        player.className = 'clip-player' + (b.getAttribute('data-wide') === '1' ? ' wide' : '');
        player.hidden = false;
        var local = b.getAttribute('data-src');
        // 사이트에 직접 실은 클립이 있으면 그 파일을, 없으면 YouTube 구간을 재생
        var media = local
          ? '<video class="clip-video" src="' + local + '" controls autoplay playsinline preload="metadata"></video>'
          : '<iframe src="' + ytSrc(vid, s0, e0) + '" title="' + esc(title) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
        player.innerHTML = '<div class="cp-frame">' + media + '</div>' +
          '<p class="cp-cap"><b>' + zh(title) + '</b> ' + mmss(s0) + '–' + mmss(e0) + '<br><span class="cr">출처: 红果短剧 / ' + zh(work) + '. 영상: YouTube 합본, ' + esc(up) + (local ? '에서 해당 구간만 잘라 실음' : '') + '.</span></p>';
      });
    });
  });

  /* ---------- 아카이브 슬라이드 ---------- */
  function buildViewer(v) {
    if (v.dataset.built || !v.dataset.slides) return;
    v.dataset.built = '1';
    var n = +v.dataset.count, pat = v.dataset.slides, label = v.dataset.label, idx = 0;
    var src = function (i) { var k = i + 1; return pat.replace('{n}', (k < 10 ? '0' : '') + k); };
    v.innerHTML = '<div class="vimg"><img alt=""></div><div class="vbar"><span class="cnt"></span><button class="icon-btn" type="button" data-d="-1" aria-label="이전 쪽">' + ICO.l + '</button><button class="icon-btn" type="button" data-d="1" aria-label="다음 쪽">' + ICO.r + '</button></div><div class="thumbs"></div>';
    var img = $('.vimg img', v), cnt = $('.cnt', v), th = $('.thumbs', v);
    for (var i = 0; i < n; i++) (function (i) { var b = el('button', { type: 'button', 'aria-label': (i + 1) + '쪽' }, '<img src="' + src(i) + '" alt="" loading="lazy">'); b.addEventListener('click', function () { go(i); }); th.appendChild(b); })(i);
    function go(i) {
      idx = (i + n) % n;
      img.src = src(idx); img.alt = label + ' ' + (idx + 1) + '쪽';
      img.setAttribute('data-zoom', ''); img.setAttribute('data-cap', label + ' ' + (idx + 1) + ' / ' + n + ', 3조 팀 발표자료');
      cnt.textContent = (idx + 1) + ' / ' + n;
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
  if (archTabs.length) openWeek('w3');

  /* ---------- 자세히 보기를 열면 그 안의 슬라이드도 다시 계산 ---------- */
  $$('details').forEach(function (d) { d.addEventListener('toggle', function () { if (d.open) { initCarousels(d); $$('.carousel', d).forEach(function (c) { c._update && c._update(); }); } }); });
  initCarousels(document);

  /* ---------- 라이트박스 ---------- */
  var lb = $('#lightbox');
  document.addEventListener('click', function (e) {
    var img = e.target.closest('img[data-zoom], [data-zoomsrc]');
    if (!img || !lb || typeof lb.showModal !== 'function') return;
    var srcUrl = img.getAttribute('data-zoomsrc') || img.currentSrc || img.src;
    var cap = img.getAttribute('data-cap');
    if (!cap) { var fig = img.closest('figure'); var fc = fig && fig.querySelector('figcaption'); cap = fc ? fc.textContent : (img.alt || ''); }
    $('img', lb).src = srcUrl; $('img', lb).alt = img.alt || img.getAttribute('aria-label') || '';
    $('.lb-cap', lb).textContent = cap || '';
    lb.showModal();
  });
  if (lb) {
    $('.lb-close', lb).addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.tagName === 'IMG') lb.close(); });
  }
})();
