import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get("/api/health", (_req, res) => res.json({ ok: true, configured: Boolean(process.env.OPENAI_API_KEY) }));

app.post("/api/translate", async (req, res) => {
  try {
    const { text, from, to, mode = "translate", context = "" } = req.body || {};
    if (!text?.trim()) return res.status(400).json({ error: "Teks masih kosong." });
    if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: "API belum dikonfigurasi. Isi OPENAI_API_KEY di file .env." });
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
    console.error(err);
    res.status(500).json({ error: "Gagal memproses permintaan AI. Periksa API key, model, dan koneksi server." });
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, "0.0.0.0", () => console.log(`AI Translator API aktif di http://localhost:${port}`));
