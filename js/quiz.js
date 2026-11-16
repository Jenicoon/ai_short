/* 심리테스트: 나에게 어울리는 숏드라마는?
   결과 설명은 전시에 쓴 관찰 결과와 작품 페이지(2026.11.9 조회) 값만 사용 */
(function () {
  'use strict';
  var shell = document.getElementById('quizShell');
  if (!shell) return;
  var X = window.EXHIBIT || {}, byId = X.byId || {}, zh = X.zh, esc = X.esc;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ys: 一双手 / gc: 莞城往事 / cx: 持械入宋 / xz: 小镇是非多 / tn: 十八岁太奶奶驾到 5
  var Q = [
    { q: '퇴근길 지하철, 숏드라마 1화를 틀었다. 이야기는 언제 시작돼야 할까?', o: [
      ['첫 장면부터 사고가 터져야지', { cx: 3, gc: 1 }],
      ['20초 안에는 갈등이 보여야 해', { ys: 3, gc: 2 }],
      ['1분쯤은 분위기를 잡아도 괜찮아', { xz: 3 }],
      ['아는 인물들이라면 천천히 와도 돼', { tn: 3 }]
    ] },
    { q: '가장 응원하고 싶은 주인공은?', o: [
      ['양보만 하다 기회를 놓친 베테랑 선반공', { ys: 3 }],
      ['빈털터리지만 손재주 하나는 확실한 청년', { gc: 3 }],
      ['무기를 들고 낯선 시대에 떨어진 특수부대원', { cx: 3 }],
      ['묵묵히 일하는 굴착기 기사', { xz: 3 }],
      ['열여덟 살 모습으로 나타난 증조할머니', { tn: 3 }]
    ] },
    { q: '보는 사람까지 짜릿해지는 순간은?', o: [
      ['인생 2회차, 이번에는 같은 실수를 하지 않을 때', { ys: 3 }],
      ['무시하던 사람들 앞에서 실력을 증명할 때', { gc: 3, ys: 1 }],
      ['맹수와 적을 압도적인 힘으로 제압할 때', { cx: 3 }],
      ['오래 참아 온 진실이 드디어 드러날 때', { xz: 3 }],
      ['흩어졌던 가족이 다시 하나로 뭉칠 때', { tn: 3 }]
    ] },
    { q: '회차가 끝났다. 어떤 장면이면 다음 화를 누를까?', o: [
      ['주인공이 정면으로 맞서기 직전', { ys: 3 }],
      ['뜻밖의 귀인이 나타나거나 위기가 닥칠 때', { gc: 3 }],
      ['정체 모를 미스터리가 남았을 때', { cx: 3 }],
      ['인물의 표정에 여운이 남았을 때', { xz: 3 }],
      ['익숙한 인물들의 다음 이야기가 궁금할 때', { tn: 3 }]
    ] },
    { q: '화면 아래에 ‘作品由AI生成(AI로 생성된 작품)’이 떠 있다면?', o: [
      ['이야기만 재미있으면 상관없어', { ys: 2, gc: 2 }],
      ['오히려 AI라서 가능한 장면이 궁금해', { cx: 3 }],
      ['그래도 실제 배우의 연기가 좋아', { xz: 2, tn: 2 }]
    ] },
    { q: '들어가 보고 싶은 무대는?', o: [
      ['기계 소리 가득한 국영 공장', { ys: 3 }],
      ['2005년, 일자리를 찾아 사람들이 모여든 둥관', { gc: 3 }],
      ['말 탄 약탈자가 나타나는 송나라 산골', { cx: 3 }],
      ['이웃끼리 다 아는 작은 마을', { xz: 3 }],
      ['가문의 운명이 걸린 대가족의 집', { tn: 3 }]
    ] }
  ];

  var R = {
    ys: { id: 'yishuangshou', type: '다시 사는 인생형', name: '성실한 장인', poster: 'assets/posters/yishuangshou.jpg', room: 'works.html#base',
      body: '화려한 복수보다 <b>“내 손으로 인정받는 순간”</b>에 끌리는 사람. 《<span class="zh">一双手闯出一片天</span>》의 왕톄주는 양보만 하다 끝난 인생을 다시 살게 되고, 이번에는 진급 추천 자리를 내주지 않습니다. 허름한 수리점에서 자기 기술로 다시 일어서는 이야기입니다.',
      facts: [['약 18초', '1화 첫 갈등'], ['누적 2:30', '첫 반격 (관찰 결과)'], ['약 87초', '1~5화 평균 길이'], ['126화', '평점 7.5 (11.9)']] },
    gc: { id: 'guancheng', type: '맨손 창업형', name: '85위안의 역전', poster: 'assets/posters/guancheng.jpg', room: 'analysis.html#compare',
      body: '가진 건 손재주와 버티는 힘뿐이어도 <b>바닥에서부터 올라가는 이야기</b>에 마음이 움직이는 사람. 《<span class="zh">莞城往事</span>》의 천환은 여자친구에게 돈을 뜯기고 85위안만 남은 채 2005년 둥관에 도착합니다. 회귀 대신 귀인(집주인)을 만나 세탁기 수리 기술로 인정받기 시작합니다.',
      facts: [['약 5초', '1화 첫 갈등'], ['누적 3:56', '첫 반격 (관찰 결과)'], ['약 109초', '1~5화 평균 길이'], ['평점 8.7', 'AI剧热播榜 18위 (11.9)']] },
    cx: { id: 'chixie', type: '스펙터클 모험형', name: '이걸 어떻게 찍었지?', poster: 'assets/posters/chixie.jpg', room: 'analysis.html#spectacle',
      body: '이야기 속도보다 <b>눈앞에 펼쳐지는 장면</b>이 더 궁금한 사람. 《<span class="zh">持械入宋</span>》에서는 현대 특수부대 5명이 무기를 들고 송나라로 떨어집니다. 장갑차 추락, 표범 습격, 기병 습격처럼 실사로는 부담이 큰 장면이 연달아 나옵니다.',
      facts: [['0초', '첫 장면부터 갈등'], ['누적 8:30', '첫 반격 (관찰 결과)'], ['평점 9.5', 'AI剧热播榜 6위 (11.9)'], ['444.9만', '저장 수 (11.9)']] },
    xz: { id: 'xiaozhen', type: '현실 공감형', name: '느린 호흡의 감정선', poster: 'assets/posters/xiaozhen.jpg', room: 'analysis.html#compare',
      body: '빠른 사이다보다 <b>쌓여 가는 감정과 배우의 표정</b>을 따라가는 사람. 《<span class="zh">小镇是非多之同床异梦</span>》은 아내가 투자 사기로 집을 날리고, 굴착기 기사인 남편이 성실한 노동으로 재기하는 실사극입니다. 우리 관찰에서는 5화(약 11분)까지 반격 없이 억압이 쌓이고, 회차 끝을 여운으로 끊는 경우가 많았습니다.',
      facts: [['약 56초', '1화 첫 갈등'], ['10:56까지', '반격 없음 (관찰 결과)'], ['약 131초', '1~5화 평균 길이'], ['평점 7.9', '真人剧热播榜 2위 (11.9)']] },
    tn: { id: 'tainainai', type: '가족극 정주행형', name: '시리즈와 함께 자란 팬', poster: 'assets/posters/tainainai.jpg', room: 'analysis.html#compare',
      body: '익숙한 인물들과 <b>오래 함께하는 즐거움</b>을 아는 사람. 《<span class="zh">十八岁太奶奶驾到 5</span>》는 타임슬립한 할머니가 등장하는 가문 부흥 가족극의 다섯 번째 시리즈입니다. 배우에 대한 애착과 시리즈 IP처럼, 실사가 아직 이기는 지점을 보여 주는 작품입니다.',
      facts: [['1위', '真人剧热播榜 (11.9)'], ['6,901만', '열도 (11.9)'], ['평점 9.6', '(11.9)'], ['약 130초', '1~5화 평균 길이']] }
  };
  var KEYS = ['ys', 'gc', 'cx', 'xz', 'tn'];
  var MAX = {};
  KEYS.forEach(function (k) { MAX[k] = Q.reduce(function (sum, q) { return sum + Math.max.apply(null, q.o.map(function (o) { return o[1][k] || 0; })); }, 0); });

  var step = 0, answers = [];

  function bar() { return '<div class="quiz-bar" style="width:' + (step / Q.length * 100) + '%"></div>'; }

  function intro() {
    step = 0; answers = [];
    shell.innerHTML = bar() + '<div class="quiz-intro anim-in">' +
      '<div class="phones"><img src="assets/posters/yishuangshou.jpg" alt=""><img src="assets/posters/guancheng.jpg" alt=""><img src="assets/posters/chixie.jpg" alt=""></div>' +
      '<h3>오늘 밤 정주행할 숏드라마,<br>여섯 문항으로 골라 드려요</h3>' +
      '<p class="muted">AI 작품 3편과 실사 작품 2편 중에서 당신의 취향과 가장 가까운 작품을 추천합니다. 30초면 끝나요.</p>' +
      '<button class="btn btn-primary" type="button" id="quizStart">테스트 시작하기</button></div>';
    document.getElementById('quizStart').addEventListener('click', function () { render(); });
  }

  function render() {
    var q = Q[step];
    shell.innerHTML = bar() + '<div class="quiz-step anim-in"><div class="qn">Q' + (step + 1) + ' / ' + Q.length + '</div><h3>' + zh(q.q) + '</h3><div class="opts" role="group" aria-label="보기"></div>' +
      '<div class="quiz-foot"><button class="linkbtn" type="button" id="qBack"' + (step === 0 ? ' disabled' : '') + '>← 이전 문항</button><button class="linkbtn" type="button" id="qReset">처음으로</button></div></div>';
    var opts = shell.querySelector('.opts');
    q.o.forEach(function (o, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'opt' + (answers[step] === i ? ' picked' : '');
      b.innerHTML = '<span class="l">' + 'ABCDE'[i] + '</span><span>' + zh(o[0]) + '</span>';
      b.addEventListener('click', function () {
        answers[step] = i; b.classList.add('picked');
        setTimeout(function () { step++; if (step >= Q.length) result(); else render(); }, reduceMotion ? 0 : 220);
      });
      opts.appendChild(b);
    });
    document.getElementById('qBack').addEventListener('click', function () { if (step > 0) { step--; render(); } });
    document.getElementById('qReset').addEventListener('click', intro);
    var first = opts.querySelector('button'); if (first && step > 0) first.focus({ preventScroll: true });
  }

  function score() {
    var sc = { ys: 0, gc: 0, cx: 0, xz: 0, tn: 0 };
    answers.forEach(function (ai, qi) { var w = Q[qi].o[ai][1]; Object.keys(w).forEach(function (k) { sc[k] += w[k]; }); });
    return sc;
  }

  function result(forced) {
    step = Q.length;
    var sc = score(), best = forced;
    if (!best) { best = KEYS[0]; KEYS.forEach(function (k) { if (sc[k] / MAX[k] > sc[best] / MAX[best]) best = k; }); }
    var r = R[best], w = byId[r.id] || {};
    var pct = function (k) { return Math.round(sc[k] / MAX[k] * 100); };
    var rank = KEYS.slice().sort(function (a, b) { return pct(b) - pct(a); });
    var isAI = w.production === 'AI';
    var poster = r.poster
      ? '<div class="rp"><img src="' + r.poster + '" alt="' + esc(w.title || '') + ' 공식 포스터"></div>'
      : '<div class="rp noimg"><div><b>' + esc(X.SHORT[r.id]) + '</b><small>실존 배우 출연 작품이라<br>사진을 싣지 않았습니다</small></div></div>';
    shell.innerHTML = '<div class="quiz-bar" style="width:100%"></div><div class="anim-in"><div class="result">' + poster +
      '<div><div class="type">당신은 · ' + esc(r.type) + '</div><h3>' + esc(r.name) + '</h3>' +
      '<div class="rt">' + esc(w.title || '') + ' <span class="badge ' + (isAI ? 'ai' : 'real') + '">' + (isAI ? 'AI' : '실사') + '</span></div>' +
      '<div class="rko">' + esc(w.title_ko || '') + '</div>' +
      '<p>' + r.body + '</p>' +
      '<div class="facts">' + r.facts.map(function (f) { return '<div><b>' + esc(f[0]) + '</b><span>' + zh(f[1]) + '</span></div>'; }).join('') + '</div>' +
      '<p class="xs muted" style="margin:0">' + (r.poster ? '포스터 출처: 红果短剧 / ' + esc(X.SHORT[r.id]) + ' · ' : '') + '시간은 红果 공식 플레이어 기준, 지표는 2026.11.9 조회</p>' +
      '<div class="result-actions">' +
      (w.url ? '<a class="btn btn-primary" href="' + w.url + '" target="_blank" rel="noopener">红果에서 보기 ↗</a>' : '') +
      '<a class="btn btn-ghost" href="' + r.room + '">전시실에서 자세히</a>' +
      '<button class="btn btn-ghost" type="button" id="qShare">결과 링크 복사</button>' +
      '<button class="btn btn-ghost" type="button" id="qAgain">다시 하기</button></div></div></div>' +
      '<div class="match"><h4 class="mini">작품별 취향 일치도</h4>' + rank.map(function (k) {
        var ww = byId[R[k].id] || {};
        return '<div class="mr"><span class="zh">' + esc(X.SHORT[R[k].id]) + '</span><span class="b"><i data-w="' + pct(k) + '" style="background:var(' + (ww.production === 'AI' ? '--ai' : '--real') + ')"></i></span><span class="p">' + pct(k) + '%</span></div>';
      }).join('') + (forced ? '<p class="xs muted">공유된 결과입니다. 직접 해 보면 일치도가 계산됩니다.</p>' : '') + '</div></div>';
    requestAnimationFrame(function () { shell.querySelectorAll('.mr i').forEach(function (i) { i.style.width = (forced ? 0 : i.getAttribute('data-w')) + '%'; }); });
    if (forced) shell.querySelectorAll('.mr .p').forEach(function (p) { p.textContent = '–'; });
    document.getElementById('qAgain').addEventListener('click', function () { intro(); shell.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' }); });
    document.getElementById('qShare').addEventListener('click', function (e) {
      var url = location.href.split('#')[0] + '#quiz=' + best, btn = e.currentTarget;
      var done = function () { btn.textContent = '복사했어요'; setTimeout(function () { btn.textContent = '결과 링크 복사'; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { prompt('이 링크를 복사하세요', url); });
      else prompt('이 링크를 복사하세요', url);
    });
  }

  var m = /#quiz=(ys|gc|cx|xz|tn)/.exec(location.hash);
  if (m) { result(m[1]); setTimeout(function () { document.getElementById('quiz').scrollIntoView(); }, 50); }
  else intro();
})();
