# ERLASS PLATFORM - Release Notes v2.1 🚀

**Tanggal Rilis:** 16 Desember 2025
**Versi:** 2.1.0 (Interactive Learning Update)

Versi 2.1 berfokus pada pengalaman belajar yang lebih dalam dan interaktif, dengan sistem eksekusi kode nyata dan fitur kolaborasi sosial.

---

## ✨ Fitur Baru Utama

### 1. ⚡ Real Code Execution (Judge0 Integration)
Tidak ada lagi "Mock" atau "Simulasi" untuk bahasa pemrograman teks.
*   **Live Python & JavaScript Runner:** Kode siswa dieksekusi secara nyata di server (via Piston API).
*   **Strict Output Validation:** Jawaban dinilai berdasarkan output konsol yang presisi.
*   **Security:** Eksekusi dilakukan di lingkungan terisolasi yang aman.

### 2. 💬 Course Discussion System (Fitur Sosial)
*   **Lesson Comments:** Siswa dapat bertanya dan berdiskusi langsung di setiap halaman materi (Video/Artikel).
*   **Threaded Replies:** Mendukung balasan bertingkat untuk percakapan yang lebih terstruktur.
*   **Moderation:** Mentor dan Admin dapat menghapus komentar yang tidak pantas.
*   **Toggle:** Mentor dapat mengaktifkan/menonaktifkan komentar per materi.

### 3. 📚 Curriculum V2 & Learning Scenarios
Struktur kurikulum baru yang mendukung berbagai metodologi pengajaran:
*   **Traditional:** Urutan materi linear dengan kuis.
*   **Project-Based:** Fokus pada *Challenge Submission*.
*   **Blended Learning:** Kombinasi materi online dan jadwal sesi live.
*   **Competency-Based:** Kelulusan berbasis Badges.
*   **Kategori Baru:** Python, Web Dev, Visual (Scratch), AI, Robotics, Digital Literacy.

### 4. 🎭 Advanced Role & Persona System
Implementasi sistem persona pengguna yang lebih dinamis:
*   **Space Cadet:** Pengguna baru (< 1 jam).
*   **Star Explorer:** Pengguna gratis.
*   **Galactic Patron:** Pengguna berbayar/premium.
*   **Starfleet Captain:** Mentor dengan spesialisasi (AI/Python/Scratch).
*   **Team Teaching:** Satu kursus kini bisa memiliki banyak mentor (`CourseMentor`).

---

## 🛠️ Perbaikan & Peningkatan (Updates)

*   **Daily Quests Fix:** Perbaikan logika timezone yang menyebabkan misi harian kadang tidak muncul atau tidak ter-reset.
*   **Challenge Editor Update:**
    *   Integrasi editor **Scratch** dari `machinelearningforkids.co.uk`.
    *   Integrasi editor **Micro:bit** dari `makecode.microbit.org`.
    *   Mode editor otomatis berdasarkan kategori tantangan.
*   **Badges:** Menggunakan aset SVG emoji standar untuk performa dan konsistensi visual yang lebih baik.
*   **Database:** Sinkronisasi skema Prisma dengan struktur data terbaru (LessonComment, CourseMentor, LearningScenario).

---

*Terus belajar dan jelajahi semesta kode bersama Erlass!*
