/* House Help Record - UI */
(function () {
  var S = HH, T = I18n.t;
  var TASKS = ['t_sweep', 't_utensils', 't_clothes', 't_cooking', 't_dust', 't_bath', 't_kids', 't_other'];

  var state = {
    screen: 'home',
    tab: 'home',
    helperId: null,
    cal: null,   // {y,m}
    pay: null,   // {y,m}
    pendingConfirm: null
  };

  var view = document.getElementById('view');
  var titleEl = document.getElementById('screenTitle');
  var subEl = document.getElementById('screenSub');
  var backBtn = document.getElementById('btnBack');
  var fab = document.getElementById('fab');
  var fabLabel = document.getElementById('fabLabel');
  var sheetWrap = document.getElementById('sheetBackdrop');
  var sheetEl = document.getElementById('sheet');
  var toastEl = document.getElementById('toast');

  function nowYM() {
    var d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  }
  var ym = nowYM();
  state.cal = { y: ym.y, m: ym.m };
  state.pay = { y: ym.y, m: ym.m };

  /* ---------------- helpers ---------------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(n) { return I18n.money(n); }
  function n2(n) { return (Math.round(n * 100) / 100).toString(); }
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.classList.add('hidden'); }, 2200);
  }
  function currentHelper() {
    var h = state.helperId ? S.helper(state.helperId) : null;
    if (h) return h;
    return S.helpers()[0] || null;
  }
  function initial(name) {
    var s = String(name || '').trim();
    return s ? s.charAt(0).toUpperCase() : '?';
  }

  /* ---------------- navigation ---------------- */
  function go(screen, opts) {
    opts = opts || {};
    state.screen = screen;
    if (opts.id) state.helperId = opts.id;
    if (screen === 'home') state.tab = 'home';
    if (screen === 'more') state.tab = 'more';
    if (screen === 'calendar' || screen === 'advance') state.tab = screen;
    if (screen === 'helper' || screen === 'pay') state.tab = screen === 'pay' ? 'advance' : state.tab;
    window.scrollTo(0, 0);
    render();
  }

  function render() {
    var h = currentHelper();
    if ((state.screen === 'calendar' || state.screen === 'advance' || state.screen === 'pay' || state.screen === 'helper') && !h) {
      state.screen = 'home'; state.tab = 'home';
    }
    var map = {
      home: screenHome, helper: screenHelper, calendar: screenCalendar,
      advance: screenAdvance, pay: screenPay, more: screenMore
    };
    var fn = map[state.screen] || screenHome;
    view.innerHTML = fn();

    // appbar
    var t = T('appName'), sub = '';
    if (state.screen === 'helper') { t = h.name; sub = T('workingSince', { d: I18n.date(h.joinDate, true) }); }
    if (state.screen === 'calendar') { t = h.name; sub = T('calTitle'); }
    if (state.screen === 'advance') { t = h.name; sub = T('advTitle'); }
    if (state.screen === 'pay') { t = h.name; sub = T('payTitle'); }
    if (state.screen === 'more') { t = T('more'); sub = T('settings'); }
    if (state.screen === 'home') { sub = T('helperCount', { n: S.helpers().length }); }
    titleEl.textContent = t;
    subEl.textContent = sub;

    backBtn.classList.toggle('hidden', ['home', 'more'].indexOf(state.screen) >= 0);

    // fab
    var fabMap = { home: 'addHelper', advance: 'addEntry' };
    if (fabMap[state.screen]) {
      fab.classList.remove('hidden');
      fabLabel.textContent = T(fabMap[state.screen]);
    } else fab.classList.add('hidden');

    // tabs
    Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (el) {
      el.classList.toggle('active', el.dataset.tab === state.tab);
    });
    Array.prototype.forEach.call(document.querySelectorAll('.lang-btn'), function (el) {
      el.classList.toggle('active', el.dataset.lang === S.getLang());
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (el) {
      el.textContent = T(el.dataset.i18n);
    });
    document.documentElement.lang = S.getLang() === 'hi' ? 'hi' : 'en';
  }

  /* ---------------- sheets ---------------- */
  function openSheet(html) {
    sheetEl.innerHTML = html;
    sheetWrap.classList.remove('hidden');
  }
  function closeSheet() {
    sheetWrap.classList.add('hidden');
    sheetEl.innerHTML = '';
    state.pendingConfirm = null;
  }
  function confirmSheet(msg, onYes) {
    state.pendingConfirm = onYes;
    openSheet(
      '<div class="sheet-head"><h2>' + esc(msg) + '</h2></div>' +
      '<div class="btn-row" style="margin-top:8px">' +
      '<button class="btn ghost" data-act="sheet-cancel">' + T('cancel') + '</button>' +
      '<button class="btn red" data-act="confirm-yes">' + T('delete') + '</button></div>' +
      '<div style="height:14px"></div>'
    );
  }

  /* ---------------- screens ---------------- */
  function screenHome() {
    var helpers = S.helpers();
    var y = state.cal.y, m = state.cal.m;
    var totP = 0, totDue = 0, totAdv = 0;
    var cards = helpers.map(function (h) {
      var st = S.monthStats(h, y, m);
      var bal = S.monthBalance(h, y, m);
      totP += st.P + st.H * 0.5; totDue += bal.remaining; totAdv += bal.advance;
      var tasks = (h.tasks || []).map(function (k) { return '<span class="pill">' + esc(T(k)) + '</span>'; }).join(' ');
      return '' +
        '<div class="card helper-card" data-act="open-helper" data-id="' + h.id + '">' +
          '<div class="avatar">' + esc(initial(h.name)) + '</div>' +
          '<div class="grow">' +
            '<div class="helper-name">' + esc(h.name) + '</div>' +
            '<div class="small muted">' + (h.phone ? esc(h.phone) : esc(T('phoneMissing'))) + '</div>' +
            '<div class="chips" style="margin-top:6px">' + tasks + '</div>' +
            '<div class="stat-grid">' +
              '<div class="stat"><b>' + (Math.round((st.P + st.H * 0.5) * 10) / 10) + '</b><span>' + T('present') + '</span></div>' +
              '<div class="stat"><b>' + money(Math.max(bal.remaining, 0)) + '</b><span>' + T('salaryDue') + '</span></div>' +
              '<div class="stat"><b>' + money(Math.max(bal.advance, 0)) + '</b><span>' + T('advDue') + '</span></div>' +
            '</div>' +
          '</div>' +
        '</div>';
    }).join('');

    var emptyHtml = '<div class="card empty"><span class="emoji">🧹</span><b>' + T('noHelpers') + '</b>' +
      '<p class="small" style="margin-top:6px">' + T('noHelpersSub') + '</p>' +
      '<button class="btn" style="margin-top:16px" data-act="add-helper">' + T('addHelper') + '</button></div>';

    return '' +
      '<div class="card" style="background:linear-gradient(135deg,#FFF6EE,#FFEFE0)">' +
        '<div style="font-size:19px;font-weight:800">' + T('greet') + '</div>' +
        '<div class="small muted">' + I18n.monthYear(state.cal.y, state.cal.m) + '</div>' +
        '<div class="stat-grid" style="margin-top:12px">' +
          '<div class="stat"><b>' + helpers.length + '</b><span>' + T('myHelpers') + '</span></div>' +
          '<div class="stat"><b>' + (Math.round(totP * 10) / 10) + '</b><span>' + T('present') + '</span></div>' +
          '<div class="stat"><b>' + money(Math.max(totDue, 0)) + '</b><span>' + T('salaryDue') + '</span></div>' +
        '</div>' +
      '</div>' +
      (helpers.length
        ? '<div class="card"><div class="row between" style="margin-bottom:4px"><b>' + T('todayAttendance') + '</b>' +
            '<span class="tiny muted">' + I18n.date(S.todayISO(), true) + '</span></div>' +
            helpers.map(function (x) {
              var s2 = S.getDay(x.id, S.todayISO());
              return '<div class="today-row">' +
                '<span class="avatar sm">' + esc(initial(x.name)) + '</span>' +
                '<div class="grow name">' + esc(x.name) + '</div>' +
                '<button class="btn sm ' + (s2 === 'P' ? 'green' : 'secondary') + '" data-act="today-P" data-id="' + x.id + '">✔ ' + T('present') + '</button>' +
                '<button class="btn sm ' + (s2 === 'A' ? 'red' : 'secondary') + '" data-act="today-A" data-id="' + x.id + '">✖ ' + T('absent') + '</button>' +
                '</div>';
            }).join('') +
          '</div>' +
          '<div class="section-title">' + T('myHelpers') + '</div>' + cards
        : emptyHtml);
  }

  function screenHelper() {
    var h = currentHelper();
    var y = state.cal.y, m = state.cal.m;
    var st = S.monthStats(h, y, m);
    var bal = S.monthBalance(h, y, m);
    var adv = S.advances(h.id).slice(0, 4);
    var todayISO = S.todayISO();
    var todayStatus = S.getDay(h.id, todayISO);

    var tasks = (h.tasks || []).map(function (k) { return '<span class="pill">' + esc(T(k)) + '</span>'; }).join(' ');

    return '' +
      '<div class="card">' +
        '<div class="row">' +
          '<div class="avatar" style="width:64px;height:64px;font-size:28px">' + esc(initial(h.name)) + '</div>' +
          '<div class="grow">' +
            '<div style="font-size:22px;font-weight:800">' + esc(h.name) + '</div>' +
            '<div class="muted small">' + (h.phone ? esc(h.phone) : T('phoneMissing')) + '</div>' +
            '<div class="small muted">' + T('workingSince', { d: I18n.date(h.joinDate) }) + '</div>' +
          '</div>' +
        '</div>' +
        (tasks ? '<div class="chips" style="margin-top:12px">' + tasks + '</div>' : '') +
        (h.note ? '<div class="notice" style="margin-top:12px">' + esc(h.note) + '</div>' : '') +
        '<div class="divider"></div>' +
        '<div class="btn-row">' +
          '<button class="btn secondary sm" data-act="call">' + T('call') + '</button>' +
          '<button class="btn secondary sm" data-act="whatsapp">' + T('whatsapp') + '</button>' +
        '</div>' +
      '</div>' +

      '<div class="card">' +
        '<div class="row between"><b>' + T('monthSummary') + '</b><span class="tiny muted">' + I18n.monthYear(y, m) + '</span></div>' +
        '<div class="stat-grid" style="margin-top:10px">' +
          '<div class="stat"><b>' + st.P + '</b><span>' + T('present') + '</span></div>' +
          '<div class="stat"><b>' + st.H + '</b><span>' + T('half') + '</span></div>' +
          '<div class="stat"><b>' + st.A + '</b><span>' + T('absent') + '</span></div>' +
        '</div>' +
        '<div style="margin-top:12px">' +
          '<div class="summary-row"><span class="muted">' + T('earned') + '</span><b>' + money(st.earned) + '</b></div>' +
          '<div class="summary-row"><span class="muted">' + T('advDeduct') + '</span><b>- ' + money(Math.max(bal.advance, 0)) + '</b></div>' +
          '<div class="summary-row"><span class="muted">' + T('alreadyPaid') + '</span><b>' + money(bal.paid) + '</b></div>' +
          '<div class="summary-row total"><span>' + (bal.remaining >= 0 ? T('remaining') : T('toReceive')) + '</span><b>' + money(Math.abs(bal.remaining)) + '</b></div>' +
        '</div>' +
        '<div class="btn-row" style="margin-top:14px">' +
          '<button class="btn ghost sm" data-act="edit-helper">' + T('editInfo') + '</button>' +
          '<button class="btn ghost sm" data-act="delete-helper">' + T('delete') + '</button>' +
        '</div>' +
      '</div>' +

      '<div class="card">' +
        '<div class="row between" style="margin-bottom:10px"><b>' + T('today') + '</b>' +
          '<span class="tiny muted">' + I18n.date(todayISO, true) + '</span></div>' +
        '<div class="btn-row">' +
          '<button class="btn ' + (todayStatus === 'P' ? 'green' : 'secondary') + '" data-act="today-P">✔ ' + T('present') + '</button>' +
          '<button class="btn ' + (todayStatus === 'A' ? 'red' : 'secondary') + '" data-act="today-A">✖ ' + T('absent') + '</button>' +
        '</div>' +
      '</div>' +

      '<div class="btn-row" style="flex-direction:column">' +
        '<button class="btn" data-act="go-calendar">📅 ' + T('btnCalendar') + '</button>' +
        '<button class="btn secondary" data-act="go-advance">💰 ' + T('btnAdvance') + '</button>' +
        '<button class="btn secondary" data-act="go-pay">🧾 ' + T('btnPay') + '</button>' +
      '</div>' +

      (adv.length ? '<div class="section-title">' + T('advTitle') + '</div><div class="card tight">' + adv.map(entryRow).join('') + '</div>' : '');
  }

  function entryRow(a) {
    var sign = a.type === 'given' ? '-' : (a.type === 'repaid' ? '+' : '');
    var cls = a.type === 'given' ? 'minus' : (a.type === 'repaid' ? 'plus' : '');
    var icon = a.type === 'given' ? '↓' : (a.type === 'repaid' ? '↑' : '★');
    var ic = a.type === 'given' ? 'given' : (a.type === 'repaid' ? 'repaid' : 'bonus');
    return '<div class="entry" data-act="del-advance" data-id="' + a.id + '">' +
      '<div class="entry-icon ' + ic + '">' + icon + '</div>' +
      '<div class="grow"><div class="entry-title">' + T(a.type === 'given' ? 'given' : a.type === 'repaid' ? 'repaid' : 'bonus') + '</div>' +
      '<div class="tiny muted">' + I18n.date(a.date, true) + (a.note ? ' · ' + esc(a.note) : '') + '</div></div>' +
      '<div class="amount ' + cls + '">' + sign + money(a.amount) + '</div>' +
      '</div>';
  }

  function screenCalendar() {
    var h = currentHelper();
    var y = state.cal.y, m = state.cal.m;
    var map = S.monthMap(h.id, y, m);
    var st = S.monthStats(h, y, m);
    var today = new Date();
    var todayISO = S.todayISO();
    var dim = S.daysInMonth(y, m);
    var firstDow = new Date(y, m, 1).getDay();
    var joinLimit = S.joinLimit(h.id, y, m);
    var off = S.data.settings.weekOff || [];
    var dow = I18n.dow[S.getLang()];

    var cells = '';
    for (var i = 0; i < firstDow; i++) cells += '<div class="day empty"></div>';
    for (var d = 1; d <= dim; d++) {
      var dt = new Date(y, m, d);
      var iso = S.iso(dt);
      var stt = map[iso];
      var future = dt > today;
      var beforeJoin = d < joinLimit;
      var isOff = off.indexOf(dt.getDay()) >= 0;
      var cls = 'day';
      if (stt) cls += ' ' + stt.toLowerCase();
      if (iso === todayISO) cls += ' today';
      if (future || beforeJoin) cls += ' future';
      else if (!stt && isOff) cls += ' off';
      var mark = stt === 'P' ? '✔' : stt === 'A' ? '✖' : stt === 'H' ? '◐' : stt === 'L' ? '–' : '';
      cells += '<button class="' + cls + '" data-act="day" data-d="' + iso + '"' + (future || beforeJoin ? ' disabled' : '') + '>' +
        '<span class="d">' + d + '</span><span class="m">' + mark + '</span></button>';
    }

    return '' +
      '<div class="card">' +
        '<div class="cal-head">' +
          '<button class="nav-btn" data-act="cal-prev" aria-label="prev">' +
            '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
          '<div class="cal-title">' + I18n.monthYear(y, m) + '</div>' +
          '<button class="nav-btn" data-act="cal-next" aria-label="next">' +
            '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
        '</div>' +
        '<div class="cal-grid">' + dow.map(function (d) { return '<div class="cal-dow">' + d + '</div>'; }).join('') + cells + '</div>' +
        '<div class="legend">' +
          '<span><i class="dot p"></i> ' + T('present') + '</span>' +
          '<span><i class="dot a"></i> ' + T('absent') + '</span>' +
          '<span><i class="dot h"></i> ' + T('half') + '</span>' +
          '<span><i class="dot l"></i> ' + T('holiday') + '</span>' +
        '</div>' +
        '<p class="tiny muted center" style="margin-top:10px">' + T('calHint') + '</p>' +
      '</div>' +

      '<div class="card">' +
        '<div class="summary-row"><span class="muted">' + T('calSummary', { p: st.P, h: st.H, a: st.A, l: st.L }) + '</span></div>' +
        '<div class="summary-row"><span class="muted">' + T('perDay') + '</span><b>' + money(st.perDay) + '</b></div>' +
        '<div class="summary-row total"><span>' + T('earned') + '</span><b>' + money(st.earned) + '</b></div>' +
        '<div class="btn-row" style="margin-top:14px">' +
          '<button class="btn ghost sm" data-act="mark-all">' + T('markAll') + '</button>' +
          '<button class="btn ghost sm" data-act="clear-month">' + T('clearMonth') + '</button>' +
        '</div>' +
      '</div>';
  }

  function screenAdvance() {
    var h = currentHelper();
    var list = S.advances(h.id);
    var bal = S.advanceBalance(h.id);
    var given = 0, repaid = 0;
    S.data.advances.forEach(function (a) {
      if (a.helperId !== h.id) return;
      if (a.type === 'given') given += +a.amount || 0;
      if (a.type === 'repaid') repaid += +a.amount || 0;
    });
    var bonus = S.bonusTotal(h.id);

    return '' +
      '<div class="card" style="background:linear-gradient(135deg,#FFF6EE,#FFEFE0)">' +
        '<div class="tiny muted">' + T('balance') + '</div>' +
        '<div class="big-amount">' + money(bal) + '</div>' +
        '<div class="stat-grid" style="margin-top:12px">' +
          '<div class="stat"><b>' + money(given) + '</b><span>' + T('totalGiven') + '</span></div>' +
          '<div class="stat"><b>' + money(repaid) + '</b><span>' + T('totalRepaid') + '</span></div>' +
          '<div class="stat"><b>' + money(bonus) + '</b><span>' + T('totalBonus') + '</span></div>' +
        '</div>' +
      '</div>' +
      '<p class="tiny muted" style="margin:0 4px 12px">' + T('advHint') + '</p>' +
      (list.length
        ? '<div class="card tight">' + list.map(entryRow).join('') + '<p class="tiny muted center" style="padding:8px 0 2px">' + T('tapToDelete') + '</p></div>'
        : '<div class="card empty"><span class="emoji">💰</span><b>' + T('noEntries') + '</b>' +
          '<button class="btn" style="margin-top:14px" data-act="add-entry">' + T('addEntry') + '</button></div>');
  }

  function screenPay() {
    var h = currentHelper();
    var y = state.pay.y, m = state.pay.m;
    var b = S.monthBalance(h, y, m);
    var st = b.stats;
    var pays = S.payments(h.id, S.monthKey(y, m));

    return '' +
      '<div class="card">' +
        '<div class="cal-head">' +
          '<button class="nav-btn" data-act="pay-prev"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
          '<div class="cal-title">' + I18n.monthYear(y, m) + '</div>' +
          '<button class="nav-btn" data-act="pay-next"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
        '</div>' +
        '<div class="summary-row"><span class="muted">' + T('fullSalary') + '</span><b>' + money(st.full) + '</b></div>' +
        '<div class="summary-row"><span class="muted">' + T('earned') + ' (' + (Math.round((st.P + st.H * 0.5) * 10) / 10) + ' ' + T('dayShort') + ')</span><b>' + money(st.earned) + '</b></div>' +
        '<div class="summary-row"><span class="muted">' + T('advDeduct') + '</span><b>- ' + money(Math.max(b.advance, 0)) + '</b></div>' +
        '<div class="summary-row"><span class="muted">' + T('alreadyPaid') + '</span><b>- ' + money(b.paid) + '</b></div>' +
        '<div class="summary-row total"><span>' + (b.remaining >= 0 ? T('remaining') : T('toReceive')) + '</span><b>' + money(Math.abs(b.remaining)) + '</b></div>' +
        (Math.abs(b.remaining) < 1 ? '<p class="center" style="margin-top:8px;color:var(--green);font-weight:700">' + T('settled') + '</p>' : '') +
        '<div class="btn-row" style="margin-top:14px">' +
          '<button class="btn green" data-act="pay-full">' + T('payFull') + '</button>' +
          '<button class="btn secondary" data-act="pay-custom">' + T('markPaid') + '</button>' +
        '</div>' +
      '</div>' +

      '<div class="btn-row"><button class="btn ghost" data-act="share-summary">📤 ' + T('shareSummary') + '</button></div>' +

      '<div class="section-title">' + T('paymentHistory') + '</div>' +
      (pays.length
        ? '<div class="card tight">' + pays.map(function (p) {
            return '<div class="entry" data-act="del-payment" data-id="' + p.id + '">' +
              '<div class="entry-icon repaid">₹</div>' +
              '<div class="grow"><div class="entry-title">' + money(p.amount) + '</div>' +
              '<div class="tiny muted">' + T('paidOn', { d: I18n.date(p.date, true) }) + '</div></div>' +
              '<div class="amount">✔</div></div>';
          }).join('') + '</div>'
        : '<div class="card empty"><span class="emoji">🧾</span><b>' + T('noPayments') + '</b></div>');
  }

  function screenMore() {
    var set = S.data.settings;
    var lang = S.getLang();
    var dowFull = I18n.dowFull[lang];
    var off = set.weekOff || [];

    return '' +
      '<div class="card">' +
        '<div class="section-title" style="margin-top:0">' + T('language') + '</div>' +
        '<div class="seg">' +
          '<button class="' + (lang === 'hi' ? 'active' : '') + '" data-act="set-lang" data-lang="hi">हिंदी</button>' +
          '<button class="' + (lang === 'en' ? 'active' : '') + '" data-act="set-lang" data-lang="en">English</button>' +
        '</div>' +
      '</div>' +

      '<div class="card">' +
        '<div class="section-title" style="margin-top:0">' + T('salaryBasis') + '</div>' +
        '<div class="seg" style="flex-direction:column">' +
          '<button class="' + (set.salaryBasis === '30' ? 'active' : '') + '" data-act="set-basis" data-basis="30">' + T('basis30') + '</button>' +
          '<button class="' + (set.salaryBasis === 'working' ? 'active' : '') + '" data-act="set-basis" data-basis="working">' + T('basisWork') + '</button>' +
        '</div>' +
        '<div class="divider"></div>' +
        '<div class="section-title">' + T('weekOff') + '</div>' +
        '<div class="chips">' + dowFull.map(function (d, i) {
          return '<button class="chip sm ' + (off.indexOf(i) >= 0 ? 'active' : '') + '" data-act="toggle-off" data-dow="' + i + '">' + d + '</button>';
        }).join('') + '</div>' +
      '</div>' +

      '<div class="card">' +
        '<div class="section-title" style="margin-top:0">' + T('backup') + '</div>' +
        '<p class="tiny muted" style="margin-bottom:12px">' + T('backupHint') + '</p>' +
        '<div class="btn-row" style="flex-direction:column">' +
          '<button class="btn secondary" data-act="export">' + T('exportBtn') + '</button>' +
          '<button class="btn ghost" data-act="import">' + T('importBtn') + '</button>' +
        '</div>' +
      '</div>' +

      '<div class="card">' +
        '<div class="section-title" style="margin-top:0">' + T('howTo') + '</div>' +
        '<p class="small" style="white-space:pre-line">' + T('howToText') + '</p>' +
      '</div>' +

      '<div class="card">' +
        '<div class="section-title" style="margin-top:0">' + T('about') + '</div>' +
        '<p class="small muted">' + T('aboutText') + '</p>' +
        '<p class="tiny muted" style="margin-top:8px">' + T('version') + '</p>' +
      '</div>' +

      '<button class="btn red" data-act="reset-all">' + T('resetAll') + '</button>';
  }

  /* ---------------- forms ---------------- */
  function helperForm(id) {
    var h = id ? S.helper(id) : null;
    var d = h || { payType: 'monthly', salary: '', wage: '', joinDate: S.todayISO(), tasks: ['t_sweep'] };
    var lang = S.getLang();
    return '' +
      '<div class="sheet-head"><h2>' + T(h ? 'editHelperTitle' : 'addHelperTitle') + '</h2>' +
        '<button class="icon-btn dark" data-act="sheet-cancel">' +
        '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button></div>' +

      '<div class="field"><label>' + T('name') + '</label>' +
        '<input id="f-name" type="text" value="' + esc(d.name || '') + '" placeholder="' + esc(T('nameHint')) + '" /></div>' +

      '<div class="field"><label>' + T('phone') + ' <span class="tiny muted">(' + T('optional') + ')</span></label>' +
        '<input id="f-phone" type="tel" inputmode="numeric" value="' + esc(d.phone || '') + '" placeholder="' + esc(T('phoneHint')) + '" /></div>' +

      '<div class="field"><label>' + T('payType') + '</label><div class="seg">' +
        '<button type="button" class="' + ((d.payType || 'monthly') === 'monthly' ? 'active' : '') + '" data-act="pt" data-pt="monthly">' + T('monthly') + '</button>' +
        '<button type="button" class="' + (d.payType === 'daily' ? 'active' : '') + '" data-act="pt" data-pt="daily">' + T('daily') + '</button>' +
      '</div></div>' +

      '<div class="field" id="f-salary-wrap" ' + (d.payType === 'daily' ? 'style="display:none"' : '') + '><label>' + T('salary') + '</label>' +
        '<input id="f-salary" type="number" inputmode="numeric" min="0" value="' + (d.salary || '') + '" placeholder="3000" /></div>' +

      '<div class="field" id="f-wage-wrap" ' + (d.payType === 'daily' ? '' : 'style="display:none"') + '><label>' + T('wage') + '</label>' +
        '<input id="f-wage" type="number" inputmode="numeric" min="0" value="' + (d.wage || '') + '" placeholder="150" /></div>' +

      '<div class="field"><label>' + T('joinDate') + '</label>' +
        '<input id="f-join" type="date" value="' + esc(d.joinDate || S.todayISO()) + '" /></div>' +

      '<div class="field"><label>' + T('work') + '</label><div class="chips">' +
        TASKS.map(function (k) {
          var on = (d.tasks || []).indexOf(k) >= 0;
          return '<button type="button" class="chip sm ' + (on ? 'active' : '') + '" data-task="' + k + '">' + T(k) + '</button>';
        }).join('') + '</div></div>' +

      '<div class="field"><label>' + T('notes') + ' <span class="tiny muted">(' + T('optional') + ')</span></label>' +
        '<textarea id="f-note" placeholder="' + esc(T('notesHint')) + '">' + esc(d.note || '') + '</textarea></div>' +

      '<button class="btn" data-act="save-helper" data-id="' + (id || '') + '">' + T('save') + '</button><div style="height:10px"></div>';
  }

  function advanceForm() {
    return '' +
      '<div class="sheet-head"><h2>' + T('addEntry') + '</h2>' +
        '<button class="icon-btn dark" data-act="sheet-cancel">' +
        '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button></div>' +
      '<div class="seg" style="margin-bottom:16px">' +
        '<button type="button" class="active" data-act="atype" data-at="given">' + T('giveAdvance') + '</button>' +
        '<button type="button" data-act="atype" data-at="repaid">' + T('gotBack') + '</button>' +
        '<button type="button" data-act="atype" data-at="bonus">' + T('bonusType') + '</button>' +
      '</div>' +
      '<div class="field amount-big"><label>' + T('amount') + '</label>' +
        '<input id="a-amount" type="number" inputmode="numeric" min="0" placeholder="0" /></div>' +
      '<div class="chips" style="margin-bottom:14px">' +
        [100, 200, 500, 1000, 2000, 5000].map(function (v) {
          return '<button type="button" class="chip sm" data-act="quick-amt" data-v="' + v + '">+ ' + money(v) + '</button>';
        }).join('') + '</div>' +
      '<div class="field"><label>' + T('date') + '</label><input id="a-date" type="date" value="' + S.todayISO() + '" /></div>' +
      '<div class="field"><label>' + T('reason') + ' <span class="tiny muted">(' + T('optional') + ')</span></label>' +
        '<input id="a-note" type="text" placeholder="' + esc(T('reasonHint')) + '" /></div>' +
      '<button class="btn" data-act="save-advance">' + T('save') + '</button><div style="height:10px"></div>';
  }

  function payForm() {
    var h = currentHelper();
    var b = S.monthBalance(h, state.pay.y, state.pay.m);
    var val = Math.max(Math.round(b.remaining), 0);
    return '' +
      '<div class="sheet-head"><h2>' + T('payAmount') + '</h2>' +
        '<button class="icon-btn dark" data-act="sheet-cancel">' +
        '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button></div>' +
      '<div class="field amount-big"><label>' + T('amount') + '</label>' +
        '<input id="p-amount" type="number" inputmode="numeric" min="0" value="' + (val > 0 ? val : '') + '" placeholder="0" /></div>' +
      '<div class="chips" style="margin-bottom:14px">' +
        [500, 1000, 2000, 3000, 5000].map(function (v) {
          return '<button type="button" class="chip sm" data-act="pay-quick" data-v="' + v + '">' + money(v) + '</button>';
        }).join('') + '</div>' +
      '<button class="btn green" data-act="save-payment">' + T('markPaid') + '</button><div style="height:10px"></div>';
  }

  function pickHelperSheet(next) {
    var list = S.helpers().map(function (h) {
      return '<button class="btn ghost" style="justify-content:flex-start;margin-bottom:10px" data-act="pick-helper" data-id="' + h.id + '" data-next="' + next + '">' +
        '<span class="avatar" style="width:38px;height:38px;font-size:17px">' + esc(initial(h.name)) + '</span>' + esc(h.name) + '</button>';
    }).join('');
    openSheet('<div class="sheet-head"><h2>' + T('pickHelper') + '</h2>' +
      '<button class="icon-btn dark" data-act="sheet-cancel">' +
      '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button></div>' +
      list + '<div style="height:10px"></div>');
  }

  /* ---------------- share / backup ---------------- */
  function shareText(text, title) {
    try {
      if (window.Capacitor && Capacitor.isPluginAvailable && Capacitor.isPluginAvailable('Share') && Capacitor.Plugins.Share) {
        Capacitor.Plugins.Share.share({ title: title || T('appName'), text: text, dialogTitle: T('shareSummary') });
        return;
      }
    } catch (e) {}
    if (navigator.share) {
      navigator.share({ title: title || T('appName'), text: text }).catch(function () {});
      return;
    }
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  }

  function monthSummaryText() {
    var h = currentHelper();
    var y = state.pay.y, m = state.pay.m;
    var b = S.monthBalance(h, y, m);
    var hi = S.getLang() === 'hi';
    var lines = [];
    if (hi) {
      lines.push('*' + h.name + ' – ' + I18n.monthYear(y, m) + '*');
      lines.push('हाज़िरी: ' + b.stats.P + ' दिन, आधा दिन: ' + b.stats.H + ', ग़ैर हाज़िर: ' + b.stats.A);
      lines.push('कमाई: ' + money(b.stats.earned));
      lines.push('उधार कटौती: ' + money(Math.max(b.advance, 0)));
      lines.push('दिए जा चुके: ' + money(b.paid));
      lines.push(b.remaining >= 0 ? '*देने हैं: ' + money(b.remaining) + '*' : '*वापस लेने हैं: ' + money(-b.remaining) + '*');
    } else {
      lines.push('*' + h.name + ' – ' + I18n.monthYear(y, m) + '*');
      lines.push('Present: ' + b.stats.P + ' days, Half: ' + b.stats.H + ', Absent: ' + b.stats.A);
      lines.push('Earned: ' + money(b.stats.earned));
      lines.push('Advance deducted: ' + money(Math.max(b.advance, 0)));
      lines.push('Already paid: ' + money(b.paid));
      lines.push(b.remaining >= 0 ? '*Balance to pay: ' + money(b.remaining) + '*' : '*To recover: ' + money(-b.remaining) + '*');
    }
    return lines.join('\n');
  }

  function download(filename, text) {
    try {
      var blob = new Blob([text], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
      return true;
    } catch (e) { return false; }
  }

  /* ---------------- events ---------------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el) return;
    var act = el.dataset.act;
    var h = currentHelper();

    switch (act) {
      /* language */
      case 'set-lang':
        S.setLang(el.dataset.lang); render(); break;

      /* nav */
      case 'open-helper':
        state.helperId = el.dataset.id; go('helper', { id: el.dataset.id }); break;
      case 'go-calendar': go('calendar', { id: h.id }); break;
      case 'go-advance': go('advance', { id: h.id }); break;
      case 'go-pay': go('pay', { id: h.id }); break;
      case 'pick-helper':
        closeSheet(); state.helperId = el.dataset.id; go(el.dataset.next, { id: el.dataset.id }); break;

      /* helper CRUD */
      case 'add-helper': openSheet(helperForm(null)); break;
      case 'edit-helper': openSheet(helperForm(h.id)); break;
      case 'delete-helper':
        confirmSheet(T('deleteHelperConfirm', { n: h.name }), function () {
          S.deleteHelper(h.id); state.helperId = null; closeSheet(); go('home'); toast(T('delete'));
        });
        break;
      case 'save-helper': {
        var name = document.getElementById('f-name').value.trim();
        if (!name) { toast(T('errName')); break; }
        var ptBtn = document.querySelector('[data-act="pt"].active');
        var payType = ptBtn ? ptBtn.dataset.pt : 'monthly';
        var tasks = Array.prototype.map.call(document.querySelectorAll('.chip[data-task].active'), function (c) { return c.dataset.task; });
        var payload = {
          name: name,
          phone: document.getElementById('f-phone').value.trim(),
          payType: payType,
          salary: +document.getElementById('f-salary').value || 0,
          wage: +document.getElementById('f-wage').value || 0,
          joinDate: document.getElementById('f-join').value || S.todayISO(),
          tasks: tasks,
          note: document.getElementById('f-note').value.trim()
        };
        if (el.dataset.id) { S.updateHelper(el.dataset.id, payload); }
        else { var nh = S.addHelper(payload); state.helperId = nh.id; }
        closeSheet(); go('helper', { id: state.helperId }); toast(T('saved'));
        break;
      }
      case 'pt':
        Array.prototype.forEach.call(document.querySelectorAll('[data-act="pt"]'), function (b) { b.classList.toggle('active', b === el); });
        document.getElementById('f-salary-wrap').style.display = el.dataset.pt === 'monthly' ? '' : 'none';
        document.getElementById('f-wage-wrap').style.display = el.dataset.pt === 'daily' ? '' : 'none';
        break;

      /* attendance */
      case 'day': {
        var d = el.dataset.d;
        var order = ['P', 'A', 'H', 'L', null];   // tap cycles: empty -> present -> absent -> half -> holiday -> empty
        var cur = S.getDay(h.id, d);
        var next = order[(order.indexOf(cur) + 1) % order.length];
        S.setDay(h.id, d, next); render(); break;
      }
      case 'today-P':
      case 'today-A':
        S.setDay(el.dataset.id || h.id, S.todayISO(), act === 'today-P' ? 'P' : 'A');
        render(); toast(T('saved')); break;
      case 'cal-prev': state.cal = shift(state.cal, -1); render(); break;
      case 'cal-next': state.cal = shift(state.cal, 1); render(); break;
      case 'mark-all': S.markAllPresent(h.id, state.cal.y, state.cal.m); render(); toast(T('saved')); break;
      case 'clear-month':
        confirmSheet(T('clearMonthConfirm'), function () {
          S.clearMonth(h.id, state.cal.y, state.cal.m); closeSheet(); render();
        });
        break;

      /* advance */
      case 'add-entry': openSheet(advanceForm()); break;
      case 'atype':
        Array.prototype.forEach.call(document.querySelectorAll('[data-act="atype"]'), function (b) { b.classList.toggle('active', b === el); });
        break;
      case 'quick-amt': {
        var inp = document.getElementById('a-amount');
        inp.value = (+inp.value || 0) + (+el.dataset.v);
        break;
      }
      case 'save-advance': {
        var amt = +document.getElementById('a-amount').value;
        if (!amt || amt <= 0) { toast(T('errAmount')); break; }
        var typeBtn = document.querySelector('[data-act="atype"].active');
        S.addAdvance({
          helperId: h.id,
          amount: amt,
          date: document.getElementById('a-date').value || S.todayISO(),
          type: typeBtn ? typeBtn.dataset.at : 'given',
          note: document.getElementById('a-note').value.trim()
        });
        closeSheet(); render(); toast(T('saved'));
        break;
      }
      case 'del-advance':
        confirmSheet(T('deleteEntryConfirm'), function () {
          S.deleteAdvance(el.dataset.id); closeSheet(); render(); toast(T('entryDeleted'));
        });
        break;

      /* payments */
      case 'pay-prev': state.pay = shift(state.pay, -1); render(); break;
      case 'pay-next': state.pay = shift(state.pay, 1); render(); break;
      case 'pay-full': {
        var bal = S.monthBalance(h, state.pay.y, state.pay.m);
        if (Math.round(bal.remaining) <= 0) { toast(T('settled')); break; }
        S.addPayment({ helperId: h.id, month: S.monthKey(state.pay.y, state.pay.m), date: S.todayISO(), amount: Math.round(bal.remaining) });
        render(); toast(T('saved')); break;
      }
      case 'pay-custom': openSheet(payForm()); break;
      case 'pay-quick': document.getElementById('p-amount').value = el.dataset.v; break;
      case 'save-payment': {
        var pa = +document.getElementById('p-amount').value;
        if (!pa || pa <= 0) { toast(T('errAmount')); break; }
        S.addPayment({ helperId: h.id, month: S.monthKey(state.pay.y, state.pay.m), date: S.todayISO(), amount: pa });
        closeSheet(); render(); toast(T('saved')); break;
      }
      case 'del-payment':
        confirmSheet(T('deleteEntryConfirm'), function () {
          S.deletePayment(el.dataset.id); closeSheet(); render(); toast(T('entryDeleted'));
        });
        break;
      case 'share-summary': shareText(monthSummaryText()); break;

      /* settings */
      case 'set-basis': S.data.settings.salaryBasis = el.dataset.basis; S.save(); render(); break;
      case 'toggle-off': {
        var off = S.data.settings.weekOff || [];
        var i = off.indexOf(+el.dataset.dow);
        if (i >= 0) off.splice(i, 1); else off.push(+el.dataset.dow);
        S.data.settings.weekOff = off; S.save(); render(); break;
      }
      case 'export': {
        var name = 'househelp-backup-' + S.todayISO() + '.json';
        var ok = download(name, S.exportJSON());
        try {
          if (window.Capacitor && Capacitor.isPluginAvailable && Capacitor.isPluginAvailable('Share') && Capacitor.Plugins.Share) {
            Capacitor.Plugins.Share.share({ title: name, text: S.exportJSON(), dialogTitle: T('exportBtn') });
          }
        } catch (err) {}
        toast(ok ? T('exported') : T('exportBtn'));
        break;
      }
      case 'import': document.getElementById('importFile').click(); break;
      case 'reset-all':
        confirmSheet(T('resetConfirm'), function () { S.reset(); state.helperId = null; closeSheet(); go('home'); });
        break;

      /* sheet */
      case 'sheet-cancel': closeSheet(); break;
      case 'confirm-yes': if (state.pendingConfirm) state.pendingConfirm(); break;

      /* contacts */
      case 'call':
        if (h.phone) window.location.href = 'tel:' + h.phone.replace(/\D/g, '');
        else toast(T('phoneMissing'));
        break;
      case 'whatsapp':
        if (h.phone) window.open('https://wa.me/' + (h.phone.replace(/\D/g, '').length === 10 ? '91' : '') + h.phone.replace(/\D/g, ''), '_blank');
        else toast(T('phoneMissing'));
        break;
    }
  });

  /* task chips toggle inside sheet + prevent form submit */
  document.addEventListener('click', function (e) {
    var chip = e.target.closest('.chip[data-task]');
    if (chip) chip.classList.toggle('active');
  });

  /* language toggle in header */
  document.getElementById('langToggle').addEventListener('click', function (e) {
    var b = e.target.closest('.lang-btn');
    if (!b) return;
    S.setLang(b.dataset.lang); render();
  });

  /* back button */
  backBtn.addEventListener('click', function () {
    if (state.screen === 'helper') go('home');
    else if (state.screen === 'calendar') go('helper', { id: state.helperId });
    else if (state.screen === 'advance') go('helper', { id: state.helperId });
    else if (state.screen === 'pay') go('helper', { id: state.helperId });
    else go('home');
  });

  /* tab bar */
  document.getElementById('tabbar').addEventListener('click', function (e) {
    var t = e.target.closest('.tab');
    if (!t) return;
    var tab = t.dataset.tab;
    if (tab === 'home') { go('home'); return; }
    if (tab === 'more') { go('more'); return; }
    var helpers = S.helpers();
    if (!helpers.length) { toast(T('selectHelperFirst')); go('home'); return; }
    var known = helpers.some(function (x) { return x.id === state.helperId; });
    if (!known) state.helperId = helpers[0].id;
    if (helpers.length > 1 && (!known || tab === state.tab)) { pickHelperSheet(tab); return; }
    go(tab, { id: state.helperId });
  });

  /* FAB */
  fab.addEventListener('click', function () {
    if (state.screen === 'home') openSheet(helperForm(null));
    if (state.screen === 'advance') openSheet(advanceForm());
  });

  /* backdrop click closes sheet */
  sheetWrap.addEventListener('click', function (e) { if (e.target === sheetWrap) closeSheet(); });

  /* import file */
  document.getElementById('importFile').addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try { S.importJSON(r.result); toast(T('importedOk')); go('home'); }
      catch (err) { toast(T('importFail')); }
    };
    r.readAsText(f);
    e.target.value = '';
  });

  /* Android hardware / gesture back */
  function onDeviceBack() {
    if (!sheetWrap.classList.contains('hidden')) { closeSheet(); return; }
    if (state.screen === 'helper') { go('home'); return; }
    if (state.screen === 'calendar' || state.screen === 'advance' || state.screen === 'pay') {
      go('helper', { id: state.helperId }); return;
    }
    try {
      if (window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.App) Capacitor.Plugins.App.exitApp();
    } catch (e) {}
  }
  document.addEventListener('backbutton', onDeviceBack);
  try {
    if (window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.App) {
      Capacitor.Plugins.App.addListener('backButton', onDeviceBack);
    }
  } catch (e) {}

  function shift(c, delta) {
    var d = new Date(c.y, c.m + delta, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  }

  /* boot */
  render();
})();
