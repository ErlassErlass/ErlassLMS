"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.ok) {
        router.push("/dashboard")
      } else {
        alert("Login gagal - coba lagi")
      }
    } catch (error) {
      console.error("Login error:", error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] dark:bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-tertiary rounded-full blur-[120px] opacity-20"></div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-3xl shadow-2xl max-w-md w-full relative z-10 border border-gray-100 dark:border-gray-800">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 transform rotate-3">
            E
          </div>
          <h1 className="text-3xl font-black text-[#1F2937] dark:text-white mb-2">
            Selamat Datang!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Siap melanjutkan petualangan coding?
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#1F2937] dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 focus:border-tertiary focus:ring focus:ring-tertiary/20 focus:outline-none transition-all dark:text-white"
              placeholder="namamu@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-[#1F2937] dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 focus:border-tertiary focus:ring focus:ring-tertiary/20 focus:outline-none transition-all dark:text-white"
              placeholder="••••••••"
              required
            />
          </div>
          
          <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
            Masuk Sekarang
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Belum punya akun? Cukup masukkan email baru untuk daftar otomatis!
          </p>
        </div>
      </div>
    </div>
  )
}