# AI Translator Pro

Aplikasi web responsif/PWA untuk menerjemahkan teks, input suara, membacakan hasil, membuat saran balasan AI, dan menyimpan riwayat lokal.

## Persyaratan
- Node.js 20 atau lebih baru
- API key OpenAI (API berbayar terpisah dari langganan ChatGPT)

## Menjalankan di komputer
1. Ekstrak ZIP.
2. Buka folder proyek di Terminal/CMD.
3. Jalankan `npm install`.
4. Salin `.env.example` menjadi `.env`.
5. Isi `OPENAI_API_KEY` dengan API key milik Anda. Jangan bagikan key dan jangan memasukkannya ke frontend.
6. Jalankan backend: `npm run server`.
7. Buka terminal kedua, jalankan `npm run dev`.
8. Buka alamat Vite yang ditampilkan, biasanya `http://localhost:5173`.

Backend berjalan di port 8787. Untuk penggunaan lokal, konfigurasi proxy Vite dapat ditambahkan atau jalankan frontend dan backend melalui reverse proxy. File `vite.config.js` sudah mengatur proxy `/api`.

## Build website
`npm run build` lalu deploy folder `dist` ke hosting statis. Backend Node harus tetap berjalan dan endpoint `/api` diarahkan ke backend.

## Android
Proyek ini disiapkan sebagai PWA yang bisa dipasang melalui Chrome: buka URL HTTPS, pilih menu browser > Install app / Tambahkan ke layar utama.
Untuk APK native, langkah lanjutan adalah menambahkan Capacitor (`npm install @capacitor/core @capacitor/cli`, `npx cap init`, `npm install @capacitor/android`, `npx cap add android`, `npm run build`, `npx cap sync android`, `npx cap open android`).

## Catatan fitur suara
Pengenalan suara menggunakan Web Speech API dari browser. Dukungan paling baik umumnya di Chrome/Android dan memerlukan izin mikrofon serta koneksi internet. Ketersediaan bahasa bergantung pada browser/perangkat.
Tombol suara membacakan teks menggunakan SpeechSynthesis dan suara yang tersedia di perangkat.

## Keamanan dan biaya
- API key disimpan di backend `.env`, bukan browser.
- Panggilan AI menggunakan OpenAI Responses API. Pemakaian API dikenakan biaya sesuai model dan token; tidak termasuk dalam paket ChatGPT.
- Riwayat disimpan di localStorage browser perangkat tersebut. Riwayat tidak otomatis tersinkron ke perangkat lain.
- Jangan gunakan untuk menerjemahkan informasi rahasia atau keputusan hukum/medis tanpa pemeriksaan manusia.

## Batas versi awal
- UI dan alur aplikasi sudah dibuat.
- Fungsi AI aktif setelah API key dan backend dikonfigurasi.
- Voice input/output bergantung pada dukungan browser.
- Belum termasuk login akun, sinkronisasi cloud, panggilan telepon langsung, atau terjemahan audio real-time dua arah.
