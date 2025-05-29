import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { CalendarDaysIcon, PlusIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import type { Dog, Booking } from '@/types'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  const [dogs, upcomingBookings] = await Promise.all([
    prisma.Dog.findMany({
      where: {
        ownerId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.Booking.findMany({
      where: {
        clientId: session.user.id,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
        startDate: {
          gte: new Date(),
        },
      },
      include: {
        dogs: true,
        sitter: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
      take: 5,
    }),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's an overview of your pets and upcoming bookings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Dogs Overview */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">My Dogs</h2>
              <Link
                href="/dashboard/client/dogs"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all
              </Link>
            </div>
            
            <div className="mt-4 divide-y divide-gray-200">
              {dogs.length === 0 ? (
                <p className="text-sm text-gray-500 py-4">
                  No dogs added yet. Add your first dog to get started!
                </p>
              ) : (
                dogs.slice(0, 3).map((dog: Dog) => (
                  <div key={dog.id} className="py-4">
                    <Link
                      href={`/dashboard/client/dogs/${dog.id}`}
                      className="flex items-center justify-between hover:bg-gray-50 -mx-4 px-4"
                    >
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{dog.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {dog.breed} • {dog.age} years old
                        </p>
                      </div>
                      <span className="ml-3">&rarr;</span>
                    </Link>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6">
              <Link
                href="/dashboard/client/dogs/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Add Dog
              </Link>
            </div>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Upcoming Bookings</h2>
              <Link
                href="/dashboard/client/bookings"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all
              </Link>
            </div>
            
            <div className="mt-4 divide-y divide-gray-200">
              {upcomingBookings.length === 0 ? (
                <p className="text-sm text-gray-500 py-4">
                  No upcoming bookings. Find a sitter to schedule your next booking!
                </p>
              ) : (
                upcomingBookings.map((booking: Booking) => (
                  <div key={booking.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {booking.dogs.map((dog: Dog) => dog.name).join(', ')} with {booking.sitter.user.name}
                        </h3>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <CalendarDaysIcon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <span
                        className={classNames(
                          booking.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800',
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
                        )}
                      >
                        {booking.status === 'CONFIRMED' ? 'Confirmed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow">
            <div>
              <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
                <UserGroupIcon className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-medium">
                <Link href="/dashboard/client/sitters" className="focus:outline-none">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Find a Sitter
                </Link>
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Browse our network of professional pet sitters in your area.
              </p>
            </div>
            <span
              className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
              aria-hidden="true"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
              </svg>
            </span>
          </div>

          <div className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow">
            <div>
              <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
                <CalendarDaysIcon className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-medium">
                <Link href="/dashboard/client/sitters" className="focus:outline-none">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Schedule a Stay
                </Link>
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Book a daycare visit or overnight stay for your dog with your favorite sitter.
              </p>
            </div>
            <span
              className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
              aria-hidden="true"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 