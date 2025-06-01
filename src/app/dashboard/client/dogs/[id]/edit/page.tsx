import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import EditDogWrapper from '@/components/dogs/EditDogWrapper'

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
    title: `Edit ${dog.name} - DogBooking`,
    description: `Edit information for ${dog.name}`,
  }
}

export default async function EditDogPage({ params }: Props) {
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
            Edit {dog.name}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Update your dog's information
          </p>
        </div>
      </div>

      <div className="mt-8">
        <EditDogWrapper dog={dog} />
      </div>
    </div>
  )
} 