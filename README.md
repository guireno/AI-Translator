# AI Translator Pro

Aplikasi web responsif/PWA untuk menerjemahkan teks, input suara, membacakan hasil, membuat saran balasan AI, dan menyimpan riwayat lokal.

## Persyaratan
- Node.js 20 atau lebih baru
- OpenAI API key dengan billing/kuota API aktif. Langganan ChatGPT tidak termasuk kredit API.

## Menjalankan di komputer
1. Ekstrak ZIP.
2. Buka folder proyek di Terminal/CMD.
3. Jalankan `npm install`.
4. Salin `.env.example` menjadi `.env`.
5. Isi `OPENAI_API_KEY` di `.env` pada backend saja. Jangan bagikan key, jangan masukkan ke frontend atau APK.
6. Jalankan backend: `npm run server`.
7. Buka terminal kedua, jalankan `npm run dev`.
8. Buka alamat Vite yang ditampilkan, biasanya `http://localhost:5173`.

Backend berjalan di port 8787. Vite sudah mem-proxy `/api` ke backend saat development.

## Konfigurasi produksi
- Deploy backend Node.js dan frontend.
- Atur `OPENAI_API_KEY` sebagai environment secret di layanan hosting backend.
- Atur `APP_ORIGINS` ke domain frontend HTTPS Anda.
- Arahkan `/api` dari frontend ke backend.
- Jangan mengunggah file `.env` ke GitHub atau membundel API key di APK.
- Pembatasan permintaan sederhana tersedia per proses. Untuk deployment multi-instance, gunakan rate limiter dengan penyimpanan bersama.

## Build website
`npm run build` lalu deploy folder `dist` ke hosting statis. Backend Node harus tetap berjalan dan endpoint `/api` diarahkan ke backend.

## Android
Versi starter ini adalah PWA. Untuk memasangnya di Android tanpa APK:
1. Deploy aplikasi dan backend ke domain HTTPS.
2. Buka URL aplikasi melalui Chrome Android.
3. Pilih menu Chrome > Install app / Tambahkan ke layar utama.

Untuk APK native, proyek perlu ditambahkan Capacitor dan dibuild dengan Android SDK/Gradle. Langkah awal:
`npm install @capacitor/core @capacitor/cli`
`npx cap init`
`npm install @capacitor/android`
`npx cap add android`
`npm run build`
`npx cap sync android`

APK native membutuhkan proses build Android. Jika hanya menggunakan HP Android, gunakan layanan build cloud atau komputer dengan Android SDK; proses tersebut belum termasuk dalam ZIP starter ini.

## Fitur suara
Pengenalan suara menggunakan Web Speech API dari browser. Dukungan terbaik umumnya di Chrome/Android dan memerlukan izin mikrofon serta koneksi internet. Ketersediaan bahasa bergantung pada browser/perangkat.
Tombol suara membacakan teks menggunakan SpeechSynthesis dan suara yang tersedia di perangkat.

## Keamanan dan biaya
- API key disimpan sebagai secret di backend, bukan browser atau aplikasi Android.
- Panggilan AI menggunakan OpenAI Responses API dan dikenakan biaya sesuai model/token; tidak termasuk paket ChatGPT.
- Riwayat disimpan di localStorage browser perangkat tersebut dan tidak otomatis tersinkron ke perangkat lain.
- Backend membatasi input dan menerapkan rate limit dasar per IP.
- Jangan gunakan untuk menerjemahkan informasi rahasia atau mengambil keputusan hukum/medis tanpa pemeriksaan manusia.

## Batas versi awal
- UI dan alur aplikasi sudah dibuat.
- Fungsi AI aktif setelah API key dan backend dikonfigurasi.
- Voice input/output bergantung pada dukungan browser.
- Belum termasuk login akun, sinkronisasi cloud, panggilan telepon langsung, atau terjemahan audio real-time dua arah.
