# Panduan Pengembang: Menambahkan Tantangan Game Baru

Fitur **Erlass Code Adventure** memungkinkan pembuatan tantangan berbasis logika visual. Pengembang dapat membuat level baru dengan mendefinisikan layout JSON dan memasukkannya ke database.

## 1. Persiapan Database

Pastikan tantangan yang Anda buat memiliki `type` = `'GAME'` dan mengisi kolom `gameConfig` dengan JSON yang valid.

## 2. Struktur JSON Level (`gameConfig`)

Berikut adalah template JSON untuk membuat level baru.

```json
{
  "gridSize": 7,
  "start": { "x": 0, "y": 0 },
  "finish": { "x": 6, "y": 6 },
  "obstacles": [
    { "x": 1, "y": 0 },
    { "x": 1, "y": 1 },
    { "x": 1, "y": 2 },
    { "x": 3, "y": 3 },
    { "x": 3, "y": 4 },
    { "x": 5, "y": 5 }
  ],
  "maxCommands": 20
}
```

### Penjelasan Field:
*   `gridSize`: Ukuran peta (N x N). Misal `5` berarti grid 5x5.
*   `start`: Koordinat awal robot `{x, y}`. (0,0 adalah kiri atas).
*   `finish`: Koordinat bendera tujuan.
*   `obstacles`: Array koordinat tembok yang tidak bisa dilewati.
*   `maxCommands`: (Opsional) Batas maksimal baris kode untuk menyelesaikan level.

## 3. Cara Menambahkan Level Baru

### Opsi A: Melalui Script Seeding (Developer)
Buat file script di `scripts/add-game-level.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import { generateId } from '../src/lib/id-generator'

const prisma = new PrismaClient()

async function main() {
  const levelConfig = {
    gridSize: 6,
    start: { x: 0, y: 0 },
    finish: { x: 5, y: 2 },
    obstacles: [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }]
  }

  await prisma.challenge.create({
    data: {
      id: generateId('challenge'),
      title: "Misi Penyelamatan: Level 2",
      description: "Robot terjebak! Gunakan loop untuk menghindari tembok panjang.",
      difficulty: "Intermediate",
      category: "Logic",
      type: "GAME",
      points: 150,
      instructions: "<p>Gunakan perintah <code>move()</code> dan <code>turnRight()</code> untuk mencapai bendera.</p>",
      starterCode: "// Mulai koding di sini\n\nmove()",
      gameConfig: levelConfig,
      published: true
    }
  })
}

main()
```

### Opsi B: Melalui Admin Panel (Admin)
1.  Masuk ke Dashboard Admin -> **Challenges** -> **New**.
2.  Pilih Tipe: **Game / Visual**.
3.  Di form input khusus (yang akan dikembangkan nanti), masukkan JSON config atau gunakan Visual Level Editor (Future Roadmap).

## 4. Cara Mengembangkan Engine

Jika Anda ingin menambahkan perintah baru (misal: `jump()`, `collectItem()`), edit file:
`src/components/game/CodeGame.tsx`

Tambahkan logika baru di dalam fungsi `runCode()`:

```typescript
} else if (cmd === 'jump()') {
    // Logika lompat 2 kotak
    // Update X/Y + 2
}
```

---
*Happy Coding!*
