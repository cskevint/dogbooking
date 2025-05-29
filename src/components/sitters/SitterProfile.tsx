'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { StarIcon } from '@heroicons/react/20/solid'
import { MapPinIcon, CurrencyDollarIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'
import BookingForm from './BookingForm'

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

interface Dog {
  id: string
  name: string
}

interface Props {
  sitter: Sitter
  clientDogs: Dog[]
}

export default function SitterProfile({ sitter, clientDogs }: Props) {
  const [showBookingForm, setShowBookingForm] = useState(false)

  const averageRating =
    sitter.bookings.reduce((acc, booking) => {
      if (booking.review) {
        return acc + booking.review.rating
      }
      return acc
    }, 0) / sitter.bookings.filter((booking) => booking.review).length || 0

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-start sm:justify-between">
          <div className="sm:flex sm:items-start">
            <div className="sm:mr-6">
              <Image
                className="h-24 w-24 rounded-full"
                src={sitter.user.image || '/default-avatar.svg'}
                alt={sitter.user.name}
                width={96}
                height={96}
              />
            </div>
            <div>
              <div className="flex items-center">
                <h3 className="text-xl font-medium text-gray-900">{sitter.user.name}</h3>
                <span className="ml-3 inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  {sitter._count.bookings} stays completed
                </span>
              </div>
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <MapPinIcon className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                {sitter.city}, {sitter.state}
              </div>
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <CurrencyDollarIcon className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                ${sitter.rate}/hour
              </div>
              {averageRating > 0 && (
                <div className="mt-1 flex items-center">
                  <div className="flex items-center">
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <StarIcon
                        key={rating}
                        className={`${
                          rating < Math.round(averageRating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        } h-5 w-5 flex-shrink-0`}
                      />
                    ))}
                  </div>
                  <p className="ml-2 text-sm text-gray-500">
                    {averageRating.toFixed(1)} out of 5 stars
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-5 sm:mt-0">
            <button
              onClick={() => setShowBookingForm(true)}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <CalendarDaysIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
              Book Now
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-lg font-medium text-gray-900">About</h4>
          <p className="mt-2 text-sm text-gray-500 whitespace-pre-wrap">{sitter.bio}</p>
        </div>

        {sitter.bookings.length > 0 && (
          <div className="mt-8">
            <h4 className="text-lg font-medium text-gray-900">Recent Reviews</h4>
            <div className="mt-4 space-y-6">
              {sitter.bookings
                .filter((booking) => booking.review)
                .map((booking) => (
                  <div key={booking.id} className="relative">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <Image
                          className="h-10 w-10 rounded-full"
                          src={booking.client.image || '/default-avatar.svg'}
                          alt={booking.client.name}
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-medium text-gray-900">
                            {booking.client.name}
                          </h5>
                        </div>
                        {booking.review && (
                          <>
                            <div className="mt-1 flex items-center">
                              {[0, 1, 2, 3, 4].map((rating) => (
                                <StarIcon
                                  key={rating}
                                  className={`${
                                    rating < booking.review!.rating
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  } h-4 w-4 flex-shrink-0`}
                                />
                              ))}
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                              {booking.review.comment}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {showBookingForm && (
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <BookingForm
            sitter={sitter}
            clientDogs={clientDogs}
            onCancel={() => setShowBookingForm(false)}
          />
        </div>
      )}
    </div>
  )
} 