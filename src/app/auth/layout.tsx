import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { redirect } from 'next/navigation'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (session) {
    if (session.user.role === 'SITTER') {
      redirect('/dashboard/sitter')
    } else {
      redirect('/dashboard/client')
    }
  }

  return <>{children}</>
} 