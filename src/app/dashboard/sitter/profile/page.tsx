import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import SitterProfileForm from '@/components/sitters/SitterProfileForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Edit Profile - DogBooking',
  description: 'Update your pet sitter profile',
}

export default async function SitterProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const sitter = await prisma.sitter.findUnique({
    where: {
      userId: session.user.id,
    },
  })

  if (!sitter) {
    redirect('/dashboard/sitter/onboarding')
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Edit Profile
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Update your profile information to attract more pet owners
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8">
              <div className="col-span-full">
                <div className="flex items-center gap-x-8">
                  <Image
                    src={session.user.image || '/default-avatar.svg'}
                    alt={session.user.name || ''}
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-full"
                  />
                  <div>
                    <h3 className="text-base font-semibold leading-7 text-gray-900">
                      {session.user.name}
                    </h3>
                    <p className="text-sm leading-6 text-gray-600">{session.user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Profile Information</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              This information will be displayed publicly to pet owners looking for sitters.
            </p>

            <div className="mt-10">
              <SitterProfileForm sitter={sitter} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 