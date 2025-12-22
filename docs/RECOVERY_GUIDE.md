# Panduan Pemulihan Sistem (System Recovery Guide)

Dokumen ini menjelaskan langkah-langkah untuk membangun ulang (rebuild) Erlass Platform jika terjadi kerusakan sistem, perpindahan server, atau kehilangan data, menggunakan file **Full Backup (.zip)** yang dihasilkan dari Admin Panel.

---

## 1. Prasyarat (Prerequisites)

Pastikan server baru atau lingkungan lokal memiliki:
*   **Node.js** (Versi 18 atau lebih baru)
*   **PostgreSQL** (Versi 14 atau lebih baru)
*   **Git** (Opsional, jika clone dari repo)
*   **Command Line Tools** (`psql`, `npm`)

---

## 2. Struktur File Backup

File backup `.zip` yang Anda download berisi:
1.  `database.sql` - Dump lengkap database (skema + data).
2.  `uploads/` - Folder berisi semua gambar/file yang diupload (cover kursus, dll).
3.  `.env.backup` - Salinan konfigurasi environment (Opsional).

---

## 3. Langkah Pemulihan (Step-by-Step Recovery)

### Langkah 1: Siapkan Kode Aplikasi (Codebase)

Jika server benar-benar kosong, clone ulang kode dari repository Git Anda.

```bash
git clone https://github.com/username/erlass-platform.git
cd erlass-platform
npm install
```

### Langkah 2: Pulihkan Konfigurasi (.env)

Ekstrak file backup Anda. Salin isi `.env.backup` ke file `.env` baru di root folder aplikasi.

**PENTING**: Periksa kembali `DATABASE_URL` di dalam `.env`. Jika Anda pindah server, pastikan kredensial database (username, password, host) sesuai dengan server baru.

```bash
# Contoh .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/erlass_new_db"
NEXTAUTH_URL="http://domain-baru-anda.com"
NEXTAUTH_SECRET="rahasia-anda"
```

### Langkah 3: Pulihkan Database

Gunakan tool `psql` untuk merestore file `database.sql` ke database baru.

1.  Buat database kosong (jika belum ada):
    ```bash
    createdb erlass_new_db
    ```

2.  Import data dari SQL dump:
    ```bash
    # Format: psql -U [username] -d [database_name] -f [file_backup.sql]
    psql -U postgres -d erlass_new_db -f database.sql
    ```

    *Catatan: Jika ada error "role does not exist", abaikan saja jika itu terkait role superuser lama, selama tabel dan data masuk.*

3.  Jalankan Prisma Generate untuk memastikan client sinkron:
    ```bash
    npx prisma generate
    ```

### Langkah 4: Pulihkan File Upload

Salin folder `uploads` dari hasil ekstrak backup ke folder `public/` di aplikasi.

Struktur akhir harusnya:
```
erlass-platform/
├── public/
│   ├── uploads/
│   │   ├── courses/
│   │   └── ...
```

### Langkah 5: Jalankan Aplikasi

Build dan jalankan aplikasi.

```bash
npm run build
npm start
```

---

## 4. Troubleshooting

### Masalah: Gagal membuat backup di Windows/Laragon
**Penyebab**: Perintah `pg_dump` tidak ditemukan oleh sistem.
**Solusi**:
1.  Cari lokasi instalasi PostgreSQL (contoh: `C:\laragon\bin\postgresql\bin`).
2.  Tambahkan path tersebut ke **System Environment Variables -> Path** di Windows.
3.  Restart terminal/Laragon.

### Masalah: Gambar tidak muncul setelah restore
**Solusi**: Pastikan folder `public/uploads` memiliki permission yang benar agar bisa dibaca oleh web server.

### Masalah: Login Gagal setelah restore
**Solusi**: Pastikan `NEXTAUTH_SECRET` di `.env` sama dengan yang lama. Jika berbeda, session lama akan invalid, user harus login ulang.
