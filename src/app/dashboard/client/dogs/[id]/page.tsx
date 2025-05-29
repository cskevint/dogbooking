import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { format } from 'date-fns'

interface Props {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const dog = await prisma.Dog.findUnique({
    where: { id },
  })

  if (!dog) {
    return {
      title: 'Dog Not Found - DogBooking',
    }
  }

  return {
    title: `${dog.name} - DogBooking`,
    description: `Manage ${dog.name}'s information`,
  }
}

export default async function DogPage({ params }: Props) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const { id } = await params
  const dog = await prisma.Dog.findUnique({
    where: {
      id,
    },
  })

  if (!dog || dog.ownerId !== session.user.id) {
    notFound()
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {dog.name}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your dog's information
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            href={`/dashboard/client/dogs/${dog.id}/edit`}
            className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="mt-8">
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
      </div>
    </div>
  )
} 