import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import { CalendarDaysIcon, MapPinIcon } from '@heroicons/react/24/outline'
import type { Metadata } from 'next'
import ReviewForm from '@/components/bookings/ReviewForm'
import CancelBookingButton from '@/components/bookings/CancelBookingButton'
import type { Booking, Dog, BookingStatus } from '@/types'

interface Props {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const booking = await prisma.Booking.findUnique({
    where: { id: params.id },
    include: {
      sitter: {
        include: {
          user: true,
        },
      },
    },
  })

  if (!booking) {
    return {
      title: 'Booking Not Found - DogBooking',
    }
  }

  return {
    title: `Booking with ${booking.sitter.user.name} - DogBooking`,
    description: `View your booking details with ${booking.sitter.user.name}`,
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800'
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-800'
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default async function BookingPage({ params }: Props) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const booking = await prisma.Booking.findUnique({
    where: {
      id: params.id,
    },
    include: {
      dogs: true,
      sitter: {
        include: {
          user: true,
        },
      },
      review: true,
    },
  })

  if (!booking || booking.clientId !== session.user.id) {
    notFound()
  }

  const canReview = booking.status === 'COMPLETED' && !booking.review
  const canCancel = ['PENDING', 'CONFIRMED'].includes(booking.status as BookingStatus)

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Booking Details
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View your booking information and manage your booking
          </p>
        </div>
        {canCancel && (
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <CancelBookingButton bookingId={booking.id} />
          </div>
        )}
      </div>

      <div className="mt-8 overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="h-16 w-16 flex-shrink-0">
              <Image
                className="h-16 w-16 rounded-full"
                src={booking.sitter.user.image || '/default-avatar.svg'}
                alt={booking.sitter.user.name || ''}
                width={64}
                height={64}
              />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {booking.sitter.user.name}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Pet Sitter
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200">
            <dl className="divide-y divide-gray-200">
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Dogs</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                  {booking.dogs.map((dog: Dog) => dog.name).join(', ')}
                </dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Dates</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                  <div className="flex items-center">
                    <CalendarDaysIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                    <div>
                      <div>From: {new Date(booking.startDate).toLocaleDateString()}</div>
                      <div>To: {new Date(booking.endDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                </dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Total Price</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                  ${booking.totalPrice.toFixed(2)}
                </dd>
              </div>
              {booking.review && (
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Your Review</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                    <div className="flex items-center">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-5 w-5 ${
                              i < booking.review.rating
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 15.585l-6.327 3.89 1.42-7.897L.222 6.974l8.019-1.194L10 0l1.759 5.78 8.019 1.194-4.871 4.604 1.42 7.897z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2">{booking.review.rating}/5</span>
                    </div>
                    <p className="mt-2">{booking.review.comment}</p>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {canReview && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Leave a Review
              </h3>
              <div className="mt-6">
                <ReviewForm bookingId={booking.id} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 