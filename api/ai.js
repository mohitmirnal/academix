// Vercel serverless function: keeps the AI key on the server so anyone who opens the link gets working AI.
// In Vercel -> Settings -> Environment Variables set ONE of:
//   GEMINI_API_KEY      (Google AI Studio, has a free tier)   or   ANTHROPIC_API_KEY
// Optional: GEMINI_MODEL (default gemini-3.5-flash), ANTHROPIC_MODEL (default claude-sonnet-5)
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { messages, images } = req.body || {};
  if (!Array.isArray(messages) || !messages.length || JSON.stringify(req.body).length > 3500000)
    return res.status(400).json({ error: "bad request" });
  const msgs = messages.slice(-12).map(m => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content).slice(0, 30000),
  }));
  const imgs = Array.isArray(images) ? images.slice(0, 4).map(String) : [];
  const last = msgs.length - 1;
  try {
    let text = "";
    if (process.env.GEMINI_API_KEY) {
      const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
      const contents = msgs.map((m, i) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [
          ...(i === last && m.role === "user" ? imgs.map(d => ({ inline_data: { mime_type: "image/jpeg", data: d } })) : []),
          { text: m.content },
        ],
      }));
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: { "x-goog-api-key": process.env.GEMINI_API_KEY, "content-type": "application/json" },
        body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 8192 } }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) return res.status(r.status === 429 ? 429 : 502).json({ error: (j.error && j.error.message) || "upstream error" });
      text = ((j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || []).map(p => p.text || "").join("");
    } else if (process.env.ANTHROPIC_API_KEY) {
      const out = msgs.map((m, i) => ({
        role: m.role,
        content: i === last && m.role === "user" && imgs.length
          ? [...imgs.map(d => ({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: d } })), { type: "text", text: m.content }]
          : m.content,
      }));
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5", max_tokens: 4096, messages: out }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) return res.status(r.status === 429 ? 429 : 502).json({ error: (j.error && j.error.message) || "upstream error" });
      text = (j.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    } else {
      return res.status(500).json({ error: "No AI key configured on the server" });
    }
    res.status(200).json({ text });
  } catch (e) {
    res.status(502).json({ error: "upstream error" });
  }
};
