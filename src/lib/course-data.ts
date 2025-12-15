// lib/course-data.ts - sample data untuk MVP
export const sampleCourses = [
  {
    id: "1",
    title: "Scratch Dasar - Membuat Game Pertamamu",
    description: "Belajar pemrograman visual dengan Scratch melalui pembuatan game sederhana. Cocok untuk pemula usia 8-12 tahun.",
    category: "scratch",
    level: "beginner",
    price: 0,
    isPremium: false,
    freeSections: 5,
    totalSections: 8,
    coverImage: "/images/scratch-basic.jpg",
    sections: [
      {
        id: "1-1",
        title: "Pengenalan Scratch dan Interface",
        description: "Mengenal blok-blok pemrograman dan area kerja Scratch",
        content: "Scratch adalah bahasa pemrograman visual yang dikembangkan oleh MIT...",
        videoUrl: "https://example.com/videos/scratch-intro.mp4",
        orderIndex: 1,
        isFree: true,
        estimatedDuration: 15
      },
      {
        id: "1-2", 
        title: "Gerakan dan Animasi Sederhana",
        description: "Membuat karakter bergerak dan beranimasi",
        content: "Kita akan belajar menggunakan blok motion untuk menggerakkan sprite...",
        videoUrl: "https://example.com/videos/scratch-movement.mp4",
        orderIndex: 2,
        isFree: true,
        estimatedDuration: 20
      },
      // ... more sections
    ]
  },
  {
    id: "2",
    title: "Pictoblox AI - Robotika Virtual",
    description: "Memprogram AI dan robotika dengan Pictoblox. Pelajari machine learning sederhana.",
    category: "pictoblox",
    level: "intermediate", 
    price: 199000,
    isPremium: true,
    freeSections: 3,
    totalSections: 10,
    coverImage: "/images/pictoblox-ai.jpg"
  }
]