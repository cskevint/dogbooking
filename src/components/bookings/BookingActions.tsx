'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Booking } from '@/types'

interface Props {
  booking: Booking
}

export default function BookingActions({ booking }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async (action: 'confirm' | 'complete') => {
    if (!confirm(`Are you sure you want to ${action} this booking?`)) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/bookings/${booking.id}/${action}`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(errorData || `Failed to ${action} booking`)
      }

      router.refresh()
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error)
      alert(error instanceof Error ? error.message : `Failed to ${action} booking. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  if (booking.status === 'PENDING') {
    return (
      <button
        type="button"
        onClick={() => handleAction('confirm')}
        disabled={isLoading}
        className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isLoading ? 'Confirming...' : 'Confirm Booking'}
      </button>
    )
  }

  if (booking.status === 'CONFIRMED') {
    return (
      <button
        type="button"
        onClick={() => handleAction('complete')}
        disabled={isLoading}
        className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isLoading ? 'Completing...' : 'Mark as Completed'}
      </button>
    )
  }

  return null
} 