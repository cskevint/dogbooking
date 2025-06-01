import { format } from 'date-fns'
import type { Dog } from '@/types'

interface Props {
  dog: Dog
}

export default function DogProfile({ dog }: Props) {
  return (
    <div className="space-y-12">
      {/* Basic Information */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
        <div>
          <h2 className="text-base font-semibold leading-7 text-gray-900">Basic Information</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Your dog's basic details and characteristics.
          </p>
        </div>

        <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
          <div className="sm:col-span-3">
            <dt className="text-sm font-medium leading-6 text-gray-900">Name</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700">{dog.name}</dd>
          </div>

          <div className="sm:col-span-3">
            <dt className="text-sm font-medium leading-6 text-gray-900">Breed</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700">{dog.breed}</dd>
          </div>

          <div className="sm:col-span-3">
            <dt className="text-sm font-medium leading-6 text-gray-900">Age</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700">{dog.age} years</dd>
          </div>

          <div className="sm:col-span-3">
            <dt className="text-sm font-medium leading-6 text-gray-900">Weight</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700">{dog.weight} lbs</dd>
          </div>
        </div>
      </div>

      {/* Health & Behavior */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
        <div>
          <h2 className="text-base font-semibold leading-7 text-gray-900">Health & Behavior</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Medical information and behavioral characteristics.
          </p>
        </div>

        <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
          <div className="sm:col-span-6">
            <dt className="text-sm font-medium leading-6 text-gray-900">Status</dt>
            <dd className="mt-2 text-sm text-gray-700">
              <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
                <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                  <div className="flex w-0 flex-1 items-center">
                    <div className="ml-4 flex min-w-0 flex-1 gap-2">
                      <span className="truncate font-medium">Vaccinated</span>
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${dog.vaccinated ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'}`}>
                        {dog.vaccinated ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </li>
                <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                  <div className="flex w-0 flex-1 items-center">
                    <div className="ml-4 flex min-w-0 flex-1 gap-2">
                      <span className="truncate font-medium">Neutered/Spayed</span>
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${dog.neutered ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'}`}>
                        {dog.neutered ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </li>
                <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                  <div className="flex w-0 flex-1 items-center">
                    <div className="ml-4 flex min-w-0 flex-1 gap-2">
                      <span className="truncate font-medium">Friendly with other dogs</span>
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${dog.friendly ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20'}`}>
                        {dog.friendly ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </li>
              </ul>
            </dd>
          </div>

          {dog.notes && (
            <div className="sm:col-span-6">
              <dt className="text-sm font-medium leading-6 text-gray-900">Additional Notes</dt>
              <dd className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{dog.notes}</dd>
            </div>
          )}
        </div>
      </div>

      {/* Record Information */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
        <div>
          <h2 className="text-base font-semibold leading-7 text-gray-900">Record Information</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            System information about your dog's record.
          </p>
        </div>

        <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
          <div className="sm:col-span-3">
            <dt className="text-sm font-medium leading-6 text-gray-900">Created</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700">
              {format(new Date(dog.createdAt), 'PPP')}
            </dd>
          </div>

          <div className="sm:col-span-3">
            <dt className="text-sm font-medium leading-6 text-gray-900">Last Updated</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700">
              {format(new Date(dog.updatedAt), 'PPP')}
            </dd>
          </div>
        </div>
      </div>
    </div>
  )
} 