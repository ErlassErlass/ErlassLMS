import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getQuestionBanks } from "@/lib/question-service";
import { Button } from "@/components/ui/button";
import { QuestionBankRowActions } from "@/components/admin/question-bank-row-actions";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Filter, 
} from "lucide-react";

export default async function QuestionBanksPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user.role !== 'SUPERADMIN') {
    redirect('/dashboard');
  }

  // Get question banks from the service
  const questionBanks = await getQuestionBanks();

  const [searchTerm, setSelectedCategory] = ["", "all"]; // Using default values since we can't use useState in server component

  // For now, we'll just use the questionBanks as is without client-side filtering
  // In a real implementation, you'd want to pass search params to the service
  
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bank Soal</h1>
            <p className="text-gray-600 mt-2">
              Kelola kumpulan soal untuk kuis dan assessment
            </p>
          </div>
          <Link href="/dashboard/admin/question-banks/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Bank Soal
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters - using server actions for filtering */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Cari bank soal..."
                // In a real implementation, you would handle search via server action
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="sm:w-64">
            <select
              // In a real implementation, you would handle category selection via server action
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Kategori</option>
              <option value="scratch">Scratch</option>
              <option value="pictoblox">Pictoblox</option>
              <option value="microbit">Microbit</option>
              <option value="python">Python</option>
            </select>
          </div>
          
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Question Banks Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bank Soal
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kategori
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tingkat Kesulitan
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jumlah Soal
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dibuat
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {questionBanks.map((bank: any) => (
              <tr key={bank.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{bank.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {bank.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    bank.difficulty === 'easy' 
                      ? 'bg-green-100 text-green-800'
                      : bank.difficulty === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  } capitalize`}>
                    {bank.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {bank.questions ? bank.questions.length : 0} soal
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    bank.isActive 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {bank.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {bank.createdAt?.toString().split('T')[0]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <QuestionBankRowActions id={bank.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {questionBanks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada bank soal ditemukan</h3>
            <p className="text-gray-500 mb-4">
              Mulai dengan membuat bank soal pertama Anda
            </p>
            <Link href="/dashboard/admin/question-banks/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Bank Soal
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}