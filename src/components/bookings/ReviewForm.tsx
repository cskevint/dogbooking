'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  bookingId: string
}

export default function ReviewForm({ bookingId }: Props) {
  const router = useRouter()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          rating,
          comment,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit review')
      }

      router.refresh()
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
          Rating
        </label>
        <div className="mt-1 flex items-center">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className="p-1"
            >
              <svg
                className={`h-6 w-6 ${
                  value <= rating ? 'text-yellow-400' : 'text-gray-300'
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
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-500">{rating}/5</span>
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
          Comment
        </label>
        <div className="mt-1">
          <textarea
            id="comment"
            name="comment"
            rows={4}
            className="block w-full rounded-md border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  )
} 