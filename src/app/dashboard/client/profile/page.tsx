import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ClientProfileForm from '@/components/clients/ClientProfileForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Edit Profile - DogBooking',
  description: 'Edit your profile information',
}

export default async function ClientProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  })

  if (!user) {
    redirect('/auth/signin')
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Edit Profile
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Update your personal information
          </p>
        </div>
      </div>

      <div className="mt-8">
        <ClientProfileForm user={user} />
      </div>
    </div>
  )
} 