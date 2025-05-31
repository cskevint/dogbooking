'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const profileSchema = z.object({
  bio: z.string().min(20, 'Bio must be at least 20 characters').max(500, 'Bio cannot exceed 500 characters'),
  rate: z.number().min(5, 'Rate must be at least $5').max(200, 'Rate cannot exceed $200'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().length(2, 'Please select a state'),
  zipCode: z.string().min(5, 'Valid ZIP code is required'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').max(10, 'Capacity cannot exceed 10'),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface Props {
  sitter: {
    bio: string | null
    rate: number
    address: string
    city: string | null
    state: string | null
    zipCode: string
    capacity: number
  }
}

export default function SitterProfileForm({ sitter }: Props) {
  const [error, setError] = useState('')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: sitter.bio || '',
      rate: sitter.rate,
      address: sitter.address,
      city: sitter.city || '',
      state: sitter.state || '',
      zipCode: sitter.zipCode,
      capacity: sitter.capacity,
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const response = await fetch('/api/sitter/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <div className="mt-1">
          <textarea
            {...register('bio')}
            rows={4}
            className="block w-full rounded-md border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Tell pet owners about yourself, your experience with dogs, and what makes you a great sitter..."
          />
        </div>
        {errors.bio && (
          <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="rate" className="block text-sm font-medium text-gray-700">
            Hourly Rate ($)
          </label>
          <div className="mt-1">
            <input
              type="number"
              {...register('rate', { valueAsNumber: true })}
              className="block w-full rounded-md border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="25"
              step="0.01"
            />
          </div>
          {errors.rate && (
            <p className="mt-1 text-sm text-red-600">{errors.rate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
            Maximum Capacity
          </label>
          <div className="mt-1">
            <input
              type="number"
              {...register('capacity', { valueAsNumber: true })}
              className="block w-full rounded-md border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="3"
              min="1"
              max="10"
            />
          </div>
          {errors.capacity && (
            <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Street Address
        </label>
        <div className="mt-1">
          <input
            type="text"
            {...register('address')}
            className="block w-full rounded-md border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="123 Main St"
          />
        </div>
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <div className="mt-1">
            <input
              type="text"
              {...register('city')}
              className="block w-full rounded-md border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter your city"
            />
          </div>
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State
          </label>
          <div className="mt-1">
            <select
              {...register('state')}
              className="block w-full rounded-md border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select state</option>
              <option value="AL">Alabama</option>
              <option value="AK">Alaska</option>
              <option value="AZ">Arizona</option>
              <option value="AR">Arkansas</option>
              <option value="CA">California</option>
              <option value="CO">Colorado</option>
              <option value="CT">Connecticut</option>
              <option value="DE">Delaware</option>
              <option value="FL">Florida</option>
              <option value="GA">Georgia</option>
              <option value="HI">Hawaii</option>
              <option value="ID">Idaho</option>
              <option value="IL">Illinois</option>
              <option value="IN">Indiana</option>
              <option value="IA">Iowa</option>
              <option value="KS">Kansas</option>
              <option value="KY">Kentucky</option>
              <option value="LA">Louisiana</option>
              <option value="ME">Maine</option>
              <option value="MD">Maryland</option>
              <option value="MA">Massachusetts</option>
              <option value="MI">Michigan</option>
              <option value="MN">Minnesota</option>
              <option value="MS">Mississippi</option>
              <option value="MO">Missouri</option>
              <option value="MT">Montana</option>
              <option value="NE">Nebraska</option>
              <option value="NV">Nevada</option>
              <option value="NH">New Hampshire</option>
              <option value="NJ">New Jersey</option>
              <option value="NM">New Mexico</option>
              <option value="NY">New York</option>
              <option value="NC">North Carolina</option>
              <option value="ND">North Dakota</option>
              <option value="OH">Ohio</option>
              <option value="OK">Oklahoma</option>
              <option value="OR">Oregon</option>
              <option value="PA">Pennsylvania</option>
              <option value="RI">Rhode Island</option>
              <option value="SC">South Carolina</option>
              <option value="SD">South Dakota</option>
              <option value="TN">Tennessee</option>
              <option value="TX">Texas</option>
              <option value="UT">Utah</option>
              <option value="VT">Vermont</option>
              <option value="VA">Virginia</option>
              <option value="WA">Washington</option>
              <option value="WV">West Virginia</option>
              <option value="WI">Wisconsin</option>
              <option value="WY">Wyoming</option>
            </select>
          </div>
          {errors.state && (
            <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
            ZIP Code
          </label>
          <div className="mt-1">
            <input
              type="text"
              {...register('zipCode')}
              className="block w-full rounded-md border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="12345"
              maxLength={5}
            />
          </div>
          {errors.zipCode && (
            <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
} 