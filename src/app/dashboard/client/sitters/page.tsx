import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import SitterList from '@/components/sitters/SitterList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find a Sitter - DogBooking',
  description: 'Search for available pet sitters in your area',
}

export default async function SittersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const sitters = await prisma.sitter.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      _count: {
        select: {
          bookings: {
            where: {
              status: 'COMPLETED',
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Select a Sitter
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Choose from our trusted pet sitters below to book your next stay
          </p>
        </div>
      </div>

      <div className="mt-8">
        <SitterList sitters={sitters} />
      </div>
    </div>
  )
} 