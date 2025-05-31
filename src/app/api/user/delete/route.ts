import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    // Delete the user's reviews through bookings
    await prisma.review.deleteMany({
      where: {
        booking: {
          OR: [
            { clientId: session.user.id },
            { sitterId: session.user.id },
          ],
        },
      },
    })

    // Delete the user's bookings
    await prisma.booking.deleteMany({
      where: {
        OR: [
          { clientId: session.user.id },
          { sitterId: session.user.id },
        ],
      },
    })

    // Delete the user's sitter profile if it exists
    await prisma.sitter.deleteMany({
      where: {
        userId: session.user.id,
      },
    })

    // Delete the user's dogs if they are a client
    await prisma.dog.deleteMany({
      where: {
        ownerId: session.user.id,
      },
    })

    // Finally, delete the user
    await prisma.user.delete({
      where: {
        id: session.user.id,
      },
    })

    return NextResponse.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Error deleting user account:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 