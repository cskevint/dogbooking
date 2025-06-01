import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { redirect } from 'next/navigation'
import SitterDashboardNav from '@/components/dashboard/SitterDashboardNav'

export default async function SitterDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'SITTER') {
    redirect('/dashboard/client')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <SitterDashboardNav user={session.user} />
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
} 