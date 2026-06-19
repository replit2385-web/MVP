# 🛬 Droplane

> Suno AI music — from upload to launch in 5 steps.

A single-file MVP workflow tool for independent producers distributing AI-assisted tracks. Takes your Suno audio file through metadata generation, DistroKid pre-fill, AI-written social content, and a full launch checklist — in one browser session, with no installs.

---

## What It Does

| Step | What Happens |
|------|-------------|
| **1 · Upload** | Drop your audio file. Auto-detects duration, format, and BPM via Web Audio API. |
| **2 · Metadata** | Claude generates title options, subgenre, mood, key, and SEO description. You review, edit, and apply. |
| **3 · Distribute** | Pre-fills every DistroKid field. Copy each value directly into the upload form. Includes AI disclosure reminder. |
| **4 · Social** | Claude writes TikTok caption, YouTube title + description, Instagram caption, SubmitHub pitch, and X post in one call. All copyable. |
| **5 · Launch** | Timed checklist covering 3 weeks before → 30 days after release. Progress bar. BMI registration reminder. |

---

## Quick Start (MVP)

No build step. No npm. Just open the file.

```bash
# Option A — open directly in browser
open droplane.html

# Option B — serve locally (avoids any file:// clipboard restrictions)
npx serve .
# then open http://localhost:3000/droplane.html
```

The Anthropic API is pre-configured in this environment. Steps 2 and 4 call Claude Sonnet directly from the browser.

> **Note on API key:** When running outside claude.ai (e.g. a standalone server), you'll need to add your Anthropic API key. See [Configuration](#configuration) below.

---

## Configuration

When running standalone, add your API key to the fetch headers in `droplane.html`:

```javascript
// Find both fetch() calls in the <script type="text/babel"> block
// and add the Authorization header:

headers: {
  "Content-Type": "application/json",
  "x-api-key": "YOUR_ANTHROPIC_API_KEY_HERE",
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true"
}
```

> ⚠️ Do not expose API keys in a public-facing deployment. Use a backend proxy for production (covered in the Codespaces modular build).

---

## Modular Structure (Post-Codespaces)

Once you open this in Codespaces, the plan is to break the single-file build into a proper React project:

```
droplane/
├── public/
│   └── index.html
├── src/
│   ├── main.jsx              ← ReactDOM.createRoot entry
│   ├── App.jsx               ← Step router + shared state
│   ├── constants/
│   │   └── index.js          ← STEPS, GENRES, MOODS
│   ├── hooks/
│   │   ├── useTrack.js       ← track state + upd()
│   │   ├── useBPM.js         ← Web Audio API BPM detection
│   │   └── useClipboard.js   ← copy + timeout logic
│   ├── api/
│   │   └── claude.js         ← genMeta() + genSocial() fetch calls
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Field.jsx
│   │   │   ├── TxtInput.jsx
│   │   │   ├── SelInput.jsx
│   │   │   ├── Toggle.jsx
│   │   │   ├── CopyBtn.jsx
│   │   │   ├── AIBtn.jsx
│   │   │   ├── ContentBox.jsx
│   │   │   ├── CheckRow.jsx
│   │   │   ├── SectionHead.jsx
│   │   │   └── GroupLabel.jsx
│   │   ├── StepNav.jsx       ← header step indicator
│   │   └── steps/
│   │       ├── Step1Upload.jsx
│   │       ├── Step2Metadata.jsx
│   │       ├── Step3Distribute.jsx
│   │       ├── Step4Social.jsx
│   │       └── Step5Launch.jsx
│   └── styles/
│       └── tokens.js         ← S.card, S.label, S.pill, etc.
├── droplane.html             ← single-file MVP (this file)
├── .env.example
├── package.json
└── README.md
```

### Scaffold Command (Codespaces)

```bash
npm create vite@latest droplane-app -- --template react
cd droplane-app
npm install
```

Then pull the single-file MVP and start extracting components one at a time. The component boundaries are already cleanly separated in `droplane.html` — each `const StepN = () =>` block becomes its own file.

---

## Roadmap

### Phase 1 — Modular (Codespaces)
- [ ] Extract into React component files per structure above
- [ ] Add `.env` support for API key via Vite
- [ ] Add backend proxy for Anthropic API (Node.js / Express)
- [ ] Add cover art generator via Ideogram API
- [ ] Add ISRC tracker (local state → export to CSV)

### Phase 2 — Features
- [ ] YouTube upload automation (YouTube Data API v3)
- [ ] TikTok scheduled post (TikTok Content Posting API)
- [ ] Instagram Reels scheduled post (Meta Graph API)
- [ ] SoundCloud upload (SoundCloud API)
- [ ] DistroKid form auto-fill via browser extension or Puppeteer script
- [ ] SubmitHub batch submission queue

### Phase 3 — Analytics
- [ ] Spotify for Artists data pull (Spotify Web API)
- [ ] DistroKid revenue aggregation
- [ ] YouTube Analytics integration
- [ ] Unified revenue dashboard with chart.js or recharts

### Phase 4 — Platform (Optional SaaS)
- [ ] Multi-user auth (Clerk or Supabase Auth)
- [ ] Track library (PostgreSQL)
- [ ] Team/label accounts
- [ ] Release calendar

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| UI | React 18 | Component model, hooks |
| Transpiler (MVP) | Babel Standalone | Zero build step for single-file |
| Build (modular) | Vite | Fast HMR, minimal config |
| AI | Anthropic Claude Sonnet 4.6 | Metadata + social content generation |
| Audio | Web Audio API (native) | BPM detection, no library needed |
| Styling | Inline styles (MVP) → CSS tokens (modular) | No Tailwind required |
| Deploy | Netlify / Vercel | Static frontend, no server needed for MVP |
| Backend (Phase 2) | Node.js + Express on Oracle Cloud Always Free | API proxy, scheduled jobs |

---

## Rights & Legal Notes

This tool is built for Suno AI tracks generated on **Pro or Premier** subscription tiers. Key points:

- **Commercial rights** are granted by Suno to paid subscribers for tracks generated during an active subscription
- **AI disclosure** is required by Spotify and Apple Music (DDEX standard) — the tool enforces this
- **BMI registration** for hybrid (human + AI) works has been accepted since October 2025, provided there is documented human authorship (original lyrics, vocal performance, etc.)
- **Copyright protection** requires human authorship — purely AI-generated audio is not copyrightable in the US as of 2026

This tool does not provide legal advice. Consult an entertainment attorney for your specific situation.

---

## File Reference

```
droplane.html          ← MVP: open in browser, everything runs client-side
droplane-mvp.jsx       ← Same component as .jsx for Codespaces import reference
suno-monetization-masterclass.md  ← Full monetization reference document
README.md              ← This file
```

---

*Built with Claude · Droplane MVP · June 2026*
