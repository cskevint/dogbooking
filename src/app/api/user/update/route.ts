import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import * as z from 'zod'

const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
})

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const json = await request.json()
    const body = updateUserSchema.parse(json)

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: body.email,
        NOT: {
          id: session.user.id,
        },
      },
    })

    if (existingUser) {
      return new NextResponse('Email already taken', { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: body.name,
        email: body.email,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }

    return new NextResponse('Internal Error', { status: 500 })
  }
} 