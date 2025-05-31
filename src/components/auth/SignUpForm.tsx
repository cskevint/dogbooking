'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

type UserRole = 'CLIENT' | 'SITTER'

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['CLIENT', 'SITTER'] as const),
  // Additional sitter fields
  bio: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  rate: z.number().positive().optional(),
  capacity: z.number().int().positive().optional(),
}).refine((data) => {
  if (data.role === 'SITTER') {
    return !!(data.bio && data.address && data.city && data.state && data.zipCode && data.rate && data.capacity)
  }
  return true
}, {
  message: "All sitter fields are required",
  path: ["role"]
})

type SignUpFormData = z.infer<typeof signUpSchema>

export default function SignUpForm() {
  const [error, setError] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole>('CLIENT')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: 'CLIENT',
    },
  })

  const role = watch('role')

  const onSubmit = async (data: SignUpFormData) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong')
      }

      router.push('/auth/signin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className="mt-1 block w-full rounded-md border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="mt-1 block w-full rounded-md border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="mt-1 block w-full rounded-md border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            I want to
          </label>
          <select
            {...register('role')}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            className="mt-1 block w-full rounded-md border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="CLIENT">Book a pet sitter</option>
            <option value="SITTER">Become a pet sitter</option>
          </select>
        </div>

        {role === 'SITTER' && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                id="bio"
                {...register('bio')}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  id="address"
                  type="text"
                  {...register('address')}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  {...register('city')}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  id="state"
                  type="text"
                  {...register('state')}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                  ZIP Code
                </label>
                <input
                  id="zipCode"
                  type="text"
                  {...register('zipCode')}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="rate" className="block text-sm font-medium text-gray-700">
                  Hourly Rate ($)
                </label>
                <input
                  id="rate"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('rate', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                  Max Dogs Capacity
                </label>
                <input
                  id="capacity"
                  type="number"
                  min="1"
                  {...register('capacity', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </div>
    </form>
  )
} 