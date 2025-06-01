import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const json = await request.json()
    const { bookingId, rating, comment } = json

    if (!bookingId || !rating || !comment) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return new NextResponse('Rating must be between 1 and 5', { status: 400 })
    }

    // Check if the booking exists and belongs to the user
    const booking = await prisma.booking.findUnique({
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

    if (booking.status !== 'COMPLETED') {
      return new NextResponse('Can only review completed bookings', { status: 400 })
    }

    // Check if a review already exists for this booking
    const existingReview = await prisma.review.findUnique({
      where: {
        bookingId,
      },
    })

    if (existingReview) {
      return new NextResponse('Review already exists', { status: 400 })
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        bookingId,
      },
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error creating review:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 