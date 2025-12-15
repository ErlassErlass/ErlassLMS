# 📘 PANDUAN PENGEMBANGAN & ARSITEKTUR APLIKASI ERLASS PLATFORM

Dokumen ini berisi peta lokasi file untuk kustomisasi tampilan (Frontend) dan penjelasan struktur database (Backend) untuk memudahkan pengembangan atau pemeliharaan aplikasi.

---

## 🎨 BAGIAN 1: Peta File Tampilan (Frontend)

Jika Anda ingin mengubah warna, kata-kata, atau tata letak secara manual, inilah file-file kuncinya:

### 1. Tampilan Utama (Landing Page)
*   **Lokasi**: `src/app/page.tsx`
*   **Fungsi**: Halaman depan website sebelum login.
*   **Apa yang bisa diubah**: Kata-kata marketing ("Coding itu Seru"), gambar ilustrasi, bagian fitur, dan footer.

### 2. Tema & Warna Global
*   **Lokasi**: `src/app/globals.css`
*   **Fungsi**: Mengatur warna dasar (Primary, Secondary), font, dan background pattern.
*   **Apa yang bisa diubah**: Jika ingin mengubah warna hijau mint (`#41A67E`) menjadi warna lain, ubah kode hex di bagian `:root`.

### 3. Navigasi & Sidebar (Dashboard)
*   **Lokasi**: `src/components/dashboard/DashboardNav.tsx`
*   **Fungsi**: Sidebar menu (kiri) dan Header atas saat user login.
*   **Apa yang bisa diubah**: Menambah menu baru, mengubah ikon menu, atau mengubah logo "E" di pojok kiri atas.

### 4. Komponen UI (Tombol, Kartu, Input)
*   **Lokasi**: `src/components/ui/...` (Folder ini berisi banyak file kecil)
*   **Fungsi**: Komponen "lego" yang dipakai berulang-ulang.
*   **Contoh**:
    *   `button.tsx`: Mengubah bentuk semua tombol di aplikasi (misal: mau lebih bulat atau kotak).
    *   `card.tsx`: Mengubah gaya kotak pembungkus konten.
    *   `input.tsx`: Mengubah gaya kolom isian formulir.

### 5. Halaman Kursus (Learning Area)
*   **Daftar Kursus**: `src/app/dashboard/courses/page.tsx`
*   **Detail Kursus**: `src/app/dashboard/courses/[courseId]/page.tsx`
*   **Player Belajar**: `src/app/dashboard/courses/[courseId]/learn/[sectionId]/page.tsx`

---

## 🗄️ BAGIAN 2: Relasi Database (Entity Relationship)

Aplikasi ini menggunakan database **PostgreSQL** dengan struktur yang saling terhubung. Berikut adalah penjelasan logikanya dalam bahasa manusia:

### 1. Ekosistem User (Pengguna)
*   **User (Siswa/Admin)** adalah pusat dari segalanya.
*   **Relasi**:
    *   **1 User** bisa memiliki **Banyak Enrollment** (Daftar kursus yang diikuti).
    *   **1 User** bisa memiliki **Banyak Transaction** (Riwayat pembayaran).
    *   **1 User** bisa memiliki **Banyak UserBadge** (Prestasi/Piala yang didapat).
    *   **1 User** bisa memiliki **1 Mentor Profile** (Jika dia adalah guru).

### 2. Ekosistem Kursus (LMS Core)
Struktur kursus bertingkat seperti pohon:
*   **Category** (Kategori Utama, misal: "Pemrograman")
    *   ↳ **Course** (Mata Pelajaran, misal: "Python Dasar")
        *   ↳ **Section** (Bab/Materi, misal: "Bab 1: Variabel")
            *   ↳ **Quiz** (Ujian per Bab)
            *   ↳ **UserProgress** (Penanda apakah siswa sudah selesai membaca bab ini).

### 3. Sistem Ujian (Quiz & Bank Soal)
*   **QuestionBank** (Bank Soal): Gudang soal mentah yang dibuat Admin.
*   **Question**: Butir soal (Pilihan Ganda/Benar Salah) yang ada di dalam Bank Soal.
*   **Quiz**: Kumpulan soal yang ditarik dari Bank Soal untuk dikerjakan siswa di Bab tertentu.
*   **QuizAttempt**: Rekaman data saat siswa mengerjakan kuis (Nilai, Waktu, Jawaban).

### 4. Sistem Pembayaran & Voucher
*   **Voucher**: Kode diskon (misal: `DISKON50` atau `SMAN1JKT`).
*   **Transaction**: Catatan pembelian.
    *   Menghubungkan **User** + **Course** + **Voucher**.
    *   Statusnya bisa `PENDING`, `PAID`, atau `FAILED`.
*   **Enrollment**: Tiket masuk siswa ke kursus. Hanya dibuat jika Transaksi `PAID` (atau jika kursus Gratis).

---

## 📊 Diagram Alur Data (Sederhana)

```mermaid
[USER]
  ║
  ╠═══ < Enrollment > ════╗
  ║                       ║
  ╠═══ < Transaction > ══ [COURSE] ══> [CATEGORY]
  ║                       ║
  ╠═══ < UserBadge >      ╚═══ [SECTION]
  ║                               ║
  ╚═══ < QuizAttempt > ════════ [QUIZ]
                                  ║
                               [QUESTION] <══ [QUESTION BANK]
```

**Ringkasan Logika Bisnis:**
1.  Siswa daftar -> Masuk tabel **User**.
2.  Siswa beli kursus -> Masuk tabel **Transaction**.
3.  Bayar sukses -> Masuk tabel **Enrollment**.
4.  Siswa belajar -> Data tersimpan di **UserProgress**.
5.  Siswa ujian -> Data tersimpan di **QuizAttempt**.
6.  Siswa lulus kriteria -> Dapat **Badge**.
