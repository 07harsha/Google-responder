import { useState, useRef, useEffect } from "react";

/**
 * 🚀 REVIEW GENIUS - GOOGLE BUSINESS AI RESPONDER
 * Built for Gemini 1.5 Flash
 */

const TONES = [
  { id: "warm", label: "Warm & Friendly", emoji: "🤝", color: "#f97316" },
  { id: "professional", label: "Professional & Formal", emoji: "💼", color: "#3b82f6" },
  { id: "enthusiastic", label: "Enthusiastic & Energetic", emoji: "🚀", color: "#a855f7" },
  { id: "empathetic", label: "Empathetic & Caring", emoji: "💛", color: "#eab308" },
];

const STARS = [1, 2, 3, 4, 5];

/* ── UI Components ── */
function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }}>
      {STARS.map((s) => (
        <span
          key={s}
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          style={{
            fontSize: "28px",
            cursor: "pointer",
            transition: "transform 0.1s",
            transform: (hovered || value) >= s ? "scale(1.2)" : "scale(1)",
            filter: (hovered || value) >= s ? "brightness(1)" : "brightness(0.3)",
          }}
        >⭐</span>
      ))}
    </div>
  );
}

function Field({ label, placeholder, value, onChange, multiline }) {
  const baseStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    padding: "12px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    marginTop: "6px",
    boxSizing: "border-box"
  };

  return (
    <div style={{ marginBottom: "18px" }}>
      <label style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>{label}</label>
      {multiline ? (
        <textarea style={{ ...baseStyle, minHeight: "100px" }} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input style={baseStyle} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

/* ── Main App ── */
export default function App() {
  const [form, setForm] = useState({ bizName: "", location: "", service: "", review: "", contact: "", stars: 0, tone: "warm" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  // Your Provided API Key
  const API_KEY = "AIzaSyBIFDh4tjJCCcP004DTqvFxhXxVg_6gg8A";
  const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  const update = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  const generateResponse = async () => {
    if (!form.bizName || !form.location || !form.review || form.stars === 0) {
      setError("Please fill in Business Name, Location, Review, and Rating.");
      return;
    }
    setError("");
    setLoading(true);

    const prompt = `You are a Local SEO expert. Write a response for ${form.bizName} in ${form.location} regarding their ${form.service}. 
    Review: "${form.review}" (Rating: ${form.stars} stars). Tone: ${form.tone}.
    Rules: 1. Address them by name. 2. Mention a specific detail from their text. 3. Include local keywords. 4. Max 3 sentences.
    Respond ONLY in this JSON format: {"response": "...", "breakdown": [{"icon":"📍","label":"SEO Location","value":"..."},{"icon":"✨","label":"Detail Used","value":"..."}]}`;

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await res.json();
      const rawText = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(rawText);

      setResult(parsed.response);
      setBreakdown(parsed.breakdown);
    } catch (err) {
      setError("Failed to connect to Gemini. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#f8fafc", fontFamily: "sans-serif", padding: "40px 20px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "40px" }}>
        
        {/* Left Side: Inputs */}
        <section style={{ background: "#1e293b", padding: "30px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
          <h2 style={{ color: "#f97316", marginBottom: "20px" }}>⭐ ReviewGenius</h2>
          <Field label="Business Name" placeholder="e.g., Mario's Pizzeria" value={form.bizName} onChange={update("bizName")} />
          <Field label="Location" placeholder="e.g., Brooklyn, NY" value={form.location} onChange={update("location")} />
          <Field label="Service" placeholder="e.g., Wood-fired Pizza" value={form.service} onChange={update("service")} />
          <Field label="Contact (Optional)" placeholder="e.g., (555) 123-4567" value={form.contact} onChange={update("contact")} />
          
          <label style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8" }}>STAR RATING</label>
          <StarRating value={form.stars} onChange={update("stars")} />

          <div style={{ marginTop: "20px" }}>
            <Field label="Customer Review" multiline placeholder="Paste the review here..." value={form.review} onChange={update("review")} />
          </div>

          <button 
            onClick={generateResponse} 
            disabled={loading}
            style={{ width: "100%", padding: "14px", background: "#f97316", border: "none", borderRadius: "10px", color: "white", fontWeight: "700", cursor: "pointer", marginTop: "10px" }}
          >
            {loading ? "Generating..." : "✨ Generate SEO Reply"}
          </button>
          {error && <p style={{ color: "#f87171", fontSize: "12px", marginTop: "10px" }}>{error}</p>}
        </section>

        {/* Right Side: Result */}
        <section>
          <h3 style={{ marginBottom: "20px" }}>Your Response</h3>
          {result ? (
            <div style={{ background: "rgba(249,115,22,0.1)", border: "1px solid #f97316", padding: "20px", borderRadius: "20px" }}>
              <p style={{ lineHeight: "1.6", fontSize: "16px" }}>{result}</p>
              <div style={{ marginTop: "20px", borderTop: "1px solid rgba(249,115,22,0.2)", paddingTop: "15px" }}>
                {breakdown.map((item, i) => (
                  <div key={i} style={{ display: "flex", fontSize: "13px", marginBottom: "8px" }}>
                    <span style={{ marginRight: "10px" }}>{item.icon}</span>
                    <span style={{ color: "#94a3b8", width: "100px" }}>{item.label}:</span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                style={{ width: "100%", padding: "10px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", borderRadius: "8px", marginTop: "20px", cursor: "pointer" }}
              >
                {copied ? "✅ Copied!" : "📋 Copy to Clipboard"}
              </button>
            </div>
          ) : (
            <div style={{ padding: "60px", border: "2px dashed #334155", borderRadius: "20px", textAlign: "center", color: "#475569" }}>
              Fill in the details to see the magic.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
