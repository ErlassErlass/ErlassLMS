# 🌌 CODE SPACE: SYSTEM BLUEPRINT & UX STRATEGY
**Version:** 1.0  
**Status:** Approved Draft  
**Theme:** Space Exploration (Sci-Fi / Astronaut)  

---

## 1. CORE IDENTITY (Identitas Utama)

### 1.1 Filosofi
Code Space bukan sekadar LMS (Learning Management System), melainkan **LXP (Learning Experience Platform)**. Kami mengubah proses belajar coding yang abstrak menjadi petualangan antargalaksi yang nyata, seru, dan terukur.

### 1.2 Visual Theme
*   **Style:** Modern Sci-Fi, Glassmorphism, Neon Accents, Dark Mode Dominant.
*   **Color Palette:**
    *   Deep Space (Background): `#0B0E14` (Hitam Kebiruan)
    *   Nebula Purple (Accent): `#8A2BE2`
    *   Star Dust (Text): `#F0F8FF`
    *   Rocket Red (Action/Button): `#FF4500`
    *   Tech Cyan (Highlight): `#00FFFF`

### 1.3 Karakter Pemandu (Persona)
*   👨‍🚀 **Captain Tio**
    *   **Peran:** Commander, Motivator.
    *   **Sifat:** Energik, Pemberani, Action-oriented.
    *   **Dialog Style:** *"Mesin siap! Ayo luncurkan kodenya!"*, *"Jangan takut error, itu bagian dari eksplorasi!"*
*   👩‍🚀 **Navigator Arini**
    *   **Peran:** Strategist, Guide, Data Analyst.
    *   **Sifat:** Cerdas, Tenang, Informatif, Detail.
    *   **Dialog Style:** *"Sistem mendeteksi anomali pada baris 4."*, *"Rute terbaikmu adalah menyelesaikan Modul Python dulu."*

---

## 2. USER ONBOARDING JOURNEY: "MISSION LAUNCH"

Fase krusial di mana user baru (Cadet) diubah menjadi user aktif.

### Phase 1: The Airlock (Login & Welcome)
1.  **Login Screen:** Background animasi *parallax stars*. Form login transparan.
2.  **Welcome Modal:**
    *   Pintu airlock terbuka. Tio & Arini muncul menyapa nama user.
    *   **Call to Action:** Tombol [ 🚀 AKTIFKAN SYSTEM ]

### Phase 2: System Diagnostic (Dashboard Tour)
Menggunakan *overlay spotlight* interaktif (bukan video pasif).
1.  **ID Card (Profil):** "Identitas resmi Cadet."
2.  **Star Map (My Courses):** "Peta navigasi belajarmu."
3.  **Fuel Tank (XP Bar):** "Isi bahan bakar dengan menyelesaikan misi."
4.  **Radar (Quest Sidebar):** "Deteksi misi harian di sini."

### Phase 3: Select Your Galaxy (Learning Path)
User memilih divisi fokus utama mereka (bisa diubah nanti). Tampilan 3 Kartu Hologram:
1.  **🧩 Visual Space (Scratch):** Untuk Game Creator.
2.  **🐍 Python Nebula (Python):** Untuk Data & Logic.
3.  **🤖 AI Intelligence (Artificial Intelligence):** Untuk Innovator.

### Phase 4: Ignition (First Micro-Challenge)
Tantangan 30 detik untuk "menyalakan mesin".
*   *Contoh Python:* Ketik `print("Ignition")`.
*   *Reward:* Badge "🏅 First Spark" + Animasi roket meluncur.

### Phase 5: Supply Drop (Welcome Kit)
Arini memberikan perbekalan digital.
1.  **ID Card Holografik:** PNG personalisasi user.
2.  **Galactic Map (Roadmap PDF):** Infografis jalur belajar.
3.  **Manual Book (Cheatsheet):** PDF istilah coding & aturan komunitas.
4.  **Starter Item:** Helm/Skin dasar untuk Avatar.

---

## 3. GAMIFICATION ARCHITECTURE

Sistem level & reward diadaptasi ke istilah luar angkasa.

### 3.1 Leveling System (Rank)
| Level | Rank Title | Syarat XP |
| :--- | :--- | :--- |
| 1-5 | **Cadet** | 0 - 500 |
| 6-10 | **Explorer** | 501 - 1500 |
| 11-15 | **Officer** | 1501 - 3000 |
| 16-20 | **Commander** | 3001 - 5000 |
| 21+ | **Star Lord** | 5001+ |

### 3.2 Currency
*   **XP (Bahan Bakar):** Didapat dari belajar. Menentukan Level.
*   **Credits (Star Coin):** Didapat dari *Daily Quest* & *Perfect Score*. Bisa ditukar item avatar (Helm, Background Profil).

### 3.3 Badges (Medali Misi)
*   **Planet Conqueror:** Menyelesaikan 1 Kursus penuh.
*   **Bug Hunter:** Submit laporan bug/error.
*   **Hyper Speed:** Menyelesaikan kuis di bawah 1 menit.
*   **Gravity Assist:** Membantu user lain di forum.

---

## 4. STRUKTUR KONTEN (KURIKULUM)

Kurikulum dipetakan sebagai "Sektor Galaksi".

### Sektor 1: Visual Space (SD)
*   **Misi:** "Projek Coding Scratch"
*   **Misi:** "Kurikulum 20 PTM"

### Sektor 2: Python Nebula (SMP/SMA)
*   **Misi:** "Python Explorer (SMP)"
*   **Misi:** "Python Mastery (SMA)"

### Sektor 3: Tech Frontier (Robotics & AI)
*   **Misi:** "Micro:bit Learning Kit"
*   **Misi:** "Chatbot AI Dasar"

---

## 5. TECHNICAL IMPLEMENTATION STRATEGY

### 5.1 Tech Stack
*   **Framework:** Next.js 14+ (App Router).
*   **UI Library:** Tailwind CSS + Shadcn/UI + Framer Motion (untuk animasi sci-fi).
*   **Tour Library:** `driver.js` (Ringan, customizable).
*   **Database:** PostgreSQL + Prisma.

### 5.2 Asset Needs
*   **Illustrations:** Karakter Tio & Arini (Pose: Hello, Explaining, Success, Thinking).
*   **Icons:** Set ikon neon (SVG) untuk folder, roket, planet, robot.
*   **Sound FX:** (Opsional) Suara "Bleep-bloop" UI futuristik saat klik tombol.

---

## 6. NEXT STEPS (Action Plan)

1.  **Asset Creation:** Desain karakter Tio & Arini (bisa pakai AI Art generator dulu untuk prototype).
2.  **Frontend Prototyping:** Buat halaman Login & Dashboard dengan tema Space (ubah warna CSS variable).
3.  **Tour Implementation:** Pasang `driver.js` dan masukkan script dialog Tio & Arini.
4.  **Welcome Kit Generation:** Buat template HTML/Canvas untuk generate ID Card otomatis.

---
*Dokumen ini adalah acuan utama pengembangan Code Space. Setiap fitur baru harus selaras dengan tema "Space Exploration".*
