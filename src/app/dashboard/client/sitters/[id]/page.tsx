import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import SitterProfile from '@/components/sitters/SitterProfile'
import type { Metadata } from 'next'

type tParams = Promise<{ id: string }>

interface Props {
  params: tParams
}

interface Review {
  id: string
  rating: number
  comment: string
}

interface Booking {
  id: string
  client: {
    name: string
    image: string | null
  }
  review: Review | null
}

interface Sitter {
  id: string
  bio: string
  rate: number
  city: string
  state: string
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
  _count: {
    bookings: number
  }
  bookings: Booking[]
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { id } = await params

  const sitter = await prisma.sitter.findUnique({
    where: { id },
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
    title: `${sitter.user.name || 'Unknown'} - Pet Sitter Profile - DogBooking`,
    description: `View ${sitter.user.name || 'Unknown'}'s profile and book pet sitting services`,
  }
}

export default async function SitterPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const sitter = await prisma.sitter.findUnique({
    where: {
      id,
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
          review: {
            select: {
              id: true,
              rating: true,
              comment: true,
            },
          },
        },
      },
    },
  })

  if (!sitter) {
    notFound()
  }

  // Get the client's dogs for the booking form
  const dogs = await prisma.dog.findMany({
    where: {
      ownerId: session.user.id,
    },
    select: {
      id: true,
      name: true,
    },
  })

  // Transform the data to match the expected interface
  const sitterWithClientInfo: Sitter = {
    id: sitter.id,
    bio: sitter.bio || '',
    rate: sitter.rate,
    city: sitter.city || '',
    state: sitter.state || '',
    user: {
      id: sitter.user.id,
      name: sitter.user.name || '',
      email: sitter.user.email || '',
      image: sitter.user.image,
    },
    _count: {
      bookings: sitter._count.bookings,
    },
    bookings: sitter.bookings.map((booking) => ({
      id: booking.id,
      client: {
        name: booking.client.name || '',
        image: booking.client.image,
      },
      review: booking.review ? {
        id: booking.review.id,
        rating: booking.review.rating,
        comment: booking.review.comment,
      } : null,
    })),
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {sitter.user.name || 'Unknown'}
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