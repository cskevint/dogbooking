import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

type tParams = Promise<{ id: string }>

export async function POST(
  request: Request,
  { params }: { params: tParams }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const { id } = await params

    // Get the sitter's profile
    const sitter = await prisma.sitter.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!sitter) {
      return new NextResponse('Sitter profile not found', { status: 404 })
    }

    // Check if the booking exists and belongs to the sitter
    const booking = await prisma.booking.findUnique({
      where: {
        id,
      },
    })

    if (!booking) {
      return new NextResponse('Booking not found', { status: 404 })
    }

    if (booking.sitterId !== sitter.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (booking.status !== 'PENDING') {
      return new NextResponse('Only pending bookings can be confirmed', {
        status: 400,
      })
    }

    // Confirm the booking
    const updatedBooking = await prisma.booking.update({
      where: {
        id,
      },
      data: {
        status: 'CONFIRMED',
      },
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('Error confirming booking:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 