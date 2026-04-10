# 🔍 Clickbait vs Reality

> A Chrome Extension that uses Claude AI to rate every news headline on the page — **Honest**, **Misleading**, or **Clickbait** — in real time.

---

## 📹 Demo Video

[Demo Video]https://www.youtube.com/watch?v=ZP-xT5XzqAY


---

## ✨ What It Does

Open any news website and instantly see AI-powered badges on every headline:

| Badge | Meaning |
|-------|---------|
| 🟢 **Honest** | Headline accurately reflects the content |
| 🟡 **Misleading** | Exaggerates, omits context, or is vague to bait clicks |
| 🔴 **Clickbait** | Pure shock/curiosity tactics with no real substance |

Hover over any badge to see **Claude's reason** in a tooltip.

---

## 🖼️ Screenshots

### BBC Homepage — Before & After
Before
<img width="1397" height="892" alt="image" src="https://github.com/user-attachments/assets/5f9bd236-071d-4b70-9fe7-96d04d76e18a" />

After

<img width="1679" height="946" alt="image" src="https://github.com/user-attachments/assets/5e7db05b-2430-4764-ae58-aaa7c36dd880" />

---

## 🚀 How to Install

### Step 1 — Get an Anthropic API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up / Log in
3. Go to **Settings → API Keys → Create Key**
4. Add credits under **Settings → Billing**

### Step 2 — Set up the extension
1. Clone or download this repository
2. Copy `config.example.js` → rename it to `config.js`
3. Open `config.js` and paste your API key:
   ```js
   const API_KEY = 'sk-ant-api03-your-key-here';
   ```

### Step 3 — Load in Chrome
1. Open Chrome → go to `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `clickbait-vs-reality` folder
5. Pin the extension from the 🧩 toolbar menu

---

## 🎯 How to Use

### Auto-scan
The extension **automatically scans** any page with 5 or more headlines. Just open a news site and wait ~1.5 seconds — badges appear on their own.

### Manual scan
Click the extension icon → **⚡ Scan This Page**

Works on:
- bbc.com
- ndtv.com
- timesofindia.com
- thehindu.com
- cnn.com
- reuters.com
- Any news site with `<h1>` / `<h2>` / `<h3>` headlines

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Extension | Chrome Manifest V3 |
| AI Model | Claude Haiku (`claude-haiku-4-5`) via Anthropic API |
| Language | Vanilla JavaScript, HTML, CSS |
| Storage | None — fully stateless |

---

## 📁 Project Structure

```
clickbait-vs-reality/
├── manifest.json        # Chrome extension config
├── background.js        # Service worker — calls Claude API
├── content.js           # Injected into pages — finds headlines, adds badges
├── content.css          # Badge styles
├── popup.html           # Extension popup UI
├── popup.css            # Popup styles
├── popup.js             # Popup logic — triggers manual scan
├── config.example.js    # API key template (safe to share)
├── config.js            # ⚠️ Your actual API key — git-ignored
└── .gitignore           # Excludes config.js from version control
```

---

## 💡 How It Works

```
User opens news page
        ↓
content.js finds all h1/h2/h3 headlines
        ↓
Sends headline list to background.js (service worker)
        ↓
background.js calls Claude Haiku API in one batch request
        ↓
Claude returns JSON: [{id, rating, reason}, ...]
        ↓
content.js injects color-coded badges next to each headline
        ↓
User hovers badge → sees Claude's reason as tooltip
```

---

## ⚙️ Cost

Claude Haiku is extremely cheap. Scanning 30 headlines costs roughly **$0.001** (one tenth of a cent). A $5 credit covers ~5,000 page scans.

---

## ⚠️ Security Note

- Your API key lives only in `config.js` which is **git-ignored**
- The key is never sent to any server other than Anthropic's API
- Do **not** commit `config.js` — use `config.example.js` as the template

---

## 👤 Author

**@sjkforce**
Built as part of a Chrome Extension development course assignment.

---

## 📄 License

MIT
