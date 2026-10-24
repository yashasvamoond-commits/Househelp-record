/* Bilingual dictionary (Hindi / English) */
(function (global) {
  var S = {
    appName:      { hi: 'कामवाली रिकॉर्ड', en: 'House Help Record' },
    home:         { hi: 'होम', en: 'Home' },
    attendance:   { hi: 'हाज़िरी', en: 'Attendance' },
    advance:      { hi: 'उधार', en: 'Advance' },
    more:         { hi: 'और', en: 'More' },

    /* common */
    save:         { hi: 'सेव करें', en: 'Save' },
    cancel:       { hi: 'रद्द', en: 'Cancel' },
    edit:         { hi: 'बदलें', en: 'Edit' },
    delete:       { hi: 'हटाएँ', en: 'Delete' },
    add:          { hi: 'जोड़ें', en: 'Add' },
    close:        { hi: 'बंद करें', en: 'Close' },
    back:         { hi: 'पीछे', en: 'Back' },
    optional:     { hi: 'ज़रूरी नहीं', en: 'optional' },
    today:        { hi: 'आज', en: 'Today' },
    noData:       { hi: 'कोई जानकारी नहीं', en: 'No data yet' },

    /* home */
    greet:        { hi: 'नमस्ते जी! 👋', en: 'Hello! 👋' },
    myHelpers:    { hi: 'मेरे काम वाले', en: 'My Helpers' },
    noHelpers:    { hi: 'अभी कोई काम वाला जोड़ा नहीं है।', en: 'No helper added yet.' },
    noHelpersSub: { hi: 'नीचे दिए बटन से अपनी कामवाली / कामवाले का नाम जोड़ें।', en: 'Tap the button below to add your house help.' },
    addHelper:    { hi: 'नया काम वाला जोड़ें', en: 'Add Helper' },
    helperCount:  { hi: '{n} काम वाले', en: '{n} helper(s)' },
    daysPresent:  { hi: '{n} दिन हाज़िर', en: '{n} days present' },
    salaryDue:    { hi: 'इस महीने सैलरी', en: 'Salary this month' },
    advDue:       { hi: 'उधार बाक़ी', en: 'Advance left' },
    workingSince: { hi: '{d} से काम पर', en: 'Working since {d}' },

    /* helper form */
    addHelperTitle:  { hi: 'नया काम वाला जोड़ें', en: 'Add Helper' },
    editHelperTitle: { hi: 'जानकारी बदलें', en: 'Edit Helper' },
    name:         { hi: 'नाम', en: 'Name' },
    nameHint:     { hi: 'जैसे: रानी बाई', en: 'e.g. Rani Bai' },
    phone:        { hi: 'फ़ोन नंबर', en: 'Phone number' },
    phoneHint:    { hi: '10 अंकों का मोबाइल नंबर', en: '10 digit mobile number' },
    payType:      { hi: 'पेमेंट का तरीका', en: 'Payment type' },
    monthly:      { hi: 'महीने के हिसाब से', en: 'Monthly salary' },
    daily:        { hi: 'दिन के हिसाब से', en: 'Daily wage' },
    salary:       { hi: 'महीने की सैलरी (₹)', en: 'Monthly salary (₹)' },
    wage:         { hi: 'एक दिन की मज़दूरी (₹)', en: 'Daily wage (₹)' },
    joinDate:     { hi: 'कब से काम पर आए', en: 'Joining date' },
    work:         { hi: 'कौन-कौन सा काम', en: 'Work done' },
    notes:        { hi: 'कोई और जानकारी', en: 'Notes' },
    notesHint:    { hi: 'जैसे: सुबह 9 से 11 बजे आती हैं', en: 'e.g. comes 9am to 11am' },
    errName:      { hi: 'कृपया नाम लिखें', en: 'Please enter a name' },
    errAmount:    { hi: 'कृपया रकम लिखें', en: 'Please enter an amount' },

    /* helper screen */
    phoneMissing: { hi: 'फ़ोन नंबर नहीं दिया', en: 'No phone number saved' },
    call:         { hi: 'कॉल करें', en: 'Call' },
    whatsapp:     { hi: 'व्हाट्सएप', en: 'WhatsApp' },
    editInfo:     { hi: 'जानकारी बदलें', en: 'Edit details' },
    monthSummary: { hi: 'इस महीने का हिसाब', en: 'This month' },
    btnCalendar:  { hi: 'हाज़िरी का कैलेंडर', en: 'Attendance Calendar' },
    btnAdvance:   { hi: 'उधार / पेशगी', en: 'Advance / Loan' },
    btnPay:       { hi: 'सैलरी का हिसाब', en: 'Salary & Payment' },
    deleteHelper: { hi: 'काम वाले को हटाएँ', en: 'Delete helper' },
    deleteHelperConfirm: { hi: 'क्या {n} की सारी जानकारी हटा दें? यह वापस नहीं आएगी।', en: 'Delete all records of {n}? This cannot be undone.' },
    markTodayPresent: { hi: 'आज हाज़िर ✔', en: 'Mark today present' },
    markTodayAbsent:  { hi: 'आज नहीं आए ✖', en: 'Mark today absent' },

    /* calendar */
    calTitle:     { hi: 'हाज़िरी', en: 'Attendance' },
    calHint:      { hi: 'किसी भी तारीख़ पर टैप करें, हालत बदल जाएगी।', en: 'Tap any date to change its status.' },
    present:      { hi: 'हाज़िर', en: 'Present' },
    absent:       { hi: 'ग़ैर हाज़िर', en: 'Absent' },
    half:         { hi: 'आधा दिन', en: 'Half day' },
    holiday:      { hi: 'छुट्टी', en: 'Holiday' },
    markAll:      { hi: 'पूरे महीने हाज़िरी', en: 'Mark all present' },
    clearMonth:   { hi: 'महीना साफ़ करें', en: 'Clear month' },
    clearMonthConfirm: { hi: 'इस महीने की पूरी हाज़िरी मिटा दें?', en: 'Clear attendance for this whole month?' },
    calSummary:   { hi: '{p} हाज़िर · {h} आधा · {a} ग़ैर · {l} छुट्टी', en: '{p} present · {h} half · {a} absent · {l} holiday' },
    perDay:       { hi: 'एक दिन का', en: 'Per day' },
    earned:       { hi: 'इस महीने की कमाई', en: 'Earned this month' },
    pickHelper:   { hi: 'किसकी जानकारी देखनी है?', en: 'Which helper?' },

    /* advance */
    advTitle:     { hi: 'उधार / पेशगी', en: 'Advance / Loan' },
    advHint:      { hi: 'काम वाले को दिए गए पैसे, वापसी और बख्शीश का हिसाब यहाँ रखें।', en: 'Keep a record of money given, repayments and gifts here.' },
    balance:      { hi: 'कुल बकाया', en: 'Total outstanding' },
    totalGiven:   { hi: 'कुल दिए', en: 'Total given' },
    totalRepaid:  { hi: 'वापस मिले', en: 'Repaid' },
    totalBonus:   { hi: 'बख्शीश', en: 'Bonus / Gift' },
    giveAdvance:  { hi: 'पैसे दिए (उधार)', en: 'Money given (Advance)' },
    gotBack:      { hi: 'वापस मिले', en: 'Repayment' },
    bonusType:    { hi: 'बख्शीश / उपहार', en: 'Bonus / Gift' },
    amount:       { hi: 'रकम (₹)', en: 'Amount (₹)' },
    date:         { hi: 'तारीख़', en: 'Date' },
    reason:       { hi: 'कारण', en: 'Reason' },
    reasonHint:   { hi: 'जैसे: बेटी की फ़ीस, डॉक्टर', en: 'e.g. daughter fees, doctor' },
    noEntries:    { hi: 'अभी कोई रकम दर्ज नहीं है।', en: 'No money record yet.' },
    entryDeleted: { hi: 'हिसाब हटा दिया', en: 'Record deleted' },
    tapToDelete: { hi: 'किसी भी पंक्ति पर टैप करें, वह हट जाएगी', en: 'Tap any row to delete it' },
    given:        { hi: 'दिए', en: 'Given' },
    repaid:       { hi: 'जमा', en: 'Repaid' },
    bonus:        { hi: 'बख्शीश', en: 'Bonus' },
    addEntry:     { hi: 'रकम जोड़ें', en: 'Add money record' },
    noReason:     { hi: 'कोई कारण नहीं', en: 'No reason' },
    deleteEntryConfirm: { hi: 'क्या यह हिसाब हटा दें?', en: 'Delete this record?' },

    /* salary / payment */
    payTitle:     { hi: 'सैलरी का हिसाब', en: 'Salary & Payment' },
    fullSalary:   { hi: 'पूरी सैलरी', en: 'Full salary' },
    advDeduct:    { hi: 'उधार कटौती', en: 'Advance deducted' },
    alreadyPaid:  { hi: 'पहले दिए', en: 'Already paid' },
    remaining:    { hi: 'देने हैं', en: 'Balance to pay' },
    toReceive:    { hi: 'वापस लेने हैं', en: 'Extra to recover' },
    settled:      { hi: 'पूरा हिसाब चुक गया 🎉', en: 'All settled 🎉' },
    payAmount:    { hi: 'कितने पैसे दे रहे हैं?', en: 'How much are you paying?' },
    markPaid:     { hi: 'पैसे दिए ✔', en: 'Mark as paid' },
    payFull:      { hi: 'पूरे पैसे दे दिए', en: 'Pay full balance' },
    paymentHistory: { hi: 'पहले के भुगतान', en: 'Payment history' },
    noPayments:   { hi: 'इस महीने कोई भुगतान नहीं हुआ।', en: 'No payment recorded this month.' },
    paidOn:       { hi: '{d} को दिए', en: 'Paid on {d}' },
    shareSummary: { hi: 'हिसाब WhatsApp पर भेजें', en: 'Share summary on WhatsApp' },

    /* more / settings */
    settings:     { hi: 'सेटिंग', en: 'Settings' },
    language:     { hi: 'भाषा', en: 'Language' },
    salaryBasis:  { hi: 'सैलरी का हिसाब', en: 'Salary calculation' },
    basis30:      { hi: '30 दिन पर', en: 'Divide by 30 days' },
    basisWork:    { hi: 'काम के दिनों पर', en: 'Divide by working days' },
    weekOff:      { hi: 'हफ़्ते की छुट्टी', en: 'Weekly off' },
    backup:       { hi: 'डेटा की सुरक्षा', en: 'Backup & Restore' },
    exportBtn:    { hi: 'बैकअप निकालें', en: 'Export backup file' },
    importBtn:    { hi: 'बैकअप वापस लाएँ', en: 'Restore from backup' },
    backupHint:   { hi: 'फ़ोन बदलते समय बैकअप फ़ाइल सेव कर लें, नए फ़ोन में वापस ला सकते हैं।', en: 'Save this file when changing phones, then restore it on the new phone.' },
    exported:     { hi: 'बैकअप फ़ाइल तैयार है', en: 'Backup file ready' },
    importedOk:   { hi: 'बैकअप वापस आ गया', en: 'Backup restored' },
    importFail:   { hi: 'यह फ़ाइल सही नहीं लगती', en: 'This file could not be read' },
    about:        { hi: 'ऐप के बारे में', en: 'About this app' },
    aboutText:    { hi: 'कामवाली रिकॉर्ड – घर के काम वालों की हाज़िरी, सैलरी और उधार का आसान खाता। आपका डेटा सिर्फ़ आपके फ़ोन में रहता है।', en: 'House Help Record – a simple register for attendance, salary and advances. All your data stays only on your phone.' },
    resetAll:     { hi: 'सब कुछ मिटाएँ', en: 'Erase all data' },
    resetConfirm: { hi: 'क्या सारा डेटा मिटा दें? यह वापस नहीं आएगा।', en: 'Erase everything? This cannot be undone.' },
    version:      { hi: 'संस्करण 1.0', en: 'Version 1.0' },
    howTo:        { hi: 'ऐप का इस्तेमाल कैसे करें', en: 'How to use' },
    howToText:    { hi: '1) “नया काम वाला जोड़ें” से नाम, फ़ोन और सैलरी डालें।\n2) हर दिन “हाज़िरी” टैब में तारीख़ पर टैप करके हाज़िर / ग़ैर हाज़िर चुनें।\n3) पैसे दिए हैं तो “उधार” टैब में लिख लें, सैलरी में अपने आप कट जाएगा।\n4) महीने के आख़िर में “सैलरी का हिसाब” से पैसे दिए दर्ज करें।', en: '1) Add your helper with name, phone and salary.\n2) Every day tap the date in the Attendance tab to mark present / absent.\n3) Record any money given in the Advance tab — it is cut from the salary automatically.\n4) At month end, record the payment in Salary & Payment.' },

    /* tasks */
    t_sweep:   { hi: 'झाड़ू-पोंछा', en: 'Sweeping & mopping' },
    t_utensils:{ hi: 'बर्तन', en: 'Utensils' },
    t_clothes: { hi: 'कपड़े', en: 'Laundry' },
    t_cooking: { hi: 'खाना', en: 'Cooking' },
    t_dust:    { hi: 'डस्टिंग', en: 'Dusting' },
    t_bath:    { hi: 'बाथरूम', en: 'Bathroom' },
    t_kids:    { hi: 'बच्चे संभालना', en: 'Looking after kids' },
    t_other:   { hi: 'अन्य', en: 'Other' },

    /* misc */
    dayShort: { hi: 'दिन', en: 'days' },
    notJoinedYet: { hi: 'अभी काम पर नहीं आए', en: 'Not joined yet' },
    saved:   { hi: 'सेव हो गया', en: 'Saved' },
    selectHelperFirst: { hi: 'पहले काम वाले को चुनें', en: 'Please select a helper first' }
  };

  var MONTHS = {
    hi: ['जनवरी','फ़रवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्टूबर','नवंबर','दिसंबर'],
    en: ['January','February','March','April','May','June','July','August','September','October','November','December']
  };
  var MONTHS_SHORT = {
    hi: ['जन','फ़र','मार्च','अप्रै','मई','जून','जुलाई','अग','सित','अक्टू','नवं','दिसं'],
    en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  };
  var DOW = {
    hi: ['र','सो','मं','बु','गु','शु','श'],
    en: ['S','M','T','W','T','F','S']
  };
  var DOW_FULL = {
    hi: ['रवि','सोम','मंगल','बुध','गुरु','शुक्र','शनि'],
    en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  };

  var I18n = {
    strings: S,
    monthNames: MONTHS,
    monthShort: MONTHS_SHORT,
    dow: DOW,
    dowFull: DOW_FULL,
    t: function (key, vars) {
      var entry = S[key];
      if (!entry) return key;
      var lang = (global.HH && global.HH.getLang) ? global.HH.getLang() : 'hi';
      var out = entry[lang] != null ? entry[lang] : entry.en;
      if (vars) {
        Object.keys(vars).forEach(function (k) {
          out = out.split('{' + k + '}').join(vars[k]);
        });
      }
      return out;
    },
    /* money in Indian format, e.g. ₹1,200 */
    money: function (n) {
      var v = Math.round(Number(n) || 0);
      return '₹' + v.toLocaleString('en-IN');
    },
    /* '2026-10-24' -> '24 अक्टूबर 2026' / '24 Oct 2026' */
    date: function (iso, short) {
      if (!iso) return '';
      var p = String(iso).split('-');
      var lang = (global.HH && global.HH.getLang) ? global.HH.getLang() : 'hi';
      var mi = parseInt(p[1], 10) - 1;
      var months = short ? MONTHS_SHORT[lang] : MONTHS[lang];
      return parseInt(p[2], 10) + ' ' + months[mi] + ' ' + p[0];
    },
    monthYear: function (y, m) {
      var lang = (global.HH && global.HH.getLang) ? global.HH.getLang() : 'hi';
      return MONTHS[lang][m] + ' ' + y;
    }
  };

  global.I18n = I18n;
})(window);
