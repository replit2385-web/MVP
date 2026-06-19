import { useState, useRef, useCallback } from "react"

const STEPS = [
  { n: 1, label: "Upload" },
  { n: 2, label: "Metadata" },
  { n: 3, label: "Distribute" },
  { n: 4, label: "Social" },
  { n: 5, label: "Launch" },
]

const GENRES = [
  "Hip-Hop/Rap", "R&B/Soul", "Trap", "Boom Bap", "Lo-Fi Hip-Hop",
  "Drill", "Conscious Rap", "Alt Hip-Hop", "Pop", "Electronic", "Gospel", "Neo-Soul"
]

const MOODS = [
  "Dark","Chill","Aggressive","Melancholic","Motivational",
  "Nostalgic","Energetic","Introspective","Triumphant","Romantic","Smooth","Hard"
]

export default function Droplane() {
  const [step, setStep] = useState(1)
  const [track, setTrack] = useState({
    file: null, fileName: "", duration: 0, fileSize: 0, format: "",
    bpm: "", title: "", artist: "", genre: "Hip-Hop/Rap", subgenre: "",
    mood: "", key: "", explicit: false, language: "en",
    releaseDate: "", copyrightOwner: "", aiDisclosure: true, description: "",
  })
  const [aiMeta, setAiMeta] = useState(null)
  const [social, setSocial] = useState(null)
  const [loading, setLoading] = useState("")
  const [bpmStatus, setBpmStatus] = useState("")
  const [copied, setCopied] = useState("")
  const [checks, setChecks] = useState({})
  const fileRef = useRef()

  // ── utils ────────────────────────────────────────────────
  const fmt = {
    dur: s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`,
    mb: b => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`,
  }
  const upd = u => setTrack(p => ({ ...p, ...u }))
  const cp = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(""), 2000)
  }
  const toggleCheck = k => setChecks(p => ({ ...p, [k]: !p[k] }))

  // ── bpm detection ────────────────────────────────────────
  const detectBPM = async file => {
    setBpmStatus("analyzing")
    try {
      const ab = await file.arrayBuffer()
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const buf = await ctx.decodeAudioData(ab)
      const sr = buf.sampleRate, raw = buf.getChannelData(0)
      const cap = Math.min(raw.length, sr * 45)
      const win = Math.floor(sr * 0.025)
      const energies = []
      for (let i = 0; i < cap - win; i += win) {
        let e = 0
        for (let j = i; j < i + win; j++) e += raw[j] * raw[j]
        energies.push(e / win)
      }
      const avg = energies.reduce((a, b) => a + b, 0) / energies.length
      const thresh = avg * 1.35
      const peaks = []
      for (let i = 3; i < energies.length - 3; i++) {
        if (energies[i] > thresh &&
          energies[i] >= energies[i - 1] && energies[i] >= energies[i + 1] &&
          energies[i] >= energies[i - 2] && energies[i] >= energies[i + 2]) {
          if (!peaks.length || i - peaks[peaks.length - 1] > 4) peaks.push(i)
        }
      }
      if (peaks.length < 4) { setBpmStatus("failed"); ctx.close(); return }
      const ivls = []
      for (let i = 1; i < peaks.length; i++) ivls.push(peaks[i] - peaks[i - 1])
      ivls.sort((a, b) => a - b)
      const med = ivls[Math.floor(ivls.length / 2)]
      let bpm = Math.round(60 / ((med * win) / sr))
      while (bpm > 180) bpm = Math.round(bpm / 2)
      while (bpm < 55) bpm *= 2
      ctx.close()
      upd({ bpm: String(Math.min(200, Math.max(55, bpm))) })
      setBpmStatus("done")
    } catch { setBpmStatus("failed") }
  }

  // ── file handler ─────────────────────────────────────────
  const onFile = async file => {
    if (!file) return
    const ext = file.name.split(".").pop().toLowerCase()
    if (!["mp3", "wav", "flac", "m4a", "aac"].includes(ext)) {
      alert("Upload MP3, WAV, FLAC, or M4A"); return
    }
    const url = URL.createObjectURL(file)
    const audio = new Audio(url)
    await new Promise(res => audio.addEventListener("loadedmetadata", res, { once: true }))
    const clean = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase())
    upd({ file, fileName: file.name, duration: audio.duration, fileSize: file.size, format: ext.toUpperCase(), title: clean })
    URL.revokeObjectURL(url)
    await detectBPM(file)
  }
  const onDrop = useCallback(e => { e.preventDefault(); onFile(e.dataTransfer.files[0]) }, [])
  const onDragOver = useCallback(e => e.preventDefault(), [])

  // ── claude calls ─────────────────────────────────────────
  const genMeta = async () => {
    setLoading("meta")
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 1000,
          messages: [{
            role: "user", content:
              `Music metadata expert, hip-hop/R&B focus. Generate streaming metadata for this AI-assisted track.
Track: "${track.title}" | BPM: ${track.bpm || "unknown"} | Genre: ${track.genre} | File: ${track.fileName}
Return ONLY valid JSON, no markdown, no commentary:
{"titleSuggestions":["option1","option2","option3"],"subgenre":"specific subgenre string","mood":"3-4 comma-separated mood words","key":"e.g. F# minor or C major","description":"90 char max streaming description, no quotes","seoKeywords":["kw1","kw2","kw3","kw4","kw5","kw6","kw7","kw8"]}`
          }]
        })
      })
      const d = await res.json()
      const txt = d.content?.[0]?.text || "{}"
      setAiMeta(JSON.parse(txt.replace(/```json|```/g, "").trim()))
    } catch (e) { console.error(e) }
    setLoading("")
  }

  const genSocial = async () => {
    setLoading("social")
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 1200,
          messages: [{
            role: "user", content:
              `Generate social media release content. Producer voice — authentic, not corporate.
"${track.title}" by ${track.artist || "Independent"} | ${track.genre}${track.subgenre ? " / " + track.subgenre : ""} | ${track.mood || "instrumental"} | ${track.bpm || "?"} BPM | AI-assisted (Suno Pro)
Return ONLY valid JSON, no markdown:
{"tiktokCaption":"<130 chars caption then 5 hashtags on separate lines","youtubeVideoTitle":"SEO title: BPM + mood + genre + FREE","youtubeDescription":"~200 word description: vibe, BPM/key, use permissions, 8 hashtags at end","instagramCaption":"85-100 chars + 8 targeted hashtags","submithubPitch":"3 sentences, specific about the sound and target playlist","twitterPost":"<240 chars + 3 hashtags"}`
          }]
        })
      })
      const d = await res.json()
      const txt = d.content?.[0]?.text || "{}"
      setSocial(JSON.parse(txt.replace(/```json|```/g, "").trim()))
    } catch (e) { console.error(e) }
    setLoading("")
  }

  // ── shared ui ────────────────────────────────────────────
  const S = { // styles shorthand
    card: { background: "rgba(20,14,40,0.8)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 14 },
    infoCard: { background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 10 },
    warnCard: { background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10 },
    successCard: { background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10 },
    input: { background: "rgba(0,0,0,0.5)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 8, color: "#f1f5f9", padding: "8px 12px", fontSize: 14, width: "100%", outline: "none", fontFamily: "inherit" },
    label: { display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", marginBottom: 6 },
    pill: (active) => ({
      padding: "4px 12px", borderRadius: 999, fontSize: 12, cursor: "pointer", transition: "all 0.15s",
      background: active ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${active ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.08)"}`,
      color: active ? "#c4b5fd" : "#475569"
    }),
  }

  const Field = ({ label, hint, children }) => (
    <div>
      <label style={S.label}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{hint}</p>}
    </div>
  )

  const TxtInput = ({ value, onChange, placeholder, type = "text" }) => (
    <input type={type} value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)} style={S.input}
      onFocus={e => e.target.style.borderColor = "rgba(124,58,237,0.7)"}
      onBlur={e => e.target.style.borderColor = "rgba(124,58,237,0.25)"}
    />
  )

  const SelInput = ({ value, onChange, opts }) => (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ ...S.input, appearance: "none" }}>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )

  const CopyBtn = ({ text, id }) => (
    <button onClick={() => cp(text, id)}
      style={{
        fontSize: 11, padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontFamily: "monospace", transition: "all 0.15s",
        background: copied === id ? "rgba(34,197,94,0.15)" : "rgba(124,58,237,0.15)",
        border: `1px solid ${copied === id ? "rgba(34,197,94,0.4)" : "rgba(124,58,237,0.4)"}`,
        color: copied === id ? "#4ade80" : "#a78bfa"
      }}>{copied === id ? "✓ Copied" : "Copy"}</button>
  )

  const Toggle = ({ on, onToggle, color = "#7c3aed" }) => (
    <button onClick={onToggle} style={{
      width: 44, height: 24, borderRadius: 999, position: "relative", cursor: "pointer", transition: "background 0.2s", border: "none",
      background: on ? color + "cc" : "rgba(100,116,139,0.4)"
    }}>
      <span style={{
        position: "absolute", top: 3, width: 18, height: 18, background: "white", borderRadius: "50%",
        transition: "left 0.2s", left: on ? "calc(100% - 21px)" : 3
      }} />
    </button>
  )

  const CheckRow = ({ id, label, note }) => (
    <div onClick={() => toggleCheck(id)} style={{ display: "flex", gap: 12, padding: "10px 12px", borderRadius: 8, cursor: "pointer", transition: "background 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <div style={{
        marginTop: 1, width: 20, height: 20, borderRadius: 5, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
        background: checks[id] ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${checks[id] ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.12)"}`
      }}>
        {checks[id] && <span style={{ color: "#4ade80", fontSize: 11 }}>✓</span>}
      </div>
      <div>
        <p style={{ fontSize: 13, color: checks[id] ? "#475569" : "#cbd5e1", textDecoration: checks[id] ? "line-through" : "none" }}>{label}</p>
        {note && <p style={{ fontSize: 11, color: "#374151", marginTop: 2 }}>{note}</p>}
      </div>
    </div>
  )

  const ContentBox = ({ value, id, rows = 4 }) => (
    <div>
      <textarea readOnly value={value} rows={rows}
        style={{ ...S.input, resize: "none", fontFamily: "monospace", lineHeight: 1.5, color: "#94a3b8" }} />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
        <CopyBtn text={value} id={id} />
      </div>
    </div>
  )

  const AIBtn = ({ onClick, busy, label }) => (
    <button onClick={onClick} disabled={busy}
      style={{
        width: "100%", padding: "12px 0", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: busy ? "not-allowed" : "pointer", transition: "all 0.2s",
        background: busy ? "rgba(124,58,237,0.3)" : "linear-gradient(135deg, rgba(124,58,237,0.9), rgba(99,102,241,0.9))",
        color: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        opacity: busy ? 0.7 : 1
      }}>
      {busy ? <><span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>◌</span> Working...</> : <><span>✦</span>{label}</>}
    </button>
  )

  const SectionHead = ({ n, title, sub }) => (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#7c3aed", textTransform: "uppercase", marginBottom: 4 }}>Step {n}</p>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>{title}</h2>
      {sub && <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{sub}</p>}
    </div>
  )

  const GroupLabel = ({ label }) => (
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#374151", marginBottom: 8, marginTop: 24, paddingBottom: 6, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      {label}
    </p>
  )

  // ── step 1: upload ────────────────────────────────────────
  const Step1 = () => (
    <div>
      <SectionHead n={1} title="Drop Your Track" sub="MP3 · WAV · FLAC · M4A · max 500 MB" />

      {!track.file ? (
        <div onDrop={onDrop} onDragOver={onDragOver} onClick={() => fileRef.current?.click()}
          style={{
            borderRadius: 16, padding: "64px 32px", textAlign: "center", cursor: "pointer",
            background: "repeating-linear-gradient(45deg, rgba(124,58,237,0.02) 0, rgba(124,58,237,0.02) 10px, transparent 10px, transparent 20px)",
            border: "2px dashed rgba(124,58,237,0.3)", transition: "border-color 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(124,58,237,0.6)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(124,58,237,0.3)"}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎵</div>
          <p style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 17, margin: 0 }}>Drag & drop your audio file</p>
          <p style={{ color: "#475569", fontSize: 13, marginTop: 6 }}>or click to browse</p>
          <input ref={fileRef} type="file" accept="audio/*" style={{ display: "none" }} onChange={e => onFile(e.target.files[0])} />
        </div>
      ) : (
        <div style={{ ...S.card, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <p style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15, margin: 0 }}>{track.fileName}</p>
              <p style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>{fmt.dur(track.duration)} · {track.format} · {fmt.mb(track.fileSize)}</p>
            </div>
            <button onClick={() => { upd({ file: null, fileName: "", duration: 0, fileSize: 0, format: "", bpm: "" }); setBpmStatus("") }}
              style={{ color: "#475569", background: "none", border: "none", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[["Duration", fmt.dur(track.duration)], ["Format", track.format], ["Size", fmt.mb(track.fileSize)]].map(([l, v]) => (
              <div key={l} style={{ background: "rgba(0,0,0,0.4)", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                <p style={{ color: "#475569", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>{l}</p>
                <p style={{ color: "#f1f5f9", fontWeight: 700, fontFamily: "monospace", fontSize: 14, marginTop: 4, marginBottom: 0 }}>{v}</p>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <p style={{ ...S.label, margin: 0 }}>BPM</p>
            {bpmStatus === "analyzing" && <span style={{ color: "#fbbf24", fontSize: 13 }}>◌ Analyzing waveform...</span>}
            {bpmStatus === "done" && <span style={{ color: "#4ade80", fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>✓ {track.bpm} BPM</span>}
            {bpmStatus === "failed" && <span style={{ color: "#fbbf24", fontSize: 13 }}>⚠ Enter manually in next step</span>}
          </div>
        </div>
      )}

      <div style={{ ...S.infoCard, padding: 14, marginTop: 20, display: "flex", gap: 10 }}>
        <span style={{ color: "#22d3ee" }}>ℹ</span>
        <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>
          Track must have been generated on <strong style={{ color: "#67e8f9" }}>Suno Pro or Premier</strong> for commercial distribution rights. Free-tier tracks can't be monetized.
        </p>
      </div>
    </div>
  )

  // ── step 2: metadata ──────────────────────────────────────
  const Step2 = () => (
    <div>
      <SectionHead n={2} title="Track Metadata" sub="This travels with your track across every platform it lands on." />
      <AIBtn onClick={genMeta} busy={loading === "meta"} label="Auto-generate metadata with AI" />

      {aiMeta && (
        <div style={{ ...S.card, padding: 16, marginTop: 20 }}>
          <p style={{ ...S.label, color: "#7c3aed" }}>AI Suggestions — click to apply</p>
          {aiMeta.titleSuggestions?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11, color: "#475569", margin: "0 0 8px" }}>Title options</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {aiMeta.titleSuggestions.map(t => (
                  <button key={t} style={S.pill(track.title === t)} onClick={() => upd({ title: t })}>{t}</button>
                ))}
              </div>
            </div>
          )}
          {aiMeta.mood && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11, color: "#475569", margin: "0 0 8px" }}>Mood</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {aiMeta.mood.split(",").map(m => m.trim()).filter(Boolean).map(m => (
                  <button key={m} style={S.pill(track.mood.includes(m))}
                    onClick={() => upd({ mood: track.mood ? track.mood + ", " + m : m })}>{m}</button>
                ))}
              </div>
            </div>
          )}
          {aiMeta.description && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11, color: "#475569", margin: "0 0 6px" }}>Description</p>
              <p style={{ color: "#94a3b8", fontSize: 13, fontStyle: "italic", margin: 0 }}>"{aiMeta.description}"</p>
              <button onClick={() => upd({ description: aiMeta.description })}
                style={{ color: "#a78bfa", fontSize: 11, background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 4 }}>
                → Use this
              </button>
            </div>
          )}
          {aiMeta.key && (
            <div>
              <p style={{ fontSize: 11, color: "#475569", margin: "0 0 8px" }}>Suggested key</p>
              <button style={S.pill(track.key === aiMeta.key)} onClick={() => upd({ key: aiMeta.key })}>{aiMeta.key}</button>
            </div>
          )}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }}>
        <div style={{ gridColumn: "1/-1" }}>
          <Field label="Track Title"><TxtInput value={track.title} onChange={v => upd({ title: v })} placeholder="Your track title" /></Field>
        </div>
        <Field label="Artist / Producer Name">
          <TxtInput value={track.artist} onChange={v => upd({ artist: v })} placeholder="Your name or alias" />
        </Field>
        <Field label="BPM" hint={bpmStatus === "failed" ? "Auto-detect failed — enter here" : ""}>
          <TxtInput type="number" value={track.bpm} onChange={v => upd({ bpm: v })} placeholder="e.g. 140" />
        </Field>
        <Field label="Genre">
          <SelInput value={track.genre} onChange={v => upd({ genre: v })} opts={GENRES} />
        </Field>
        <Field label="Subgenre">
          <TxtInput value={track.subgenre} onChange={v => upd({ subgenre: v })} placeholder="e.g. Trap Soul" />
        </Field>
        <div style={{ gridColumn: "1/-1" }}>
          <Field label="Mood">
            <TxtInput value={track.mood} onChange={v => upd({ mood: v })} placeholder="e.g. Dark, Introspective, Gritty" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {MOODS.map(m => (
                <button key={m} style={S.pill(track.mood.includes(m))}
                  onClick={() => upd({ mood: track.mood.includes(m) ? track.mood.replace(new RegExp(",?\\s*" + m + "\\s*,?"), "").replace(/^,\s*/, "").replace(/,\s*$/, "").trim() : track.mood ? track.mood + ", " + m : m })}>
                  {m}
                </button>
              ))}
            </div>
          </Field>
        </div>
        <Field label="Musical Key">
          <TxtInput value={track.key} onChange={v => upd({ key: v })} placeholder="e.g. F# minor" />
        </Field>
        <Field label="Release Date">
          <TxtInput type="date" value={track.releaseDate} onChange={v => upd({ releaseDate: v })} />
        </Field>
        <div style={{ gridColumn: "1/-1" }}>
          <Field label="Copyright Owner" hint="Your name or BMI publisher entity">
            <TxtInput value={track.copyrightOwner} onChange={v => upd({ copyrightOwner: v })} placeholder="e.g. Wright Sound Publishing" />
          </Field>
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <Field label="Description" hint="Max 90 chars · shown on Spotify, Apple Music, etc.">
            <TxtInput value={track.description} onChange={v => upd({ description: v })} placeholder="Short track description for streaming platforms" />
            {track.description && <p style={{ fontSize: 11, color: track.description.length > 90 ? "#f87171" : "#475569", marginTop: 4, fontFamily: "monospace" }}>{track.description.length}/90</p>}
          </Field>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
        <div style={{ ...S.warnCard, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: "#fca5a5", fontSize: 13, fontWeight: 700, margin: 0 }}>AI Disclosure</p>
            <p style={{ color: "#64748b", fontSize: 11, marginTop: 2, marginBottom: 0 }}>Required by Spotify & Apple Music (DDEX standard)</p>
          </div>
          <Toggle on={track.aiDisclosure} onToggle={() => upd({ aiDisclosure: !track.aiDisclosure })} color="#22c55e" />
        </div>
        <div style={{ ...S.card, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600, margin: 0 }}>Explicit Content</p>
            <p style={{ color: "#64748b", fontSize: 11, marginTop: 2, marginBottom: 0 }}>Mark if track contains explicit language</p>
          </div>
          <Toggle on={track.explicit} onToggle={() => upd({ explicit: !track.explicit })} color="#ef4444" />
        </div>
      </div>
    </div>
  )

  // ── step 3: distribute ────────────────────────────────────
  const Step3 = () => {
    const copyrightLine = `℗ ${new Date().getFullYear()} ${track.copyrightOwner || track.artist}`
    const fields = [
      { label: "Song Title", value: track.title, k: "f1" },
      { label: "Primary Artist", value: track.artist, k: "f2" },
      { label: "Genre", value: `${track.genre}${track.subgenre ? " / " + track.subgenre : ""}`, k: "f3" },
      { label: "BPM", value: track.bpm, k: "f4" },
      { label: "Mood", value: track.mood, k: "f5" },
      { label: "Release Date", value: track.releaseDate, k: "f6" },
      { label: "Copyright Line", value: copyrightLine, k: "f7" },
      { label: "Language", value: "English", k: "f8" },
    ]
    return (
      <div>
        <SectionHead n={3} title="Distribution" sub="Pre-filled for DistroKid. Copy each field directly." />

        <div style={{ ...S.card, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ background: "rgba(124,58,237,0.15)", padding: "12px 16px", borderBottom: "1px solid rgba(124,58,237,0.2)" }}>
            <p style={{ color: "#c4b5fd", fontWeight: 700, fontSize: 13, margin: 0 }}>📦 DistroKid Upload Fields</p>
          </div>
          {fields.map(({ label, value, k }, i) => (
            <div key={k} style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, borderBottom: i < fields.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ ...S.label, margin: 0 }}>{label}</p>
                {value
                  ? <p style={{ color: "#e2e8f0", fontSize: 13, fontFamily: "monospace", margin: "4px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</p>
                  : <p style={{ color: "#f59e0b", fontSize: 11, margin: "4px 0 0" }}>⚠ Not set — go back to Step 2</p>
                }
              </div>
              {value && <CopyBtn text={value} id={k} />}
            </div>
          ))}
        </div>

        <div style={{ ...S.warnCard, padding: 14, marginBottom: 20 }}>
          <p style={{ color: "#fca5a5", fontWeight: 700, fontSize: 13, margin: "0 0 6px" }}>⚠ Critical: AI Disclosure Checkbox</p>
          <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>In DistroKid's "Additional Info" section, check <strong style={{ color: "#f1f5f9" }}>"This release contains AI-generated content"</strong>. DistroKid re-scans all catalogs — undisclosed tracks get pulled retroactively.</p>
        </div>

        <GroupLabel label="Pre-Upload Checklist" />
        {[
          { id: "c1", label: "Suno Pro/Premier was active when track was generated", note: "Keep subscription receipt as proof" },
          { id: "c2", label: "Cover art is 3000×3000 JPG/PNG, no streaming platform logos", note: "Canva.com works — fully browser-based, free" },
          { id: "c3", label: "AI disclosure checkbox checked in DistroKid", note: "Required by Spotify & Apple Music (DDEX)" },
          { id: "c4", label: "Release date is 3+ weeks out", note: "Spotify editorial pitch requires 7-day minimum window" },
          { id: "c5", label: "Stores selected: Spotify, Apple, Amazon, YouTube Music, Tidal, Deezer", note: "" },
        ].map(item => <CheckRow key={item.id} {...item} />)}

        <div style={{ ...S.infoCard, padding: 14, marginTop: 20 }}>
          <p style={{ color: "#67e8f9", fontWeight: 700, fontSize: 13, margin: "0 0 6px" }}>After DistroKid confirms delivery</p>
          <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>
            Claim <strong style={{ color: "#f1f5f9" }}>Spotify for Artists</strong> and submit editorial pitch immediately. Then claim <strong style={{ color: "#f1f5f9" }}>Apple Music for Artists</strong> and <strong style={{ color: "#f1f5f9" }}>Amazon Music for Artists</strong>. These are free and give you analytics access.
          </p>
        </div>
      </div>
    )
  }

  // ── step 4: social ────────────────────────────────────────
  const Step4 = () => (
    <div>
      <SectionHead n={4} title="Social Content" sub="AI-written, ready-to-post across every platform." />
      <AIBtn onClick={genSocial} busy={loading === "social"} label="Generate all social content" />

      {!social && loading !== "social" && (
        <div style={{ textAlign: "center", padding: "48px 24px", marginTop: 20, borderRadius: 12, border: "1px dashed rgba(255,255,255,0.08)" }}>
          <p style={{ color: "#374151", fontSize: 13, margin: 0 }}>Hit the button — AI writes TikTok, YouTube, Instagram, SubmitHub, and X content in one shot.</p>
        </div>
      )}

      {social && (
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 24 }}>
          {[
            { k: "tk", title: "TikTok Caption", field: "tiktokCaption", rows: 3 },
            { k: "yt", title: "YouTube Video Title", field: "youtubeVideoTitle", rows: 2 },
            { k: "ytd", title: "YouTube Description", field: "youtubeDescription", rows: 7 },
            { k: "ig", title: "Instagram Caption", field: "instagramCaption", rows: 3 },
            { k: "sub", title: "SubmitHub Pitch Copy", field: "submithubPitch", rows: 3 },
            { k: "tw", title: "X / Twitter", field: "twitterPost", rows: 2 },
          ].filter(({ field }) => social[field]).map(({ k, title, field, rows }) => (
            <div key={k}>
              <p style={S.label}>{title}</p>
              <ContentBox value={social[field]} id={k} rows={rows} />
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // ── step 5: launch ────────────────────────────────────────
  const Step5 = () => {
    const done = Object.values(checks).filter(Boolean).length
    const total = 12
    const pct = Math.round((done / total) * 100)
    return (
      <div>
        <SectionHead n={5} title="Launch Sequence" sub="Work through this before and after your release date." />

        <div style={{ ...S.card, padding: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ color: "#f1f5f9", fontWeight: 700, margin: 0 }}>{track.title || "Your Track"}</p>
            <span style={{ fontFamily: "monospace", color: "#a78bfa", fontSize: 13 }}>{done}/{total} complete</span>
          </div>
          <div style={{ height: 6, background: "rgba(0,0,0,0.5)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 999, transition: "width 0.4s", width: `${pct}%`, background: "linear-gradient(90deg, #7c3aed, #22d3ee)" }} />
          </div>
        </div>

        <GroupLabel label="3 Weeks Before Release" />
        {[
          { id: "l1", label: "DistroKid upload completed with AI disclosure checked" },
          { id: "l2", label: "Spotify for Artists editorial pitch submitted", note: "Do immediately after DistroKid confirms delivery" },
          { id: "l3", label: "SubmitHub: 5–10 curator submissions sent", note: "Use the pitch copy from Step 4 · budget $10–20" },
        ].map(i => <CheckRow key={i.id} {...i} />)}

        <GroupLabel label="Release Week" />
        {[
          { id: "l4", label: "TikTok teaser posted 3 days before release", note: "30-sec hook · pre-save link in bio" },
          { id: "l5", label: "Instagram Reels teaser — re-uploaded natively (no TikTok watermark)", note: "Instagram suppresses cross-posted watermarked videos" },
          { id: "l6", label: "YouTube upload: full track + visualization + Spotify Canvas" },
          { id: "l7", label: "YouTube Short (30–45 sec) posted on release day" },
        ].map(i => <CheckRow key={i.id} {...i} />)}

        <GroupLabel label="Days 1–30 Post-Release" />
        {[
          { id: "l8", label: "Claimed: Spotify for Artists, Apple Music for Artists, Amazon Music for Artists" },
          { id: "l9", label: "BMI work registration filed", note: "Register if you wrote original lyrics — hybrid works now eligible since Oct 2025" },
          { id: "l10", label: "BeatStars or Gumroad listing live for beat licensing" },
          { id: "l11", label: "30-day analytics pulled across all platforms", note: "Streams, saves, skip rate, playlist adds" },
          { id: "l12", label: "Paid promotion decision made based on organic signal", note: "Only boost tracks that already have momentum" },
        ].map(i => <CheckRow key={i.id} {...i} />)}

        <div style={{ ...S.successCard, padding: 16, marginTop: 24 }}>
          <p style={{ color: "#86efac", fontWeight: 700, fontSize: 13, margin: "0 0 10px" }}>Revenue Stack</p>
          {[
            ["Streaming royalties", "DistroKid → Spotify, Apple, Amazon, Tidal"],
            ["Performance royalties", "BMI (requires hybrid authorship registration)"],
            ["YouTube ad revenue", "YouTube Partner Program"],
            ["Beat licensing", "BeatStars / Gumroad direct"],
            ["Social content revenue", "TikTok Creator Fund, brand deals"],
          ].map(([l, r]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "#d1fae5", fontSize: 12 }}>{l}</span>
              <span style={{ color: "#374151", fontSize: 11 }}>{r}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── app shell ─────────────────────────────────────────────
  const canNext = step === 1 ? !!track.file : step === 2 ? !!(track.title && track.artist) : true
  const stepViews = { 1: Step1, 2: Step2, 3: Step3, 4: Step4, 5: Step5 }
  const Current = stepViews[step]

  return (
    <div style={{ minHeight: "100vh", background: "#060611", color: "#f1f5f9", fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } } * { box-sizing: border-box }`}</style>

      {/* header */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(6,6,17,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>🛬</span>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em", color: "#f1f5f9" }}>Droplane</span>
          <span style={{ fontSize: 10, color: "#374151", fontFamily: "monospace", background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 4, marginLeft: 2 }}>MVP</span>
        </div>

        {/* step dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {STEPS.map(({ n, label }, i) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button
                onClick={() => n < step && setStep(n)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 8, border: "none", cursor: n < step ? "pointer" : "default", transition: "all 0.15s",
                  background: step === n ? "rgba(124,58,237,0.2)" : "transparent",
                }}
              >
                <span style={{
                  width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, transition: "all 0.2s",
                  background: n < step ? "rgba(34,197,94,0.2)" : step === n ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.04)",
                  color: n < step ? "#4ade80" : step === n ? "#c4b5fd" : "#374151"
                }}>
                  {n < step ? "✓" : n}
                </span>
                <span style={{ fontSize: 12, display: window.innerWidth > 500 ? "inline" : "none", color: step === n ? "#c4b5fd" : n < step ? "#475569" : "#2d3748" }}>{label}</span>
              </button>
              {i < STEPS.length - 1 && <span style={{ color: "#1e293b", fontSize: 12 }}>›</span>}
            </div>
          ))}
        </div>
      </div>

      {/* content */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px 80px" }}>
        <Current />

        {/* nav */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={() => setStep(p => Math.max(1, p - 1))} disabled={step === 1}
            style={{
              padding: "10px 24px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", cursor: step === 1 ? "not-allowed" : "pointer", transition: "all 0.15s",
              background: "rgba(255,255,255,0.03)", color: step === 1 ? "#1e293b" : "#64748b", fontWeight: 600, fontSize: 13
            }}>← Back</button>

          {step < 5 ? (
            <button onClick={() => setStep(p => p + 1)} disabled={!canNext}
              style={{
                padding: "10px 28px", borderRadius: 10, border: "none", cursor: canNext ? "pointer" : "not-allowed", transition: "all 0.2s", fontWeight: 700, fontSize: 13,
                background: canNext ? "rgba(124,58,237,0.9)" : "rgba(124,58,237,0.15)",
                color: canNext ? "white" : "#3b1d8a"
              }}>
              {step === 4 ? "View Launch Plan →" : "Continue →"}
            </button>
          ) : (
            <button onClick={() => setStep(1)}
              style={{ padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer", background: "rgba(34,197,94,0.2)", color: "#4ade80", fontWeight: 700, fontSize: 13 }}>
              ↺ New Track
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
