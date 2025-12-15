import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Trophy, Rocket, Code, Play, LayoutDashboard } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-background overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl shadow-lg flex items-center justify-center text-secondary font-bold text-xl transform rotate-3 hover:rotate-0 transition-all duration-300">
              E
            </div>
            <span className="text-2xl font-black tracking-tight text-secondary">Erlass</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex space-x-3">
              {session ? (
                <Link href="/dashboard">
                  <Button className="bg-primary hover:bg-primary/90 text-secondary font-bold px-6 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Ke Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button variant="ghost" className="font-bold text-secondary hover:bg-gray-100">Sign In</Button>
                  </Link>
                  <Link href="/auth/signin">
                    <Button className="bg-primary hover:bg-primary/90 text-secondary font-bold px-6 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                      Mulai Gratis 🚀
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-10 w-24 h-24 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-accent/20 rounded-full blur-3xl delay-700 animate-pulse"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-secondary/10 rounded-full blur-3xl delay-1000"></div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tertiary/10 border border-tertiary/20 text-secondary font-bold text-sm mb-8 animate-bounce shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-tertiary"></span>
            Platform Coding #1 untuk Anak Indonesia
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-secondary mb-8 leading-tight tracking-tight">
            Coding itu <span className="text-tertiary">Seru & Ajaib!</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Yuk, belajar membuat game, animasi, dan robot sendiri. 
            Kembangkan kreativitasmu bersama mentor-mentor keren di Erlass.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
            {session ? (
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-14 text-lg bg-secondary text-white hover:bg-secondary/90 font-bold rounded-2xl px-10 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                  Lanjut Belajar <Rocket className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signin" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-14 text-lg bg-secondary text-white hover:bg-secondary/90 font-bold rounded-2xl px-10 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                  Coba Gratis Sekarang
                </Button>
              </Link>
            )}
            
            <Link href="/courses" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 text-lg border-2 border-gray-200 bg-white text-secondary font-bold rounded-2xl px-10 hover:bg-gray-50 transition-all">
                <Play className="mr-2 h-5 w-5 fill-current" />
                Lihat Video Intro
              </Button>
            </Link>
          </div>
          
          {/* Floating Elements */}
          <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 left-10 animate-[bounce_3s_infinite]">
             <div className="bg-white p-4 rounded-2xl shadow-2xl border-2 border-primary/20 transform -rotate-6">
                <Code className="h-10 w-10 text-primary" />
             </div>
          </div>
          <div className="hidden lg:block absolute top-1/3 right-10 animate-[bounce_4s_infinite]">
             <div className="bg-white p-4 rounded-2xl shadow-2xl border-2 border-accent/20 transform rotate-12">
                <Rocket className="h-10 w-10 text-accent" />
             </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-secondary mb-4">Kenapa Belajar di Erlass?</h2>
            <p className="text-xl text-gray-500">Metode belajar yang disesuaikan khusus untuk anak-anak</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="group bg-gray-50 rounded-3xl p-8 border-2 border-transparent hover:border-primary transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-2">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-4xl">🎮</span>
              </div>
              <h3 className="text-2xl font-black text-secondary mb-3">Belajar Rasa Main</h3>
              <p className="text-gray-600 leading-relaxed font-medium">
                Materi disampaikan lewat game seru seperti Scratch dan Minecraft. Belajar coding jadi gak berasa belajar!
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="group bg-gray-50 rounded-3xl p-8 border-2 border-transparent hover:border-accent transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-2">
              <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-4xl">🏆</span>
              </div>
              <h3 className="text-2xl font-black text-secondary mb-3">Misi & Hadiah</h3>
              <p className="text-gray-600 leading-relaxed font-medium">
                Selesaikan tantangan mingguan, kumpulkan XP, naik level, dan dapatkan badge serta sertifikat keren.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="group bg-gray-50 rounded-3xl p-8 border-2 border-transparent hover:border-secondary transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-2">
              <div className="w-20 h-20 bg-secondary/10 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-4xl">👨‍🏫</span>
              </div>
              <h3 className="text-2xl font-black text-secondary mb-3">Mentor Jagoan</h3>
              <p className="text-gray-600 leading-relaxed font-medium">
                Dibimbing langsung oleh kakak-kakak mentor yang asik, sabar, dan jago banget ngoding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="bg-primary rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-[100px] opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent rounded-full blur-[100px] opacity-20"></div>
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black text-secondary mb-6">
                Siap Jadi Programmer Cilik?
              </h2>
              <p className="text-xl text-secondary/90 mb-10">
                Gabung dengan ribuan teman lainnya yang sudah mulai bikin game mereka sendiri. Gratis untuk mulai!
              </p>
              <Link href="/auth/signin">
                <Button size="lg" className="h-16 text-xl bg-white hover:bg-gray-50 text-secondary font-bold rounded-full px-12 shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                  Mulai Petualanganmu 🚀
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-primary rounded-lg"></div>
            <span className="text-xl font-bold text-secondary">Erlass Platform</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2025 Erlass Platform. Dibuat dengan ❤️ untuk Anak Indonesia.
          </p>
        </div>
      </footer>
    </div>
  )
}
