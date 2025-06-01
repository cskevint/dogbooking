import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import type { Metadata } from 'next'
import type { Booking, BookingStatus, Dog } from '@/types'

export const metadata: Metadata = {
  title: 'Sitter Dashboard - DogBooking',
  description: 'Manage your pet sitting business',
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

function getStatusColor(status: BookingStatus) {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800'
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-800'
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-800'
  }
}

export default async function SitterDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Get the sitter profile
  const sitter = await prisma.sitter.findUnique({
    where: {
      userId: session.user.id,
    },
  })

  if (!sitter) {
    // Redirect to sitter onboarding if they haven't set up their profile
    redirect('/dashboard/sitter/onboarding')
  }

  // Set up date ranges
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Get today's bookings
  const todayBookings = await prisma.booking.findMany({
    where: {
      sitterId: sitter.id,
      startDate: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      client: {
        select: {
          name: true,
          image: true,
        },
      },
      dogs: true,
      sitter: {
        include: {
          user: true,
        },
      },
      review: true,
    },
  })

  // Get pending bookings
  const pendingBookings = await prisma.booking.findMany({
    where: {
      sitterId: sitter.id,
      status: 'PENDING',
    },
    include: {
      client: {
        select: {
          name: true,
          image: true,
        },
      },
      dogs: true,
      sitter: {
        include: {
          user: true,
        },
      },
      review: true,
    },
  })

  // Get upcoming confirmed bookings
  const upcomingBookings = await prisma.booking.findMany({
    where: {
      sitterId: sitter.id,
      status: 'CONFIRMED',
      startDate: {
        gt: today,
      },
    },
    include: {
      client: {
        select: {
          name: true,
          image: true,
        },
      },
      dogs: true,
      sitter: {
        include: {
          user: true,
        },
      },
      review: true,
    },
    take: 5,
  })

  // Calculate stats
  const stats = await prisma.booking.groupBy({
    by: ['status'],
    where: {
      sitterId: sitter.id,
    },
    _count: true,
  })

  const totalEarnings = await prisma.booking.aggregate({
    where: {
      sitterId: sitter.id,
      status: 'COMPLETED',
    },
    _sum: {
      totalPrice: true,
    },
  })

  const bookingCounts = stats.reduce((acc: Record<BookingStatus, number>, stat: { status: string; _count: number }) => {
    acc[stat.status as BookingStatus] = stat._count
    return acc
  }, {} as Record<BookingStatus, number>)

  const statusOrder: BookingStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Welcome back, {session.user.name}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Here's an overview of your pet sitting business
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            href="/dashboard/sitter/bookings"
            className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            View All Bookings
          </Link>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
          <dt>
            <div className="absolute rounded-md bg-yellow-500 p-3">
              <ClockIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">Pending Bookings</p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
            <p className="text-2xl font-semibold text-gray-900">{bookingCounts.PENDING || 0}</p>
          </dd>
          <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link href="/dashboard/sitter/bookings" className="font-medium text-indigo-600 hover:text-indigo-500">
                View all<span className="sr-only"> pending bookings</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
          <dt>
            <div className="absolute rounded-md bg-green-500 p-3">
              <CalendarDaysIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">Confirmed Bookings</p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
            <p className="text-2xl font-semibold text-gray-900">{bookingCounts.CONFIRMED || 0}</p>
          </dd>
          <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link href="/dashboard/sitter/bookings" className="font-medium text-indigo-600 hover:text-indigo-500">
                View all<span className="sr-only"> confirmed bookings</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
          <dt>
            <div className="absolute rounded-md bg-blue-500 p-3">
              <UserGroupIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">Completed Bookings</p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
            <p className="text-2xl font-semibold text-gray-900">{bookingCounts.COMPLETED || 0}</p>
          </dd>
          <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link href="/dashboard/sitter/bookings" className="font-medium text-indigo-600 hover:text-indigo-500">
                View all<span className="sr-only"> completed bookings</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
          <dt>
            <div className="absolute rounded-md bg-indigo-500 p-3">
              <CurrencyDollarIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">Total Earnings</p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
            <p className="text-2xl font-semibold text-gray-900">
              ${totalEarnings._sum.totalPrice?.toFixed(2) || '0.00'}
            </p>
          </dd>
          <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <span className="text-gray-500">From completed bookings</span>
            </div>
          </div>
        </div>
      </dl>

      <div className="mt-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Today's Bookings</h3>
            <p className="mt-2 text-sm text-gray-700">
              A list of your bookings for today.
            </p>
          </div>
        </div>

        <div className="mt-4 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
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
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {todayBookings.map((booking: Booking) => (
                      <tr key={booking.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="font-medium text-gray-900">{booking.client.name}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {booking.dogs.map((dog: Dog) => dog.name).join(', ')}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div>
                            <div>{new Date(booking.startDate).toLocaleDateString()}</div>
                            <div>{new Date(booking.endDate).toLocaleDateString()}</div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span
                            className={classNames(
                              getStatusColor(booking.status),
                              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
                            )}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          ${(booking.totalPrice || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {todayBookings.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                          No bookings today
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Pending Bookings</h3>
            <p className="mt-2 text-sm text-gray-700">
              A list of your pending bookings.
            </p>
          </div>
        </div>

        <div className="mt-4 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
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
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {pendingBookings.map((booking: Booking) => (
                      <tr key={booking.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="font-medium text-gray-900">{booking.client.name}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {booking.dogs.map((dog: Dog) => dog.name).join(', ')}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div>
                            <div>{new Date(booking.startDate).toLocaleDateString()}</div>
                            <div>{new Date(booking.endDate).toLocaleDateString()}</div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span
                            className={classNames(
                              getStatusColor(booking.status),
                              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
                            )}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          ${(booking.totalPrice || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {pendingBookings.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                          No pending bookings
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Upcoming Bookings</h3>
            <p className="mt-2 text-sm text-gray-700">
              A list of your upcoming confirmed bookings.
            </p>
          </div>
        </div>

        <div className="mt-4 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
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
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {upcomingBookings.map((booking: Booking) => (
                      <tr key={booking.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="font-medium text-gray-900">{booking.client.name}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {booking.dogs.map((dog: Dog) => dog.name).join(', ')}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div>
                            <div>{new Date(booking.startDate).toLocaleDateString()}</div>
                            <div>{new Date(booking.endDate).toLocaleDateString()}</div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span
                            className={classNames(
                              getStatusColor(booking.status),
                              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
                            )}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          ${(booking.totalPrice || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {upcomingBookings.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                          No upcoming bookings
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 