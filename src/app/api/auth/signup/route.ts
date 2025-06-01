import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['CLIENT', 'SITTER']),
  bio: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  rate: z.number().positive().optional(),
  capacity: z.number().int().positive().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const body = signUpSchema.parse(json)

    const { name, email, password, role, bio, address, city, state, zipCode, rate, capacity } = body

    const exists = await prisma.user.findUnique({
      where: { email },
    })

    if (exists) {
      return new NextResponse(
        JSON.stringify({ error: 'User with this email already exists' }),
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    })

    if (role === 'SITTER') {
      await prisma.sitter.create({
        data: {
          userId: user.id,
          bio: bio || '',
          address: address || '',
          city: city || '',
          state: state || '',
          zipCode: zipCode || '',
          rate: rate || 0,
          capacity: capacity || 1,
        },
      })
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 