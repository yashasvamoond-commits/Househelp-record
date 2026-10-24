/* Local data store + salary/attendance maths. Everything stays on the phone. */
(function (global) {
  var KEY = 'househelp.record.v1';

  var DEFAULT = {
    version: 1,
    settings: {
      lang: 'hi',
      salaryBasis: 'working',   // '30' | 'working'
      weekOff: [0]              // 0 = Sunday
    },
    helpers: [],
    attendance: {},             // { helperId: { 'YYYY-MM-DD': 'P'|'A'|'H'|'L' } }
    advances: [],               // { id, helperId, date, amount, type:'given'|'repaid'|'bonus', note }
    payments: []                // { id, helperId, month:'YYYY-MM', date, amount }
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  var data = null;

  function load() {
    try {
      var raw = global.localStorage.getItem(KEY);
      data = raw ? JSON.parse(raw) : clone(DEFAULT);
    } catch (e) {
      data = clone(DEFAULT);
    }
    // fill missing bits (forward compatible)
    data.settings = Object.assign({}, DEFAULT.settings, data.settings || {});
    ['helpers', 'advances', 'payments'].forEach(function (k) { if (!Array.isArray(data[k])) data[k] = []; });
    if (!data.attendance) data.attendance = {};
    return data;
  }

  function save() {
    try { global.localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  var Store = {
    KEY: KEY,
    get data() { return data || load(); },
    load: load,
    save: save,
    uid: uid,

    /* ---------- settings ---------- */
    getLang: function () { return this.data.settings.lang || 'hi'; },
    setLang: function (l) { this.data.settings.lang = l; save(); },

    /* ---------- helpers ---------- */
    helpers: function () { return this.data.helpers; },
    helper: function (id) {
      return this.data.helpers.filter(function (h) { return h.id === id; })[0] || null;
    },
    addHelper: function (h) {
      h.id = uid(); h.createdAt = new Date().toISOString();
      this.data.helpers.push(h);
      this.data.attendance[h.id] = {};
      save(); return h;
    },
    updateHelper: function (id, patch) {
      var h = this.helper(id); if (!h) return null;
      Object.assign(h, patch); save(); return h;
    },
    deleteHelper: function (id) {
      this.data.helpers = this.data.helpers.filter(function (h) { return h.id !== id; });
      delete this.data.attendance[id];
      this.data.advances = this.data.advances.filter(function (a) { return a.helperId !== id; });
      this.data.payments = this.data.payments.filter(function (p) { return p.helperId !== id; });
      save();
    },

    /* ---------- attendance ---------- */
    monthKey: function (y, m) { return y + '-' + String(m + 1).padStart(2, '0'); },
    todayISO: function () { return iso(new Date()); },
    setDay: function (helperId, dateISO, status) {
      var map = this.data.attendance[helperId] || (this.data.attendance[helperId] = {});
      if (!status) delete map[dateISO]; else map[dateISO] = status;
      save();
    },
    getDay: function (helperId, dateISO) {
      var map = this.data.attendance[helperId];
      return map ? map[dateISO] : undefined;
    },
    monthMap: function (helperId, y, m) {
      var mk = this.monthKey(y, m);
      var map = this.data.attendance[helperId] || {};
      var out = {};
      Object.keys(map).forEach(function (d) { if (d.indexOf(mk) === 0) out[d] = map[d]; });
      return out;
    },
    markAllPresent: function (helperId, y, m) {
      var self = this;
      var off = this.data.settings.weekOff || [];
      var days = daysInMonth(y, m);
      var start = firstJoinLimit(helperId, y, m);
      for (var d = 1; d <= days; d++) {
        var dt = new Date(y, m, d);
        if (d < start) continue;
        if (dt > endOfToday()) continue;
        var isOff = off.indexOf(dt.getDay()) >= 0;
        self.setDay(helperId, iso(dt), isOff ? 'L' : 'P');
      }
    },
    clearMonth: function (helperId, y, m) {
      var mk = this.monthKey(y, m);
      var map = this.data.attendance[helperId] || {};
      Object.keys(map).forEach(function (d) { if (d.indexOf(mk) === 0) delete map[d]; });
      save();
    },

    /* ---------- advances ---------- */
    advances: function (helperId) {
      return this.data.advances
        .filter(function (a) { return a.helperId === helperId; })
        .sort(function (a, b) { return a.date < b.date ? 1 : (a.date > b.date ? -1 : 0); });
    },
    addAdvance: function (a) { a.id = uid(); this.data.advances.push(a); save(); return a; },
    deleteAdvance: function (id) {
      this.data.advances = this.data.advances.filter(function (a) { return a.id !== id; }); save();
    },
    /* positive = helper still owes us this much */
    advanceBalance: function (helperId) {
      var bal = 0;
      this.data.advances.forEach(function (a) {
        if (a.helperId !== helperId) return;
        if (a.type === 'given') bal += Number(a.amount) || 0;
        else if (a.type === 'repaid') bal -= Number(a.amount) || 0;
      });
      return bal;
    },
    bonusTotal: function (helperId) {
      var t = 0;
      this.data.advances.forEach(function (a) {
        if (a.helperId === helperId && a.type === 'bonus') t += Number(a.amount) || 0;
      });
      return t;
    },

    /* ---------- payments ---------- */
    payments: function (helperId, month) {
      return this.data.payments
        .filter(function (p) { return p.helperId === helperId && p.month === month; })
        .sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    },
    paidTotal: function (helperId, month) {
      var t = 0;
      this.data.payments.forEach(function (p) {
        if (p.helperId === helperId && p.month === month) t += Number(p.amount) || 0;
      });
      return t;
    },
    addPayment: function (p) { p.id = uid(); this.data.payments.push(p); save(); return p; },
    deletePayment: function (id) {
      this.data.payments = this.data.payments.filter(function (p) { return p.id !== id; }); save();
    },

    /* ---------- maths ---------- */
    workingDaysInMonth: function (y, m) {
      var off = this.data.settings.weekOff || [];
      var days = daysInMonth(y, m), n = 0;
      for (var d = 1; d <= days; d++) if (off.indexOf(new Date(y, m, d).getDay()) < 0) n++;
      return n || days;
    },
    perDay: function (helper, y, m) {
      if (!helper) return 0;
      if (helper.payType === 'daily') return Number(helper.wage) || 0;
      var salary = Number(helper.salary) || 0;
      if (this.data.settings.salaryBasis === 'working') {
        var wd = this.workingDaysInMonth(y, m);
        return wd ? salary / wd : 0;
      }
      return salary / 30;
    },
    /* full month money (before advance / payments) */
    monthFull: function (helper, y, m) {
      if (!helper) return 0;
      if (helper.payType === 'daily') return (Number(helper.wage) || 0) * this.workingDaysInMonth(y, m);
      return Number(helper.salary) || 0;
    },
    monthStats: function (helper, y, m) {
      var map = this.monthMap(helper.id, y, m);
      var s = { P: 0, A: 0, H: 0, L: 0 };
      Object.keys(map).forEach(function (d) { if (s[map[d]] !== undefined) s[map[d]]++; });
      var base = this.perDay(helper, y, m);
      var units = s.P + s.H * 0.5;
      var earned = units * base;
      var full = this.monthFull(helper, y, m);
      if (earned > full) earned = full;           // never pay more than the month's salary
      s.earned = earned;
      s.perDay = base;
      s.full = full;
      return s;
    },
    /* what is left to pay for the month */
    monthBalance: function (helper, y, m) {
      var mk = this.monthKey(y, m);
      var st = this.monthStats(helper, y, m);
      var adv = this.advanceBalance(helper.id);
      var paid = this.paidTotal(helper.id, mk);
      var due = st.earned - adv;
      return { stats: st, advance: adv, paid: paid, due: due, remaining: due - paid };
    },

    /* ---------- backup ---------- */
    exportJSON: function () { return JSON.stringify(this.data, null, 2); },
    importJSON: function (text) {
      var obj = JSON.parse(text);
      if (!obj || !Array.isArray(obj.helpers)) throw new Error('bad');
      data = Object.assign(clone(DEFAULT), obj);
      data.settings = Object.assign({}, DEFAULT.settings, obj.settings || {});
      save();
    },
    reset: function () { data = clone(DEFAULT); save(); }
  };

  /* ---------- helpers ---------- */
  function pad(n) { return String(n).padStart(2, '0'); }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
  function endOfToday() { var d = new Date(); d.setHours(23, 59, 59, 999); return d; }
  function firstJoinLimit(helperId, y, m) {
    var h = Store.helper(helperId);
    if (!h || !h.joinDate) return 1;
    var jy = +h.joinDate.slice(0, 4), jm = +h.joinDate.slice(5, 7) - 1, jd = +h.joinDate.slice(8, 10);
    if (y < jy || (y === jy && m < jm)) return 999;      // joined later
    if (y === jy && m === jm) return jd;
    return 1;
  }

  Store.iso = iso;
  Store.pad = pad;
  Store.daysInMonth = daysInMonth;
  Store.joinLimit = firstJoinLimit;

  global.HH = Store;
  global.HH.getLang = Store.getLang;
  load();
})(window);
