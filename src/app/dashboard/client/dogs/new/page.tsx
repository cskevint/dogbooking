import { Metadata } from 'next'
import AddDogForm from '@/components/dogs/AddDogForm'

export const metadata: Metadata = {
  title: 'Add Dog - DogBooking',
  description: 'Add your dog to start booking pet sitting services',
}

export default function AddDogPage() {
  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Add Your Dog
          </h2>
        </div>
      </div>

      <div className="mt-8">
        <AddDogForm />
      </div>
    </div>
  )
} 