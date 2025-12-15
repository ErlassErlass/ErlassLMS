'use client'

import { useEffect, useState } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export function OnboardingTour() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Cek apakah user sudah pernah tour
    const hasToured = localStorage.getItem('erlass_onboarded_v1')
    if (hasToured) return

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: false,
      doneBtnText: "Siap Belajar! 🚀",
      nextBtnText: "Lanjut →",
      prevBtnText: "← Kembali",
      steps: [
        { 
          element: '#dashboard-welcome', 
          popover: { 
            title: 'Selamat Datang di Erlass! 👋', 
            description: 'Platform belajar coding paling seru. Yuk, kenalan dengan fitur-fiturnya!', 
            side: "bottom", 
            align: 'start' 
          } 
        },
        { 
          element: '#streak-indicator', 
          popover: { 
            title: 'Jaga Api Semangatmu! 🔥', 
            description: 'Login setiap hari untuk menaikkan Streak. Jangan sampai apinya padam ya!', 
            side: "bottom", 
            align: 'center' 
          } 
        },
        { 
          element: '#daily-quests', 
          popover: { 
            title: 'Misi Harian 📅', 
            description: 'Selesaikan 3 misi ini setiap hari untuk mendapatkan bonus XP besar! Reset setiap jam 12 malam.', 
            side: "bottom", 
            align: 'start' 
          } 
        },
        { 
          element: '#recent-challenges-panel', 
          popover: { 
            title: 'Tantangan Coding ⚔️', 
            description: 'Asah skill codingmu dengan menyelesaikan tantangan nyata di sini. Dapatkan XP dan Badge!', 
            side: "left", 
            align: 'start' 
          } 
        },
        { 
          element: '#xp-shop-card', 
          popover: { 
            title: 'Pencapaian & Koleksi 🏆', 
            description: 'Lihat Badge, Sertifikat, dan beli Item keren pakai XP kamu di sini.', 
            side: "left", 
            align: 'start' 
          } 
        },
        { 
          element: '#active-course-card', 
          popover: { 
            title: 'Mulai Belajar 📚', 
            description: 'Klik tombol "Lanjut" untuk masuk ke materi pelajaranmu. Selamat belajar!', 
            side: "top", 
            align: 'start' 
          } 
        }
      ],
      onDestroyed: () => {
        // Tandai sudah tour agar tidak muncul lagi
        localStorage.setItem('erlass_onboarded_v1', 'true')
        
        // Efek Confetti (Opsional, tapi seru)
        import('canvas-confetti').then((confetti) => {
            confetti.default({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            })
        })
      }
    })

    // Beri sedikit delay agar UI render sempurna
    setTimeout(() => {
        driverObj.drive()
    }, 1500)

  }, [mounted])

  return null // Headless component
}
