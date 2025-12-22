# Panduan Deployment ke Shared Hosting (cPanel) dengan Spesifikasi Tinggi

Panduan ini disusun khusus untuk deployment **Erlass Platform** ke Shared Hosting (8 Core, 10GB RAM) menggunakan **Node.js** dan database **MySQL**.

---

## Bagian 1: Persiapan Database (Migrasi ke MySQL)

Sebagian besar shared hosting menggunakan MySQL/MariaDB. Aplikasi ini default-nya menggunakan PostgreSQL. Lakukan langkah ini HANYA jika hosting Anda tidak menyediakan PostgreSQL.

### 1. Update Schema Prisma
Buka file `prisma/schema.prisma`:

1.  Ubah provider datasource:
    ```prisma
    datasource db {
      provider = "mysql" // Ubah dari postgresql ke mysql
      url      = env("DATABASE_URL")
    }
    ```

2.  Perbaiki tipe data text (MySQL butuh spesifikasi panjang untuk Text, atau gunakan `@db.Text` atau `@db.LongText` untuk teks panjang).
    *   Untuk `description`, `content`, `instructions` yang panjang, tambahkan `@db.Text`.
    *   Contoh: `content String? @db.Text`

### 2. Update Dependensi
Jalankan perintah ini di lokal:
```bash
# Hapus folder migrasi lama (karena format postgres beda dengan mysql)
rm -rf prisma/migrations

# Update package
npm install mysql2
```

### 3. Update Environment Variable Lokal (.env)
Ubah koneksi ke format MySQL untuk testing lokal (jika punya MySQL lokal):
```bash
DATABASE_URL="mysql://user:password@localhost:3306/erlass_db"
```

---

## Bagian 2: Persiapan Kode Aplikasi (Build)

Agar hemat storage SSD hosting (12GB) dan performa maksimal, kita akan menggunakan mode **Standalone**.

### 1. Konfigurasi Next.js
Buka `next.config.ts` (atau `.js`), tambahkan konfigurasi output:

```javascript
const nextConfig = {
  output: 'standalone', // PENTING: Ini membuat folder build yang kecil & mandiri
  // ... config lainnya
};
```

### 2. Build Project
Jalankan build di komputer lokal Anda (karena CPU lokal biasanya lebih cepat untuk build daripada shared hosting, dan menghemat kuota inode hosting).

```bash
npm run build
```

Setelah selesai, akan muncul folder `.next/standalone`.

### 3. Siapkan File Siap Upload
Kita perlu mengupload file-file berikut ke hosting:

1.  Isi folder `.next/standalone` (ini adalah inti aplikasi).
2.  Folder `.next/static` (pindahkan folder `static` ini ke dalam `.next/standalone/.next/static`).
3.  File `public` folder (copy ke `.next/standalone/public`).
4.  File `server.js` (custom server yang sudah dibuatkan).
5.  File `prisma` folder (untuk generate client di server).
6.  `package.json` (hanya untuk referensi script start).

**Tips**: Zip semua isi dari folder `.next/standalone` (pastikan folder `public` dan `.next/static` sudah dimasukkan ke dalamnya sesuai struktur).

---

## Bagian 3: Konfigurasi di cPanel

### 1. Setup Node.js App
1.  Login cPanel -> Cari menu **"Setup Node.js App"**.
2.  Klik **Create Application**.
3.  **Node.js Version**: Pilih v18 atau v20 (Terbaru yang stabil).
4.  **Application Mode**: `Production`.
5.  **Application Root**: `erlass-app` (nama folder bebas).
6.  **Application URL**: Pilih domain/subdomain.
7.  **Application Startup File**: `server.js` (PENTING).
8.  Klik **Create**.

### 2. Upload File
1.  Masuk ke **File Manager**.
2.  Buka folder `erlass-app` (yang baru dibuat).
3.  Upload file ZIP yang sudah disiapkan di Bagian 2.
4.  Ekstrak ZIP tersebut. Pastikan strukturnya benar (ada `server.js`, folder `.next`, `node_modules` dari standalone, dll).

### 3. Setup Database
1.  Di cPanel -> **MySQL Database Wizard**.
2.  Buat Database baru (misal `u12345_erlass`).
3.  Buat User baru (misal `u12345_admin`) dan password kuat.
4.  Berikan hak akses `ALL PRIVILEGES`.

### 4. Konfigurasi Environment (.env)
Di folder aplikasi (`erlass-app`) di File Manager, buat file `.env`:

```env
# Format MySQL cPanel: mysql://user_db:password@localhost:3306/nama_db
DATABASE_URL="mysql://u12345_admin:PasswordKuat123@localhost:3306/u12345_erlass"

NEXTAUTH_URL="https://domain-anda.com"
NEXTAUTH_SECRET="string-acak-panjang-untuk-keamanan"

# iPaymu
IPAYMU_VA="0000002117071800"
IPAYMU_API_KEY="SANDBOX..."
```

### 5. Install & Start
1.  Kembali ke menu **Setup Node.js App**.
2.  Klik tombol **"Run NPM Install"** (Ini akan menginstall dependensi ringan tambahan jika diperlukan, tapi mode standalone biasanya sudah membawa `node_modules` sendiri. Jika standalone, langkah ini bisa diskip atau cukup jalankan `npm install prisma` saja untuk generate).
3.  **PENTING**: Kita perlu menjalankan migrasi database (push schema) dari server.
    *   Masuk ke terminal (SSH) atau gunakan fitur "Run command" di Node.js app jika ada.
    *   Jalankan: `npx prisma db push` (Ini akan membuat tabel di database MySQL cPanel).
4.  Klik tombol **Restart** di halaman Setup Node.js App.

---

## Troubleshooting Umum

### 1. Error 500 / Aplikasi tidak jalan
*   Cek file log di folder aplikasi (biasanya `stderr.log`).
*   Pastikan `server.js` ada dan nama file startup di setting cPanel sesuai.
*   Pastikan port tidak di-hardcode (gunakan `process.env.PORT`).

### 2. Gambar Upload Tidak Muncul
*   Di mode Standalone, Next.js serving static file agak tricky.
*   Pastikan folder `public/uploads` ada.
*   Jika masih bermasalah, pertimbangkan menggunakan layanan external seperti Cloudinary atau S3 (mengingat storage SSD hosting terbatas 12GB).

### 3. Storage Penuh
*   Cek folder `.npm` atau `cache` di hosting, seringkali memakan tempat. Bersihkan secara berkala.
*   Ingat: 12GB SSD dibagi untuk OS (virtual), Email, Database, dan File Aplikasi.

---

**Selamat!** Dengan spesifikasi 8 Core / 10GB RAM, aplikasi ini akan berjalan sangat kencang untuk ribuan user.
