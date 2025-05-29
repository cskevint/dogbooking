import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CalendarDaysIcon } from '@heroicons/react/24/outline'
import type { Metadata } from 'next'
import type { Booking, Dog, BookingStatus } from '@/types'
import BookingActions from '@/components/bookings/BookingActions'

export const metadata: Metadata = {
  title: 'Manage Bookings - DogBooking',
  description: 'View and manage your pet sitting bookings',
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
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

export default async function SitterBookingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Get the sitter profile
  const sitter = await prisma.Sitter.findUnique({
    where: {
      userId: session.user.id,
    },
  })

  if (!sitter) {
    // Redirect to sitter onboarding if they haven't set up their profile
    redirect('/dashboard/sitter/onboarding')
  }

  const bookings = await prisma.Booking.findMany({
    where: {
      sitterId: sitter.id,
    },
    include: {
      client: {
        select: {
          name: true,
          image: true,
        },
      },
      dogs: true,
      review: true,
    },
    orderBy: [
      {
        status: 'asc',
      },
      {
        startDate: 'desc',
      },
    ],
  })

  // Group bookings by status
  const groupedBookings = bookings.reduce((acc: Record<BookingStatus, Booking[]>, booking: Booking) => {
    const status = booking.status
    if (!acc[status]) {
      acc[status] = []
    }
    acc[status].push(booking)
    return acc
  }, {} as Record<BookingStatus, Booking[]>)

  const statusOrder: BookingStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Manage Bookings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your pet sitting requests
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {statusOrder.map((status) => (
          groupedBookings[status]?.length > 0 && (
            <div key={status} className="space-y-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {status.charAt(0) + status.slice(1).toLowerCase()} Bookings
              </h3>
              <div className="-mx-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:mx-0 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Client
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Dogs
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Dates
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Price
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {groupedBookings[status]?.map((booking: Booking) => (
                      <tr key={booking.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {booking.client.image ? (
                                <Image
                                  className="h-10 w-10 rounded-full"
                                  src={booking.client.image}
                                  alt=""
                                  width={40}
                                  height={40}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                  <span className="text-indigo-800 font-medium text-sm">
                                    {booking.client.name?.[0]?.toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">{booking.client.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {booking.dogs.map((dog: Dog) => dog.name).join(', ')}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <CalendarDaysIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                            <div>
                              <div>{new Date(booking.startDate).toLocaleDateString()}</div>
                              <div>{new Date(booking.endDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          ${booking.totalPrice.toFixed(2)}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <BookingActions booking={booking} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ))}

        {Object.keys(groupedBookings).length === 0 && (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No bookings yet</h3>
            <p className="mt-1 text-sm text-gray-500">You haven't received any booking requests yet.</p>
          </div>
        )}
      </div>
    </div>
  )
} 