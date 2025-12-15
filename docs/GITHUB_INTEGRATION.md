# Panduan Integrasi GitHub ke cPanel (CI/CD)

Dokumen ini menjelaskan cara mengatur agar setiap kali Anda melakukan **Push** ke GitHub, aplikasi di cPanel otomatis terupdate.

## 1. Persiapan di cPanel

1.  Pastikan Anda sudah membuat **Node.js App** di cPanel (sesuai panduan `DEPLOYMENT_CPANEL_MYSQL.md`).
2.  Catat **Folder Root Aplikasi** Anda di File Manager (misal: `/home/username/erlass-app/` atau sekadar `/erlass-app/` jika dilihat dari akses FTP).
3.  Siapkan akun **FTP** (bisa pakai akun login cPanel utama atau buat akun FTP khusus yang mengarah ke folder tersebut).

## 2. Persiapan di GitHub

1.  Buka Repository GitHub Anda.
2.  Masuk ke **Settings** > **Secrets and variables** > **Actions**.
3.  Klik **New repository secret**.
4.  Tambahkan 3 Secret berikut (Wajib):

| Nama Secret | Isi / Value |
| :--- | :--- |
| `FTP_SERVER` | Alamat domain Anda atau IP hosting (contoh: `ftp.erlass.com` atau `103.xxx.xxx.xxx`) |
| `FTP_USERNAME` | Username FTP/cPanel Anda |
| `FTP_PASSWORD` | Password FTP/cPanel Anda |

## 3. Cara Kerja

Setiap kali Anda atau tim melakukan:
```bash
git add .
git commit -m "Update fitur baru"
git push origin master
```

Maka secara otomatis:
1.  GitHub akan mendeteksi perubahan.
2.  GitHub akan menjalankan komputer virtual (Runner).
3.  Aplikasi akan di-build di sana.
4.  Hasil build (folder `.next/standalone` dan aset lainnya) akan dikirim via FTP ke cPanel.
5.  File `tmp/restart.txt` akan dibuat untuk memancing cPanel me-restart aplikasi.

## 4. Catatan Penting

*   **Waktu Deploy**: Proses ini biasanya memakan waktu 3-5 menit tergantung kecepatan internet server GitHub ke Hosting Anda.
*   **File .env**: File `.env` **TIDAK AKAN** ditimpa oleh GitHub (karena `.env` biasanya di-ignore oleh git). Ini bagus untuk keamanan. Jika Anda mengubah konfigurasi env, Anda harus edit manual file `.env` di File Manager cPanel.
*   **Database Migration**: Jika Anda mengubah struktur database (`schema.prisma`), GitHub Actions ini **TIDAK** otomatis menjalankan migrasi db di cPanel (demi keamanan). 
    *   *Solusi*: Setelah deploy selesai, login ke SSH cPanel atau terminal Node.js App, lalu jalankan `npx prisma db push` manual.
