import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { prisma } from '@/lib/prisma'
import { type NextRequest, NextResponse } from 'next/server'
import type { BookingStatus } from '@/types'

type tParams = Promise<{ id: string }>

export async function POST(
  request: NextRequest,
  { params }: { params: tParams }
): Promise<Response | void> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const { id } = await params

    // Check if the booking exists and belongs to the user
    const booking = await prisma.booking.findUnique({
      where: {
        id,
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
    const updatedBooking = await prisma.booking.update({
      where: {
        id,
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