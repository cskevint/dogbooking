'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dog } from '@/types'
import EditDogForm from './EditDogForm'

interface Props {
  dog: Dog
}

export default function DogDetails({ dog }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this dog? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/dogs/${dog.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete dog')
      }

      router.push('/dashboard/client')
      router.refresh()
    } catch (error) {
      console.error('Error deleting dog:', error)
      alert('Failed to delete dog. Please try again.')
    }
  }

  if (isEditing) {
    return <EditDogForm dog={dog} onCancel={() => setIsEditing(false)} />
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Dog Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Details and attributes for {dog.name}.
            </p>
          </div>
          <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex sm:flex-shrink-0 sm:items-center">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="ml-3 inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="mt-5 border-t border-gray-200">
          <dl className="divide-y divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{dog.name}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Breed</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{dog.breed}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Age</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{dog.age} years</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Weight</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{dog.weight} lbs</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Health & Behavior</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <ul className="list-disc pl-5 space-y-1">
                  <li>{dog.vaccinated ? 'Vaccinated' : 'Not vaccinated'}</li>
                  <li>{dog.neutered ? 'Neutered/Spayed' : 'Not neutered/spayed'}</li>
                  <li>{dog.friendly ? 'Friendly with other dogs' : 'Not friendly with other dogs'}</li>
                </ul>
              </dd>
            </div>
            {dog.notes && (
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 whitespace-pre-wrap">
                  {dog.notes}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  )
} 