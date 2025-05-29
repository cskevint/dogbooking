import { NextResponse } from 'next/server'
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

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const body = signUpSchema.parse(json)

    const { name, email, password, role } = body

    const exists = await prisma.User.findUnique({
      where: { email },
    })

    if (exists) {
      return new NextResponse(
        JSON.stringify({ error: 'User with this email already exists' }),
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 10)

    const user = await prisma.User.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    })

    if (role === 'SITTER') {
      await prisma.Sitter.create({
        data: {
          userId: user.id,
          bio: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          rate: 0,
          capacity: 1,
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