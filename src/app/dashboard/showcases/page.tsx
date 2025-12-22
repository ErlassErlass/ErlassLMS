import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Trophy, 
  User, 
  Star,
  Code,
  Play,
  Heart
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

async function getShowcases() {
  // Get all submissions marked as showcase
  const submissions = await prisma.challengeSubmission.findMany({
    where: {
      isShowcase: true,
      passed: true,
    },
    include: {
      user: {
        select: {
          name: true,
          avatar: true,
          xp: true,
          level: true
        }
      },
      challenge: {
        select: {
          title: true,
          description: true,
          category: true,
          difficulty: true,
          points: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 20 // Limit to 20 most recent showcases
  });

  return submissions.map(submission => ({
    id: submission.id,
    code: submission.code,
    createdAt: submission.createdAt,
    user: submission.user,
    challenge: submission.challenge,
    passed: submission.passed
  }));
}

export default async function ShowcasesPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const showcases = await getShowcases();

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
      <div className="mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-3xl border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-xl">
            <Trophy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-3xl font-black text-gray-800 dark:text-white">
            Student Showcases 🌟
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Lihat karya luar biasa dari siswa-siswi berbakat. Terinspirasi? Buat karyamu sendiri dan mungkin akan tampil di sini!
        </p>
      </div>

      {showcases.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Belum ada showcase</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Selesaikan tantangan dan buat karyamu menjadi showcase pertama!
          </p>
          <Link href="/dashboard/challenges">
            <Button className="bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl px-6 shadow-lg">
              <Play className="mr-2 h-4 w-4" />
              Cari Tantangan
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {showcases.map((submission) => (
            <div key={submission.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white line-clamp-1">
                    {submission.challenge.title}
                  </h3>
                  <Badge variant="secondary" className="font-bold bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 mt-2">
                    {submission.challenge.category}
                  </Badge>
                </div>
                <Badge className="font-bold bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                  {submission.challenge.points} XP
                </Badge>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {submission.challenge.description}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 overflow-hidden">
                    {submission.user.avatar ? (
                      <img src={submission.user.avatar} alt={submission.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-500">{submission.user.name?.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800 dark:text-white">{submission.user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Level {submission.user.level}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">{submission.user.xp} XP</span>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-xl p-3 font-mono text-xs text-green-400 overflow-x-auto">
                <div className="truncate">{submission.code.substring(0, 100)}{submission.code.length > 100 ? '...' : ''}</div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Code className="h-3 w-3" />
                  <span>{new Date(submission.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
                
                <Button variant="outline" size="sm" className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800 font-bold text-xs">
                  <Heart className="mr-1 h-3 w-3" />
                  Favorit
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}