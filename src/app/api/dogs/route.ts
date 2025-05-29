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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: 'You must be logged in to add a dog' }),
        { status: 401 }
      )
    }

    if (session.user.role !== 'CLIENT') {
      return new NextResponse(
        JSON.stringify({ error: 'Only clients can add dogs' }),
        { status: 403 }
      )
    }

    const json = await request.json()
    const body = dogSchema.parse(json)

    const dog = await prisma.Dog.create({
      data: {
        ...body,
        ownerId: session.user.id,
      },
    })

    return new NextResponse(JSON.stringify(dog), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.errors }), {
        status: 400,
      })
    }

    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
} 