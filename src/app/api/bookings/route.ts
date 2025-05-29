import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const bookingSchema = z.object({
  sitterId: z.string(),
  dogIds: z.array(z.string()),
  startDate: z.string(),
  endDate: z.string(),
  notes: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: 'You must be logged in to create a booking' }),
        { status: 401 }
      )
    }

    const json = await request.json()
    const body = bookingSchema.parse(json)

    // Verify that all dogs belong to the user
    const dogs = await prisma.dog.findMany({
      where: {
        id: { in: body.dogIds },
        ownerId: session.user.id,
      },
    })

    if (dogs.length !== body.dogIds.length) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid dog selection' }),
        { status: 400 }
      )
    }

    // Verify that the sitter exists
    const sitter = await prisma.sitter.findUnique({
      where: { id: body.sitterId },
    })

    if (!sitter) {
      return new NextResponse(
        JSON.stringify({ error: 'Sitter not found' }),
        { status: 404 }
      )
    }

    // Calculate total price based on duration and sitter's rate
    const startDate = new Date(body.startDate)
    const endDate = new Date(body.endDate)
    const hours = Math.max(0, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))
    const totalPrice = hours * sitter.rate

    // Create the booking
    const booking = await prisma.Booking.create({
      data: {
        startDate,
        endDate,
        notes: body.notes,
        status: 'PENDING',
        totalPrice,
        clientId: session.user.id,
        sitterId: body.sitterId,
        dogs: {
          connect: body.dogIds.map((id) => ({ id })),
        },
      },
      include: {
        sitter: {
          include: {
            user: true,
          },
        },
        dogs: true,
      },
    })

    return new NextResponse(JSON.stringify(booking))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.errors }), {
        status: 400,
      })
    }

    console.error('Booking creation error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
} 