# PANDUAN DEPLOYMENT ERLASS KE CPANEL (FINAL)

Panduan ini disusun khusus untuk arsitektur Next.js 16 + Prisma + PostgreSQL/MySQL di lingkungan cPanel (Shared Hosting).

## Prasyarat cPanel
1.  **Node.js Support:** Pastikan cPanel memiliki fitur "Setup Node.js App". Versi Node.js minimal 18.x atau 20.x.
2.  **Database:** PostgreSQL (Disarankan) atau MySQL (MariaDB).

---

## LANGKAH 1: Persiapan Lokal (Build)

Karena keterbatasan resource di cPanel, kita akan melakukan build di komputer lokal.

1.  **Konfigurasi Standalone:**
    Pastikan `next.config.ts` sudah memiliki `output: "standalone"`.

2.  **Build Project:**
    Jalankan perintah ini di terminal lokal:
    ```bash
    npm run build
    ```

3.  **Siapkan Folder Deployment:**
    Setelah build sukses, akan muncul folder `.next/standalone`. Folder ini yang akan kita upload.
    
    Struktur folder yang akan di-upload:
    - `.next/standalone` (Isi folder ini yang utama)
    - `.next/static` (Copy folder ini ke `.next/standalone/.next/static`)
    - `public` (Copy folder ini ke `.next/standalone/public`)

    **PENTING:**
    Copy folder `.next/static` dari root project ke dalam folder `.next/standalone/.next/static`. Ini wajib agar CSS/JS termuat.

4.  **Zip Folder:**
    Zip isi dari folder `.next/standalone` menjadi `deploy.zip`.

---

## LANGKAH 2: Upload ke cPanel

1.  **File Manager:**
    Buka File Manager di cPanel. Buat folder baru, misal `erlass-app`.
    Upload `deploy.zip` ke folder tersebut dan ekstrak.

2.  **Copy Static Files (Alternatif):**
    Jika gambar/style tidak muncul, pastikan folder `.next` dan `public` ada di dalam `erlass-app`.

---

## LANGKAH 3: Setup Database

1.  **Buat Database:**
    Di cPanel > PostgreSQL Databases (atau MySQL), buat database baru (misal: `user_erlass_db`) dan user database baru.

2.  **Migrasi Data:**
    - **Opsi A (Remote Push):** Jika cPanel mengizinkan remote connection, edit `.env` lokal ke IP cPanel, lalu `npx prisma db push`.
    - **Opsi B (Import Manual):** 
      - Di lokal, dump database: `pg_dump -U user dbname > backup.sql`
      - Di cPanel (phpPgAdmin), import `backup.sql`.

---

## LANGKAH 4: Konfigurasi Node.js App

1.  Buka **"Setup Node.js App"** di cPanel.
2.  Klik **Create Application**.
3.  **Settings:**
    - **Node.js Version:** 20.x (atau terbaru).
    - **Application Mode:** Production.
    - **Application Root:** `erlass-app` (folder tempat kita ekstrak zip).
    - **Application URL:** `erlass.com` (domain anda).
    - **Application Startup File:** `server.js` (ini file yang dihasilkan mode standalone).
4.  Klik **Create**.

---

## LANGKAH 5: Environment Variables

1.  Di menu Node.js App tadi, scroll ke bawah bagian **Environment Variables**.
2.  Tambahkan variabel sesuai file `.env` lokal:
    - `DATABASE_URL` -> `postgresql://DB_USER:DB_PASSWORD@127.0.0.1:5432/DB_NAME` (Sesuaikan dengan Langkah 1).
    - `NEXTAUTH_SECRET` -> Isi dengan string acak panjang.
    - `NEXTAUTH_URL` -> `https://domain-anda.com` (Sesuai URL aplikasi).
    - `IPAYMU_VA` -> (Isi VA iPaymu).
    - `IPAYMU_API_KEY` -> (Isi API Key).
3.  Klik **Save**.

---

## LANGKAH 6: Jalankan & Restart

1.  Klik tombol **Restart** di halaman Node.js App.
2.  Buka domain Anda. Aplikasi seharusnya sudah berjalan.

## Troubleshooting Umum

- **Error 500 / Aplikasi Crash:**
  Cek `stderr.log` di folder aplikasi. Biasanya karena koneksi database gagal atau port bentrok.
- **Gambar/Style Hilang:**
  Pastikan folder `.next/static` sudah dicopy ke `.next/standalone/.next/static` sebelum di-zip. Ini kesalahan paling umum mode standalone.
- **Prisma Error:**
  Jika muncul error Prisma Client, Anda mungkin perlu men-generate ulang prisma binary di server cPanel.
  Masuk ke terminal cPanel (SSH), masuk ke folder app, lalu jalankan:
  `npm install prisma @prisma/client`
  `npx prisma generate`
