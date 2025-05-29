import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import SitterProfile from '@/components/sitters/SitterProfile'
import type { Metadata } from 'next'

interface Props {
  params: {
    id: string
  }
}

interface BookingWithUser {
  id: string
  client: {
    name: string
    image: string | null
  }
  review: {
    id: string
    rating: number
    comment: string
  } | null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const sitter = await prisma.Sitter.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!sitter) {
    return {
      title: 'Sitter Not Found - DogBooking',
    }
  }

  return {
    title: `${sitter.user.name} - Pet Sitter Profile - DogBooking`,
    description: `View ${sitter.user.name}'s profile and book pet sitting services`,
  }
}

export default async function SitterPage({ params }: Props) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const sitter = await prisma.Sitter.findUnique({
    where: {
      id: params.id,
    },
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
      bookings: {
        where: {
          status: 'COMPLETED',
        },
        take: 5,
        orderBy: {
          endDate: 'desc',
        },
        include: {
          client: {
            select: {
              name: true,
              image: true,
            },
          },
          review: true,
        },
      },
    },
  })

  if (!sitter) {
    notFound()
  }

  // Get the client's dogs for the booking form
  const dogs = await prisma.Dog.findMany({
    where: {
      ownerId: session.user.id,
    },
    select: {
      id: true,
      name: true,
    },
  })

  // Transform the data to match the expected interface
  const sitterWithClientInfo = {
    ...sitter,
    bookings: sitter.bookings.map((booking: BookingWithUser) => ({
      ...booking,
      client: {
        name: booking.client.name,
        image: booking.client.image,
      }
    }))
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {sitter.user.name}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Pet Sitter Profile
          </p>
        </div>
      </div>

      <div className="mt-8">
        <SitterProfile sitter={sitterWithClientInfo} clientDogs={dogs} />
      </div>
    </div>
  )
} 