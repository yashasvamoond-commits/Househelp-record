# कामवाली रिकॉर्ड · House Help Record

A very simple, very friendly Android app for Indian households to keep a register of the
house help (कामवाली / कामवाला / maid / cook / cleaner):

- **Attendance calendar** – tap any date to cycle *Present ✔ → Absent ✖ → Half day ◐ → Holiday – → clear*
- **Salary auto-calculated** from the days she actually came
- **Advance / loan (उधार / पेशगी)** register with repayments and *bakhshish* (gift/bonus)
- **Salary & payment** screen with payment history
- **Call / WhatsApp** shortcuts on every helper
- **Share the monthly account** on WhatsApp in one tap
- **Backup & restore** to a file (nothing leaves the phone)
- **हिंदी ⇄ English** toggle in the top-right corner – every screen, instantly

The UI uses big buttons, big fonts and plain words so it can be used without any training.
All data is stored only on the phone (`localStorage`); nothing is uploaded anywhere.

---

## 📲 Install the APK

Download the APK from the latest release and install it:

**👉 <https://github.com/yashasvamoond-commits/Househelp-record/releases/latest/download/HouseHelp-Record.apk>**

On the phone:

1. Open this link in Chrome on your Android phone.
2. When Android asks, allow **“Install unknown apps”** for the browser (Settings → Apps → Chrome → Install unknown apps), then tap **Install**.
3. Open **कामवाली रिकॉर्ड (House Help Record)** from the app drawer.

*Minimum: Android 6.0 (API 23) or newer. Works fully offline.*

The same folder also works as a **web app / PWA** – open `index.html` from any browser and
“Add to Home screen”.

---

## 🧭 Screens

| Tab | What it does |
| --- | --- |
| **होम Home** | Card per helper: days present this month, salary due, advance left. `+` adds a helper. |
| **हाज़िरी Attendance** | Month calendar. Tap a date to change status. “Mark all present” fills the month (weekly off stays a holiday). Shows days, per-day rate and money earned. |
| **उधार Advance** | Money given, repayments, and gifts. Big “कुल बकाया / outstanding” number. Tap a row to delete it. |
| **और More** | Language, salary calculation basis, weekly off, backup/restore, how-to-use, erase all. |

Helper detail screen: call, WhatsApp, mark today present/absent, calendar, advance, salary.

---

## 🧮 How the money is calculated

- **Monthly pay** – per-day rate = monthly salary ÷ working days in that month
  (weekly off excluded). Switchable in *More → Salary calculation* to “divide by 30 days”.
- **Daily wage** – per-day rate = the daily wage entered for the helper.
- Earned = present days + half days × 0.5 (never more than the full month salary).
- Balance to pay = earned − advance outstanding − payments already made.

---

## 🛠 Project layout

```
www/                 the whole app (plain HTML/CSS/JS, no build step)
  index.html
  css/app.css
  js/i18n.js         Hindi / English dictionary
  js/store.js        data model + salary maths (localStorage)
  js/app.js          screens and interactions
resources/           icon.png, splash.png, icon-source.png
scripts/make_icons.py  fallback icon generator
capacitor.config.json  Android wrapper config (appId com.househelp.record)
.github/workflows/build-apk.yml   builds + signs + publishes the APK
```

## 🔨 Build the APK yourself

```bash
npm install
npx cap add android      # first time only
npx cap sync android
npx cap open android     # or: cd android && ./gradlew assembleDebug
```

Every push of a `v*` tag runs **Build Android APK** in GitHub Actions, which:

1. installs Node + Java 17,
2. `cap sync` the web app into the Android project,
3. generates launcher icons,
4. builds a release APK, zipaligns and signs it,
5. attaches **`HouseHelp-Record.apk`** to the GitHub release for that tag.

### Signing key

If the repository secret `SIGNING_KEYSTORE_BASE64` (base64 of a `.jks` with alias
`househelp`, store/key password `househelp`) is **not** set, the workflow generates a
one-off key for that build. Set the secret before publishing a *second* release so
updates install over the previous version:

```bash
keytool -genkeypair -v -keystore househelp.jks -alias househelp -keyalg RSA -keysize 2048 \
  -validity 10950 -storepass househelp -keypass househelp \
  -dname "CN=House Help Record, OU=Home, O=HouseHelp, L=Jaipur, ST=Rajasthan, C=IN"
base64 -w0 househelp.jks | gh secret set SIGNING_KEYSTORE_BASE64
```

---

## 🙏 Notes

- Hindi is the default language; one tap in the header switches to English.
- Weekly off defaults to Sunday and can be changed to any days in *More*.
- Free and private: no ads, no analytics, no internet permission needed.
