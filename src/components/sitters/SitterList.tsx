'use client'

import Image from 'next/image'
import Link from 'next/link'
import { StarIcon } from '@heroicons/react/20/solid'
import { MapPinIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import type { Sitter } from '@/types'

interface SitterWithCount extends Sitter {
  _count: {
    bookings: number
  }
}

interface Props {
  sitters: SitterWithCount[]
}

export default function SitterList({ sitters }: Props) {
  if (sitters.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No sitters available</h3>
        <p className="mt-1 text-sm text-gray-500">
          Check back later for available pet sitters.
        </p>
      </div>
    )
  }

  return (
    <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sitters.map((sitter) => (
        <li
          key={sitter.id}
          className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow"
        >
          <div className="flex w-full items-center justify-between space-x-6 p-6">
            <div className="flex-1 truncate">
              <div className="flex items-center space-x-3">
                <h3 className="truncate text-sm font-medium text-gray-900">
                  {sitter.user.name}
                </h3>
                <span className="inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  {sitter._count.bookings} stays
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
            </div>
            <div className="h-10 w-10 flex-shrink-0">
              <Image
                className="h-10 w-10 rounded-full"
                src={sitter.user.image || '/default-avatar.svg'}
                alt={sitter.user.name || ''}
                width={40}
                height={40}
              />
            </div>
          </div>
          <div>
            <div className="-mt-px flex divide-x divide-gray-200">
              <div className="flex w-0 flex-1">
                <Link
                  href={`/dashboard/client/sitters/${sitter.id}`}
                  className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
} 