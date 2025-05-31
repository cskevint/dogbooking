'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'

const bookingSchema = z.object({
  dogIds: z.array(z.string()).min(1, 'Please select at least one dog'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  notes: z.string().optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

interface Sitter {
  id: string
  rate: number
  user: {
    name: string
  }
}

interface Dog {
  id: string
  name: string
}

interface Props {
  sitter: Sitter
  clientDogs: Dog[]
  onCancel: () => void
}

export default function BookingForm({ sitter, clientDogs, onCancel }: Props) {
  const [error, setError] = useState('')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      dogIds: [],
      notes: '',
    },
  })

  const startDate = watch('startDate')
  const endDate = watch('endDate')

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const hours = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60))
    return hours * sitter.rate
  }

  const onSubmit = async (data: BookingFormData) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          sitterId: sitter.id,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong')
      }

      router.push('/dashboard/client/bookings')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Book with {sitter.user.name}</h3>
        <p className="mt-1 text-sm text-gray-500">
          Fill out the form below to schedule pet sitting services.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Select Dogs</label>
        <div className="mt-2 space-y-2">
          {clientDogs.map((dog) => (
            <div key={dog.id} className="relative flex items-start">
              <div className="flex h-5 items-center">
                <input
                  type="checkbox"
                  value={dog.id}
                  {...register('dogIds')}
                  className="h-4 w-4 rounded border-gray-300 bg-white text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor={dog.id} className="font-medium text-gray-700">
                  {dog.name}
                </label>
              </div>
            </div>
          ))}
        </div>
        {errors.dogIds && (
          <p className="mt-2 text-sm text-red-600">{errors.dogIds.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date & Time
          </label>
          <input
            type="datetime-local"
            {...register('startDate')}
            min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
            className="mt-1 block w-full rounded-md border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.startDate && (
            <p className="mt-2 text-sm text-red-600">{errors.startDate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date & Time
          </label>
          <input
            type="datetime-local"
            {...register('endDate')}
            min={startDate || format(new Date(), "yyyy-MM-dd'T'HH:mm")}
            className="mt-1 block w-full rounded-md border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.endDate && (
            <p className="mt-2 text-sm text-red-600">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes for the Sitter
        </label>
        <textarea
          {...register('notes')}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Any special instructions or requirements"
        />
        {errors.notes && (
          <p className="mt-2 text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

      {startDate && endDate && (
        <div className="rounded-md bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">Estimated Total</span>
            <span className="text-lg font-semibold text-gray-900">
              ${calculateTotal().toFixed(2)}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Based on {sitter.user.name}'s rate of ${sitter.rate}/hour
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Booking...' : 'Book Now'}
        </button>
      </div>
    </form>
  )
} 