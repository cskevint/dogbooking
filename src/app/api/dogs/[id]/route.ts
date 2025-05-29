import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const dogSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  breed: z.string().min(1, 'Breed is required'),
  age: z.number().min(0, 'Age must be 0 or greater'),
  weight: z.number().positive('Weight must be greater than 0'),
  vaccinated: z.boolean(),
  neutered: z.boolean(),
  friendly: z.boolean(),
  notes: z.string().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: 'You must be logged in to update a dog' }),
        { status: 401 }
      )
    }

    const dog = await prisma.Dog.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!dog || dog.ownerId !== session.user.id) {
      return new NextResponse(
        JSON.stringify({ error: 'Dog not found or unauthorized' }),
        { status: 404 }
      )
    }

    const json = await request.json()
    const body = dogSchema.parse(json)

    const updatedDog = await prisma.Dog.update({
      where: {
        id: params.id,
      },
      data: body,
    })

    return new NextResponse(JSON.stringify(updatedDog))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.errors }), {
        status: 400,
      })
    }

    console.error('Dog update error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: 'You must be logged in to delete a dog' }),
        { status: 401 }
      )
    }

    const dog = await prisma.Dog.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!dog || dog.ownerId !== session.user.id) {
      return new NextResponse(
        JSON.stringify({ error: 'Dog not found or unauthorized' }),
        { status: 404 }
      )
    }

    await prisma.Dog.delete({
      where: {
        id: params.id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Dog deletion error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
} 