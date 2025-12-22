# Erlass Code Adventure - Game Engine Documentation

Dokumen ini menjelaskan arsitektur teknis dan panduan pengembangan untuk fitur game coding interaktif di Erlass Platform.

## 1. Arsitektur Teknis

Game ini berjalan sepenuhnya di **Client Side** (Frontend) menggunakan React State untuk manajemen logika dan rendering. Tidak ada engine game berat (seperti Unity/Phaser), hanya manipulasi DOM dan State cerdas.

### Alur Eksekusi Kode:
1.  **Input:** User mengetik kode di `textarea` (Editor).
2.  **Parsing:** String kode dipecah per baris (`split('\n')`).
3.  **Validasi:** Setiap baris dicek apakah merupakan command valid.
4.  **Eksekusi (Interpreter Loop):**
    *   Looping perintah satu per satu.
    *   `await new Promise` (Delay) untuk menciptakan animasi langkah.
    *   Update State `playerPos` (X, Y) dan `playerDir` (Rotation).
    *   Cek Tabrakan (Collision) atau Kemenangan (Win) setiap langkah.

File Utama: `src/components/game/CodeGame.tsx`

---

## 2. Command API (Perintah Robot)

Saat ini interpreter mendukung perintah dasar berikut:

| Perintah | Deskripsi | Logika Internal |
| :--- | :--- | :--- |
| `move()` | Maju 1 kotak ke arah hadap robot. | Cek arah (0/90/180/270), update X/Y. |
| `turnRight()` | Putar robot 90 derajat searah jarum jam. | `dir = (dir + 90) % 360` |
| `turnLeft()` | Putar robot 90 derajat berlawanan jarum jam. | `dir = (dir - 90 + 360) % 360` |

### Potensi Eksploitasi/Pengembangan API:
Developer masa depan bisa menambahkan command baru dengan mudah di dalam loop interpreter:

```typescript
// Contoh implementasi di CodeGame.tsx
} else if (cmd.startsWith('jump(')) {
    // Logika lompat (melewati 1 kotak)
    // ...
}
```

---

## 3. Struktur Level (Level Configuration)

Level disimpan sebagai objek JSON konstan. Anda bisa memindahkannya ke Database (`Challenge` model) agar dinamis.

**Tipe Data:**
```typescript
type LevelConfig = {
  gridSize: number          // Ukuran Peta (misal 5x5)
  start: { x: number, y: number } // Posisi Awal (0,0 = Kiri Atas)
  finish: { x: number, y: number } // Target (Bendera)
  obstacles: { x: number, y: number }[] // Array Koordinat Tembok
  maxCommands?: number      // (Opsional) Batas jumlah baris kode
}
```

**Cara Menambah Level Baru:**
1.  Buat config JSON baru.
2.  Tambahkan state `currentLevel` di komponen.
3.  Buat UI selector level.

---

## 4. Roadmap Pengembangan (Ide Fitur)

Berikut adalah fitur-fitur yang bisa "dieksploitasi" developer untuk membuat game lebih canggih:

### A. Loop & Conditional (Logika Pemrograman)
Saat ini game hanya menerima urutan perintah linear.
*   **Loop:** `repeat(3) { move() }` -> Parser harus mengenali blok kurung kurawal.
*   **If/Else:** `if (isPathClear()) { move() }` -> Butuh fungsi sensor `isPathClear`.

### B. Collectibles & Skor
*   Tambahkan item "Baterai" 🔋 atau "Bintang" ⭐ di grid.
*   Robot harus mengambil item (`collect()`) sebelum ke finish.
*   Skor berdasarkan efisiensi kode (makin sedikit baris, makin bagus).

### C. Custom Skin
*   Biarkan user mengganti sprite robot dengan Avatar mereka (dari XP Shop).

### D. Level Editor (User Generated Content)
*   Buat UI Drag-and-Drop agar siswa bisa membuat level tantangan mereka sendiri dan menantang teman.

### E. Integrasi Backend
*   Simpan skor dan status penyelesaian level ke database `ChallengeSubmission`.
*   Berikan XP saat level selesai (`claimQuest`).

---

## 5. Troubleshooting Umum

*   **Robot Tembus Tembok?**
    *   Cek logika `collision check` di dalam `move()`. Pastikan koordinat `nextX` dan `nextY` divalidasi SEBELUM update state.
*   **Animasi Patah-patah?**
    *   Atur durasi `setTimeout` dan CSS `transition-duration`. Idealnya transisi CSS sedikit lebih cepat dari delay JS.
*   **Infinite Loop?**
    *   Jika menerapkan fitur `while` atau `for`, pastikan ada "Safety Breaker" (misal max 1000 langkah) agar browser tidak hang.

---

## 6. External Editors Integration (New v2.1)

Selain engine internal (Robot Maze), Erlass Platform kini mendukung editor eksternal via Iframe untuk kategori khusus.

### A. Scratch Integration
*   **URL:** `https://machinelearningforkids.co.uk/scratch/`
*   **Trigger:** Kategori tantangan mengandung `scratch` atau `block`.
*   **Validation:** Client-side simulation (Timer 1 detik).

### B. Micro:bit Integration
*   **URL:** `https://makecode.microbit.org/#editor`
*   **Trigger:** Kategori tantangan mengandung `microbit` atau `robotics`.
*   **Validation:** Client-side simulation (Timer 1 detik).

### C. Internal Robot Maze
*   **Trigger:** Kategori mengandung `gamebased` ATAU (Tipe `GAME` DAN BUKAN Scratch/Microbit).
*   **Logic:** Menggunakan `src/components/game/CodeGame.tsx`.

---

*Happy Coding & Gaming!* 🎮
