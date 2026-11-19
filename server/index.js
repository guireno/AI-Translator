import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const port = Number(process.env.PORT || 8787);
const allowedOrigins = (process.env.APP_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",").map(x => x.trim()).filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Requests without Origin are typically local/server-to-server health checks.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin tidak diizinkan."));
  }
}));
app.use(express.json({ limit: "32kb" }));

// Lightweight per-process rate limit. Use a shared store (e.g. Redis) for multi-instance hosting.
const windows = new Map();
app.use("/api/translate", (req, res, next) => {
  const key = req.ip || "unknown";
  const now = Date.now();
  const entry = windows.get(key);
  if (!entry || now - entry.start >= 60_000) {
    windows.set(key, { start: now, count: 1 });
    return next();
  }
  if (entry.count >= 30) return res.status(429).json({ error: "Terlalu banyak permintaan. Coba lagi dalam satu menit." });
  entry.count += 1;
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, configured: Boolean(process.env.OPENAI_API_KEY) });
});

app.post("/api/translate", async (req, res) => {
  try {
    const { text, from, to, mode = "translate", context = "" } = req.body || {};
    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Teks masih kosong." });
    }
    if (text.length > 5000 || String(context).length > 1000) {
      return res.status(413).json({ error: "Teks maksimal 5.000 karakter dan konteks maksimal 1.000 karakter." });
    }
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: "API belum dikonfigurasi. Atur OPENAI_API_KEY sebagai secret di backend." });
    }

    // Create the SDK client only after confirming the secret exists.
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const instruction = mode === "reply"
      ? `Bertindak sebagai asisten komunikasi multibahasa. Konteks percakapan: ${context || "Tidak ada"}. Buat 3 pilihan balasan dalam bahasa ${to}: (1) ramah dan natural, (2) profesional, (3) singkat. Sertakan terjemahan bahasa ${from} untuk setiap balasan. Jangan mengarang fakta.`
      : `Terjemahkan teks berikut dari ${from} ke ${to}. Pertahankan makna, nada, nama, angka, dan format. Berikan hanya hasil terjemahan, lalu satu catatan singkat jika ada idiom atau ungkapan yang perlu konteks.`;

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-6-luna",
      instructions: instruction,
      input: text,
    });
    res.json({ result: response.output_text || "Tidak ada hasil." });
  } catch (err) {
    console.error("Translate error:", err?.message || err);
    res.status(500).json({ error: "Gagal memproses permintaan AI. Periksa API key, izin model, dan koneksi server." });
  }
});

app.listen(port, "0.0.0.0", () => console.log(`AI Translator API aktif di port ${port}`));
