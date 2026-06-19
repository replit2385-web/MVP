# 🛬 Droplane — Modular Build

A modular React application for AI-assisted music distribution. Takes your Suno track through metadata generation, DistroKid pre-fill, social content creation, and launch planning — all in one browser session.

## Project Structure

```
droplane/
├── public/
│   └── index.html                 ← Vite entry point
├── src/
│   ├── main.jsx                   ← ReactDOM root
│   ├── App.jsx                    ← Main step router + state management
│   ├── api/
│   │   └── claude.js              ← genMeta() + genSocial() API calls
│   ├── components/
│   │   ├── StepNav.jsx            ← Step indicator header
│   │   ├── ui/
│   │   │   ├── Field.jsx          ← Label + children wrapper
│   │   │   ├── TxtInput.jsx       ← Text input component
│   │   │   ├── SelInput.jsx       ← Select/dropdown component
│   │   │   ├── Toggle.jsx         ← Checkbox wrapper
│   │   │   ├── CopyBtn.jsx        ← Copy to clipboard button
│   │   │   ├── AIBtn.jsx          ← AI generation button
│   │   │   ├── ContentBox.jsx     ← Card container
│   │   │   ├── CheckRow.jsx       ← Checkbox + label row
│   │   │   ├── SectionHead.jsx    ← Section title
│   │   │   └── GroupLabel.jsx     ← Group label divider
│   │   └── steps/
│   │       ├── Step1Upload.jsx    ← Audio upload + BPM detection
│   │       ├── Step2Metadata.jsx  ← Track metadata editor
│   │       ├── Step3Distribute.jsx ← DistroKid field copier
│   │       ├── Step4Social.jsx    ← Social media content display
│   │       └── Step5Launch.jsx    ← Release checklist
│   ├── constants/
│   │   └── index.js               ← STEPS, GENRES, MOODS, INITIAL_TRACK
│   ├── hooks/
│   │   ├── useTrack.js            ← Track state management
│   │   ├── useBPM.js              ← Web Audio API BPM detection
│   │   └── useClipboard.js        ← Copy to clipboard utility
│   ├── styles/
│   │   ├── global.css             ← Global styles + animations
│   │   └── tokens.js              ← Design tokens (S object)
│   └── utils/
│       └── formatters.js          ← Time + filesize formatters
├── .env.example                    ← API key template
├── .gitignore
├── package.json
├── vite.config.js
└── README.md (this file)
```

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Key
Create a `.env` file from the template:
```bash
cp .env.example .env
```

Then add your Anthropic API key:
```env
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Get your key from [console.anthropic.com](https://console.anthropic.com)

### 3. Start Development Server
```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
```

Output goes to `dist/`

## Features

### Step 1: Upload
- Drag-and-drop audio file upload
- Auto-detects format (MP3, WAV, FLAC, M4A, AAC)
- Web Audio API BPM detection
- File duration & size display

### Step 2: Metadata
- Claude AI generates title suggestions, subgenre, mood, key
- Manual metadata editing
- SEO description with character counter
- Apply AI suggestions with one click

### Step 3: Distribute
- Copy/paste fields directly to DistroKid
- Pre-filled with track metadata
- AI disclosure reminder
- One-click copy for each field

### Step 4: Social
- Claude AI generates platform-specific content:
  - TikTok caption
  - YouTube title + description
  - Instagram caption
  - SubmitHub pitch
  - X (Twitter) post
- One-click copy for each platform

### Step 5: Launch
- 3-week pre-release → 30-day post-launch checklist
- Progress tracking with progress bar
- Phase-based organization (Before, Week of, Post-Release)
- Includes BMI registration reminders

## Component Design

### UI Components (`src/components/ui/`)
Reusable, unstyled (style props only):
- `Field` — Label wrapper with optional hint text
- `TxtInput` — Text/number input with S.input styling
- `SelInput` — Dropdown select with S.input styling
- `Toggle` — Checkbox with label
- `CopyBtn` — Clipboard button with feedback
- `AIBtn` — API call trigger with loading state
- `ContentBox` — Card container (S.card styling)
- `CheckRow` — Checkbox + label + hint row
- `SectionHead` — Section title + subtitle
- `GroupLabel` — Section divider label

### Step Components (`src/components/steps/`)
Each step is a self-contained page:
- Handles its own state (e.g., `copied` in Step4Social)
- Receives data via props
- Updates parent via callback functions
- Navigation buttons (← Back, Continue →)

### Design Tokens (`src/styles/tokens.js`)
The `S` object contains all reusable style objects:
- `S.card`, `S.infoCard`, `S.warnCard`, `S.successCard` — Container styles
- `S.input` — Input/textarea/select default styles
- `S.label` — Label text styles
- `S.pill(active)` — Step nav pill styles

## API Integration

### Claude API (`src/api/claude.js`)

#### `genMeta(track)`
Generates metadata suggestions:
```javascript
const result = await genMeta(track)
// Returns: { titleSuggestions, subgenre, mood, key, description, seoKeywords }
```

#### `genSocial(track)`
Generates social media content:
```javascript
const result = await genSocial(track)
// Returns: { tiktokCaption, youtubeVideoTitle, youtubeDescription, instagramCaption, submithubPitch, twitterPost }
```

## Hooks

### `useTrack()`
Manages track state:
```javascript
const { track, updateTrack, resetTrack } = useTrack()
updateTrack({ title: 'New Title', bpm: '120' })
```

### `useBPM()`
Detects BPM from audio file:
```javascript
const { detectBPM, bpmStatus } = useBPM()
const bpm = await detectBPM(audioFile)
```

### `useClipboard()`
Clipboard management:
```javascript
const { copy, copied } = useClipboard()
copy(text, key)
// copied === key when active
```

## Environment Variables

- `VITE_ANTHROPIC_API_KEY` — Anthropic API key for Claude calls
- Falls back to `window.ANTHROPIC_API_KEY` if not set

## Technologies

- **React 18** — UI framework
- **Vite** — Build tool & dev server
- **Web Audio API** — BPM detection
- **Claude API** — AI metadata & content generation
- **CSS-in-JS** — Inline styles for component encapsulation

## Security Notes

⚠️ **Do NOT commit `.env` file** — API keys are credentials

For production deployment:
1. Use a backend proxy for Claude API calls
2. Keep API keys server-side only
3. Implement proper authentication

## Future Enhancements

- [ ] Persistent storage (localStorage or IndexedDB)
- [ ] Release history / drafts
- [ ] Batch upload multiple tracks
- [ ] Playlist templates
- [ ] Analytics dashboard
- [ ] Integrations (Genius, MusicBrainz)
- [ ] Dark/light theme toggle
- [ ] Mobile optimization

## License

MIT

---

Built with ❤️ for independent producers using Suno AI
