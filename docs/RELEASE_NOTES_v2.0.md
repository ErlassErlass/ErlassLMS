# ERLASS PLATFORM - Release Notes v2.0 🚀

**Tanggal Rilis:** 12 Desember 2025
**Versi:** 2.0.0 (Enterprise Gamification Edition)

Upgrade besar-besaran ini menghadirkan fitur gamifikasi tingkat lanjut, interaksi sosial, dan engine pembelajaran visual baru.

---

## ✨ Fitur Baru Unggulan

### 1. 🎮 Erlass Code Adventure (Game Engine)
*   **Visual Programming:** Belajar logika coding dengan menggerakkan robot di labirin.
*   **Custom Levels:** Admin bisa membuat level tantangan sendiri via JSON config.
*   **Integrasi:** Terhubung langsung dengan sistem submission dan XP.
*   **Demo:** Coba di `/dashboard/game-demo`.

### 2. 🎡 XP Shop & Virtual Economy
*   **Spend Your XP:** Siswa sekarang bisa membelanjakan XP hasil jerih payah mereka.
*   **Items:** Avatar Frames (Bingkai) dan Title (Julukan) eksklusif.
*   **Daily Spin:** Roda keberuntungan harian untuk dapat XP bonus atau Voucher diskon.

### 3. 🔥 Daily Engagement System
*   **Daily Streak:** Counter api semangat yang bertambah jika login berturut-turut.
*   **Daily Quests:** 3 Misi harian otomatis (Login, Baca, Kuis) yang direset tiap tengah malam.

### 4. 💬 Social & Collaborative Learning
*   **Challenge Discussion:** Forum diskusi per tantangan.
*   **Smart Lock:** Diskusi hanya terbuka setelah siswa mencoba mengerjakan tantangan (mencegah *cheating*).
*   **Soft Selling Banner:** Rekomendasi kursus otomatis jika siswa kesulitan di tantangan tertentu.

### 5. 📜 Enterprise Admin Tools
*   **Certificate Management:** CRUD penuh untuk sertifikat, termasuk penerbitan manual dan pencabutan (revoke).
*   **Quiz Settings:** Admin bisa mengedit durasi dan batas percobaan kuis langsung dari dashboard.

---

## 🛠️ Perbaikan Teknis (Technical Improvements)

*   **Security Patch:** Update `next` (16.0.10) dan `react` (19.2.3) untuk menutup celah keamanan RCE (CVE-2025-55182).
*   **Performance:** Optimasi render Dashboard dengan menghapus `revalidatePath` yang memblokir.
*   **Bug Fixes:**
    *   Fix duplicate keys di list Challenge.
    *   Fix Prisma Client sync issue di mode development.
    *   Fix Event Handler error di Client Components.

---

## 📖 Dokumentasi Baru
*   `docs/GAME_ENGINE_DOCS.md` - Arsitektur teknis game engine.
*   `docs/GAME_LEVEL_GUIDE.md` - Panduan membuat level game baru.
*   `docs/DEPLOYMENT_CPANEL_FINAL.md` - Panduan deployment khusus shared hosting.

---

*Terima kasih telah menggunakan Erlass Platform!*
