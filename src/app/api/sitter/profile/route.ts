import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const profileSchema = z.object({
  bio: z.string().min(20).max(500),
  rate: z.number().min(5).max(200),
  city: z.string().min(2),
  state: z.string().length(2),
})

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const json = await request.json()
    const body = profileSchema.parse(json)

    // Get the sitter's profile
    const sitter = await prisma.Sitter.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!sitter) {
      return new NextResponse('Sitter profile not found', { status: 404 })
    }

    // Update the sitter's profile
    const updatedSitter = await prisma.Sitter.update({
      where: {
        id: sitter.id,
      },
      data: {
        bio: body.bio,
        rate: body.rate,
        city: body.city,
        state: body.state,
      },
    })

    return NextResponse.json(updatedSitter)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 })
    }

    console.error('Error updating sitter profile:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 