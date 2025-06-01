import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { format } from 'date-fns'
import DogProfile from '@/components/dogs/DogProfile'

type tParams = Promise<{ id: string }>

interface Props {
  params: tParams
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const dog = await prisma.dog.findUnique({
    where: { id },
  })

  if (!dog) {
    return {
      title: 'Not Found',
    }
  }

  return {
    title: `${dog.name} - DogBooking`,
    description: `View information for ${dog.name}`,
  }
}

export default async function DogPage({ params }: Props) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const { id } = await params
  const dog = await prisma.dog.findUnique({
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
            View your dog's information
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
        <DogProfile dog={dog} />
      </div>
    </div>
  )
} 