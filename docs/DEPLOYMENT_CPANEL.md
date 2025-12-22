# Panduan Deployment Erlass Platform ke cPanel (Node.js)

Aplikasi ini dibangun menggunakan **Next.js 16** dengan **Prisma ORM**. Untuk menjalankannya di cPanel, Anda memerlukan fitur **Setup Node.js App**.

## Prasyarat
1.  Akses cPanel dengan fitur **Setup Node.js App**.
2.  Database **PostgreSQL** (jika cPanel mendukung) atau **MySQL** (umum di cPanel).
    *   *Catatan: Aplikasi ini dikonfigurasi untuk PostgreSQL. Jika cPanel Anda hanya menyediakan MySQL, Anda perlu mengubah provider di `prisma/schema.prisma` menjadi `mysql` dan memperbarui connection string.*
3.  Akses Terminal / SSH di cPanel (disarankan).

---

## Langkah 1: Persiapan Database

1.  Buat database baru di cPanel (misal: `erlass_db`).
2.  Buat user database dan password, lalu berikan hak akses penuh ke database tersebut.
3.  Siapkan **Connection String**.
    *   PostgreSQL: `postgresql://user:password@localhost:5432/erlass_db`
    *   MySQL: `mysql://user:password@localhost:3306/erlass_db`

---

## Langkah 2: Upload File

1.  Di komputer lokal, hapus folder `node_modules` dan `.next`.
2.  Zip seluruh isi project (kecuali `node_modules` dan `.git`).
3.  Upload file zip ke File Manager cPanel (misal ke folder `/home/user/erlass-platform`).
4.  Extract file zip tersebut.

---

## Langkah 3: Setup Node.js App di cPanel

1.  Buka menu **Setup Node.js App**.
2.  Klik **Create Application**.
3.  **Node.js Version**: Pilih versi **20.x** atau yang lebih baru (Next.js 15+ butuh Node terbaru).
4.  **Application Mode**: `Production`.
5.  **Application Root**: Masukkan path folder upload tadi (misal `erlass-platform`).
6.  **Application URL**: Pilih domain/subdomain (misal `erlass.sekolah.sch.id`).
7.  **Application Startup File**: `server.js` (Kita akan buat file ini nanti, biarkan kosong atau isi sementara).
8.  Klik **Create**.

---

## Langkah 4: Konfigurasi Environment Variable

1.  Di halaman detail Node.js App tadi, scroll ke bagian **Environment Variables**.
2.  Klik **Add Variable** dan masukkan:
    *   `DATABASE_URL`: (Connection string database Anda dari Langkah 1)
    *   `NEXTAUTH_SECRET`: (String acak panjang untuk enkripsi session)
    *   `NEXTAUTH_URL`: (URL aplikasi Anda, misal `https://erlass.sekolah.sch.id`)
    *   `NODE_ENV`: `production`

---

## Langkah 5: Install Dependencies & Build

1.  Masuk ke Terminal cPanel (atau SSH).
2.  Masuk ke virtual environment Node.js aplikasi Anda (perintahnya ada di halaman Setup Node.js App, contoh: `source /home/user/nodevenv/erlass-platform/20/bin/activate`).
3.  Masuk ke direktori aplikasi: `cd /home/user/erlass-platform`.
4.  Install dependensi:
    ```bash
    npm install
    ```
5.  Generate Prisma Client:
    ```bash
    npx prisma generate
    ```
6.  Migrasi Database (Push schema):
    ```bash
    npx prisma db push
    ```
    *(Hati-hati, ini akan menyinkronkan database dengan schema.prisma)*.
7.  Seed Database (Isi data awal):
    ```bash
    npm run seed
    ```
8.  Build Next.js:
    ```bash
    npm run build
    ```

---

## Langkah 6: Setup Custom Server (PENTING untuk cPanel)

cPanel dengan Phusion Passenger biasanya membutuhkan file entry point khusus. Next.js standalone build sangat disarankan.

1.  Pastikan `next.config.ts` atau `next.config.js` memiliki output standalone:
    ```javascript
    const nextConfig = {
      output: "standalone",
      // ... config lainnya
    };
    ```
    *(Jika belum, edit file tersebut di File Manager, lalu jalankan `npm run build` lagi)*.

2.  Buat file bernama `server.js` di root folder aplikasi (`/home/user/erlass-platform/server.js`) dengan isi:

    ```javascript
    const { createServer } = require('http')
    const { parse } = require('url')
    const next = require('next')

    const dev = process.env.NODE_ENV !== 'production'
    const hostname = 'localhost'
    const port = process.env.PORT || 3000
    
    // Konfigurasi agar membaca dari folder standalone hasil build
    const app = next({ dev, hostname, port, dir: __dirname })
    const handle = app.getRequestHandler()

    app.prepare().then(() => {
      createServer(async (req, res) => {
        try {
          const parsedUrl = parse(req.url, true)
          await handle(req, res, parsedUrl)
        } catch (err) {
          console.error('Error occurred handling', req.url, err)
          res.statusCode = 500
          res.end('internal server error')
        }
      })
        .listen(port, () => {
          console.log(`> Ready on http://${hostname}:${port}`)
        })
    })
    ```
    
    *Catatan: Jika menggunakan mode `standalone`, Anda mungkin perlu mengarahkan `dir` ke `.next/standalone` atau menyalin isi folder `.next/standalone` ke root tergantung struktur hosting. Namun cara termudah di cPanel seringkali menggunakan `next start` via script start.*

    **Alternatif Lebih Mudah (Tanpa server.js custom):**
    Ubah **Application Startup File** di setting cPanel menjadi: `node_modules/next/dist/bin/next` dan pastikan argumennya `start`.

---

## Langkah 7: Restart Aplikasi

1.  Kembali ke halaman **Setup Node.js App** di cPanel.
2.  Klik tombol **Restart**.
3.  Buka URL aplikasi Anda.

---

## Troubleshooting Umum

*   **500 Internal Server Error**: Cek log di folder aplikasi (biasanya `stderr.log`). Masalah umum adalah koneksi database gagal atau environment variable belum terbaca.
*   **Halaman 404**: Pastikan build berhasil dan folder `.next` terbentuk.
*   **Prisma Error**: Pastikan `npx prisma generate` sudah dijalankan di server.

## Akun Admin Default
Jika seed berhasil dijalankan:
*   Email: `admin@example.com`
*   Password: `password123` (atau sesuai yang ada di `prisma/seed.ts`)
