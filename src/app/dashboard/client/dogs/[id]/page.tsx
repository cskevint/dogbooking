import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import DogDetails from '@/components/dogs/DogDetails'
import type { Metadata } from 'next'

interface Props {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dog = await prisma.Dog.findUnique({
    where: { id: params.id },
  })

  if (!dog) {
    return {
      title: 'Dog Not Found - DogBooking',
    }
  }

  return {
    title: `${dog.name} - DogBooking`,
    description: `View and manage ${dog.name}'s profile`,
  }
}

export default async function DogPage({ params }: Props) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const dog = await prisma.Dog.findUnique({
    where: {
      id: params.id,
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
        </div>
      </div>

      <div className="mt-8">
        <DogDetails dog={dog} />
      </div>
    </div>
  )
} 