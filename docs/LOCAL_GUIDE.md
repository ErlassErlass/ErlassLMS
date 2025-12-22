# Panduan Menjalankan Erlass Platform Secara Lokal (Realtime)

Dokumentasi ini berisi langkah-langkah untuk menjalankan aplikasi di komputer lokal Anda untuk keperluan demo, testing, dan pengembangan fitur secara "realtime".

## 1. Prasyarat Sistem
Pastikan komputer Anda sudah terinstall:
*   **Node.js** (Versi 18.x atau terbaru, disarankan v20).
*   **PostgreSQL** (Database server).
    *   *Jika menggunakan Windows, pastikan service PostgreSQL berjalan.*
    *   *Alternatif: Gunakan Neon.tech atau Supabase jika tidak ingin install DB lokal.*

## 2. Instalasi

1.  **Install Dependencies**
    Buka terminal di folder project dan jalankan:
    ```bash
    npm install
    ```

2.  **Setup Environment Variables**
    Buat file `.env` di root folder (sejajar dengan `package.json`). Salin isi berikut dan sesuaikan password database Anda:
    
    ```env
    # Ganti 'password' dengan password DB lokal Anda
    # Ganti 'erlass_db' dengan nama database yang Anda buat
    DATABASE_URL="postgresql://postgres:password@localhost:5432/erlass_db?schema=public"

    # Generate string acak untuk ini (bisa ketik asal untuk lokal)
    NEXTAUTH_SECRET="rahasia-dapur-erlass-platform-123"
    
    # URL Lokal
    NEXTAUTH_URL="http://localhost:3000"
    ```

## 3. Setup Database

1.  **Sinkronisasi Schema**
    Perintah ini akan membuat tabel-tabel di database Anda sesuai dengan `prisma/schema.prisma`.
    ```bash
    npx prisma db push
    ```

2.  **Isi Data Awal (Seeding)**
    Isi database dengan data dummy (Admin, User, Kursus Contoh) agar aplikasi tidak kosong saat dibuka.
    ```bash
    npm run seed
    ```
    *Output akan menampilkan akun default yang dibuat.*

    **Akun Default:**
    *   **Admin**: `admin@example.com` / `password123`
    *   **Mentor**: `mentor@example.com` / `password123`

3.  **Isi Data Kurikulum Tambahan (Opsional)**
    Jika ingin data yang lebih lengkap (Python, JavaScript, dll), jalankan script tambahan ini satu per satu:
    ```bash
    npx tsx scripts/populate-javascript-course.ts
    npx tsx scripts/populate-python-course.ts
    ```

## 4. Menjalankan Aplikasi

Jalankan server development:
```bash
npm run dev
```

Buka browser dan akses: **[http://localhost:3000](http://localhost:3000)**

---

## 5. Skenario Testing "Realtime"

Berikut alur yang bisa Anda coba untuk mendemokan fitur-fitur terbaru:

### A. Testing Admin (Bulk Import & Bank Soal)
1.  Login sebagai **Admin** (`admin@example.com`).
2.  Masuk ke Dashboard -> **Manajemen Kursus**.
3.  Coba fitur **Bulk Import**:
    *   Klik "Bulk Import".
    *   Paste JSON contoh yang ada di halaman tersebut.
    *   Lihat kursus baru otomatis muncul di daftar.
4.  Masuk ke **Bank Soal**:
    *   Buat Bank Soal baru.
    *   Tambah soal baru dan coba masukkan URL Gambar/Video YouTube di kolom Media.
    *   Lihat preview media muncul di sebelah kiri.

### B. Testing Siswa (Enrollment & Gamification)
1.  Buka browser lain (Incognito/Private) atau Logout.
2.  Daftar akun baru (Sign Up) atau login user biasa.
3.  Pilih Kursus (misal: Python atau JavaScript).
4.  Klik tombol **"Mulai Belajar Gratis"**.
    *   *Perhatikan status berubah jadi "Lanjut Belajar".*
    *   *Cek di database/Analytics admin, jumlah enrollment bertambah.*
5.  Buka materi pertama.
6.  Klik "Tandai Selesai" atau kerjakan tantangan koding.
    *   *Cek Profil: XP bertambah.*
    *   *Cek Leaderboard: Nama user muncul di peringkat.*

### C. Testing Fitur Baru (Challenge Maker & Easter Egg)
1.  **Manajemen Tantangan (Admin)**:
    *   Masuk ke Dashboard -> **Manajemen Tantangan**.
    *   Klik "Buat Tantangan".
    *   Coba buat tantangan dengan kategori berbeda:
        *   **Python**: Akan muncul editor kode Python.
        *   **Web**: Akan muncul editor HTML dengan Live Preview.
        *   **Scratch**: Akan muncul embedded Scratch Editor.
    *   Isi "Starter Code" dan "Expected Output" untuk Python.

2.  **Easter Egg (Rahasia)**:
    *   Di halaman mana saja (Dashboard disarankan), ketikkan kode legendaris Konami di keyboard:
        `↑ ↑ ↓ ↓ ← → ← → B A`
        *(Atas, Atas, Bawah, Bawah, Kiri, Kanan, Kiri, Kanan, b, a)*
    *   Lihat animasi Confetti dan notifikasi Badge baru.
    *   Cek menu **Profil Saya**, badge "Hacker Man" akan muncul di koleksi.

### D. Tips Troubleshooting
*   Jika ada error database: Cek apakah PostgreSQL berjalan.
*   Jika perubahan kode tidak muncul: Refresh browser (Next.js biasanya auto-refresh, tapi kadang butuh manual reload).
*   Jika gambar tidak muncul: Pastikan URL gambar valid dan bisa diakses publik.
*   Jika Konami Code tidak jalan: Pastikan fokus window aktif (klik area kosong di halaman dulu).

Selamat mencoba! 🚀
