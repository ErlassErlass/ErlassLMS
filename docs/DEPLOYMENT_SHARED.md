# Panduan Deployment Erlass Platform ke Shared Hosting (cPanel)

Aplikasi Erlass Platform dibangun menggunakan **Next.js**. Untuk men-deploy ke Shared Hosting (seperti Niagahoster, Hostinger, DomaiNesia) yang menggunakan cPanel, ada beberapa penyesuaian khusus karena Shared Hosting biasanya tidak mendukung server Node.js yang berjalan terus-menerus (long-running process) secara native seperti VPS.

Namun, kita bisa menggunakan fitur **Node.js App** di cPanel (jika tersedia) atau menggunakan mode **Static Export** (dengan keterbatasan fitur).

> **SANGAT DISARANKAN**: Gunakan VPS (Virtual Private Server) atau Platform as a Service (Vercel, Railway) untuk performa terbaik dan fitur lengkap (Server Actions, Image Optimization).
>
> Jika Anda **HARUS** menggunakan Shared Hosting, ikuti panduan ini.

---

## Metode 1: Menggunakan Fitur "Setup Node.js App" di cPanel (Disarankan)

Metode ini memungkinkan fitur Server-Side (SSR), API Routes, dan Database bekerja normal.

### Prasyarat:
1.  Hosting mendukung **Node.js** (Cek di cPanel ada menu "Setup Node.js App").
2.  Akses SSH/Terminal.
3.  Database PostgreSQL (Disarankan pakai database luar seperti Neon.tech atau Supabase karena hosting shared biasanya MySQL. Jika pakai MySQL, perlu ubah schema prisma).

### Langkah-langkah:

1.  **Persiapan Project Lokal**:
    *   Pastikan file `next.config.ts` atau `next.config.js` menggunakan output standalone.
        ```javascript
        const nextConfig = {
          output: "standalone",
          // ...
        };
        ```
    *   Hapus folder `.next`, `node_modules`.
    *   Compress (Zip) seluruh project (kecuali `.git`, `node_modules`, `.next`).

2.  **Upload ke cPanel**:
    *   Login cPanel -> File Manager.
    *   Buat folder baru, misal `erlass-app`.
    *   Upload dan Extract file Zip di sana.

3.  **Setup Node.js App**:
    *   Buka menu **Setup Node.js App** di cPanel.
    *   Klik **Create Application**.
    *   **Node.js Version**: Pilih v18 atau v20.
    *   **Application Mode**: Production.
    *   **Application Root**: `erlass-app` (folder yang tadi dibuat).
    *   **Application URL**: Pilih domain/subdomain (misal `kursus.sekolah.sch.id`).
    *   **Application Startup File**: `server.js` (Kita akan buat ini manual).
    *   Klik **Create**.

4.  **Buat Custom Server (`server.js`)**:
    *   Karena cPanel menggunakan Passenger, kita butuh entry point khusus.
    *   Di dalam folder `erlass-app`, buat file baru bernama `server.js`.
    *   Isi file tersebut:
        ```javascript
        const { createServer } = require('http')
        const { parse } = require('url')
        const next = require('next')

        const dev = process.env.NODE_ENV !== 'production'
        const hostname = 'localhost'
        const port = process.env.PORT || 3000
        
        // Arahkan ke folder standalone hasil build nanti
        const app = next({ dev, hostname, port })
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

5.  **Install Dependency & Build**:
    *   Masuk ke terminal cPanel (atau via SSH).
    *   Masuk ke virtual environment Node.js (Copy command dari halaman Setup Node.js App, contoh: `source /home/user/nodevenv/erlass-app/20/bin/activate`).
    *   Masuk folder app: `cd erlass-app`.
    *   Install: `npm install`
    *   Build: `npm run build`
    *   *Note: Jika build gagal karena memori hosting limit, build di lokal komputer Anda lalu upload folder `.next` ke server.*

6.  **Konfigurasi Environment Variable**:
    *   Di halaman Node.js App, tambah Environment Variables:
        *   `DATABASE_URL`: Connection string database (PostgreSQL/MySQL).
        *   `NEXTAUTH_SECRET`: String acak.
        *   `NEXTAUTH_URL`: URL website Anda (https://kursus.sekolah.sch.id).

7.  **Restart**:
    *   Klik tombol **Restart** di halaman Node.js App.

---

## Metode 2: Static Export (Hanya HTML/CSS/JS)

Gunakan ini jika hosting **TIDAK** mendukung Node.js.
⚠️ **Kekurangan Fatal**: Fitur Login, Database, API, Payment Gateway **TIDAK AKAN BERJALAN**. Aplikasi hanya akan jadi website profil statis.

1.  Ubah `next.config.ts`:
    ```javascript
    const nextConfig = {
      output: "export",
      images: { unoptimized: true } // Image optimization butuh server
    };
    ```
2.  Jalankan `npm run build`.
3.  Upload isi folder `out` ke `public_html` di cPanel.

---

## Masalah Umum (Troubleshooting)

1.  **Error 500 / Internal Server Error**:
    *   Cek logs di folder aplikasi (`stderr.log`).
    *   Biasanya karena versi Node.js tidak cocok atau `node_modules` korup.

2.  **Database Error**:
    *   Jika pakai PostgreSQL luar (Supabase/Neon), pastikan hosting mengizinkan koneksi keluar (Outgoing Firewall).
    *   Jika pakai MySQL hosting, ubah `provider = "postgresql"` jadi `mysql` di `schema.prisma` dan update kode yang pakai fitur spesifik PG.

3.  **Gambar Tidak Muncul**:
    *   Next.js Image Optimization butuh library `sharp`. Pastikan terinstall: `npm install sharp`.
    *   Atau gunakan `unoptimized: true` di config.

4.  **Build Gagal (Killed)**:
    *   Shared hosting punya limit RAM kecil.
    *   Solusi: Build di komputer lokal (`npm run build`), lalu upload folder `.next`, `public`, `package.json`, dan `server.js` ke hosting. Lalu di hosting tinggal `npm install --production`.
