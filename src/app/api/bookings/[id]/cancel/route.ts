import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import type { BookingStatus } from '@/types'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const bookingId = params.id

    // Check if the booking exists and belongs to the user
    const booking = await prisma.Booking.findUnique({
      where: {
        id: bookingId,
      },
    })

    if (!booking) {
      return new NextResponse('Booking not found', { status: 404 })
    }

    if (booking.clientId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if the booking can be cancelled
    const allowedStatuses: BookingStatus[] = ['PENDING', 'CONFIRMED']
    if (!allowedStatuses.includes(booking.status as BookingStatus)) {
      return new NextResponse(
        'Only pending or confirmed bookings can be cancelled',
        { status: 400 }
      )
    }

    // Cancel the booking
    const updatedBooking = await prisma.Booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: 'CANCELLED',
      },
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 