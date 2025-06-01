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

    if (booking.status !== 'CONFIRMED') {
      return new NextResponse('Only confirmed bookings can be completed', {
        status: 400,
      })
    }

    // Complete the booking and set end date to now
    const now = new Date()
    const updatedBooking = await prisma.booking.update({
      where: {
        id,
      },
      data: {
        status: 'COMPLETED',
        endDate: now,
      },
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('Error completing booking:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 