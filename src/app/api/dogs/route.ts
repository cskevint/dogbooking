import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const json = await request.json()
    const body = dogSchema.parse(json)

    const dog = await prisma.dog.create({
      data: {
        name: body.name,
        breed: body.breed,
        age: body.age,
        weight: body.weight,
        ownerId: session.user.id,
      },
    })

    return NextResponse.json(dog)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }

    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 