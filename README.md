# ERLASS PLATFORM (Enterprise LMS)

Platform Learning Management System (LMS) modern berbasis Next.js 16, dirancang untuk pendidikan coding dengan fitur gamifikasi tingkat lanjut.

## 🚀 Fitur Utama (v2.0)

*   **Gamifikasi:** XP, Level, Badge, Daily Streak, Daily Quests, dan XP Shop.
*   **Code Adventure:** Game engine visual untuk belajar logika pemrograman.
*   **Multi-School:** Manajemen kelas dan mentor untuk banyak sekolah sekaligus.
*   **Learning Tools:** Kuis interaktif, tantangan coding (Python/Web), dan diskusi.
*   **Commerce:** Integrasi pembayaran iPaymu dan sistem voucher.

## 📂 Dokumentasi Lengkap

Semua panduan teknis tersedia di folder `docs/`:

*   [**RELEASE NOTES v2.0**](docs/RELEASE_NOTES_v2.0.md) - **BACA INI DULU!** (Fitur terbaru).
*   [Developer Guide](docs/DEVELOPER_GUIDE.md) - Struktur folder dan database.
*   [Game Engine Docs](docs/GAME_ENGINE_DOCS.md) - Cara kerja game coding.
*   [Deployment cPanel](docs/DEPLOYMENT_CPANEL_FINAL.md) - Cara upload ke hosting.

## 🛠️ Tech Stack

*   **Framework:** Next.js 16 (App Router)
*   **Database:** PostgreSQL + Prisma ORM
*   **UI:** Tailwind CSS + Shadcn/UI
*   **Auth:** NextAuth.js
*   **Payment:** iPaymu

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Setup Database
npx prisma generate
npx prisma db push

# Run Dev Server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
