import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, '이름은 2글자 이상이어야 합니다'),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
  academyName: z.string().min(2, '학원명은 2글자 이상이어야 합니다'),
  academyPhone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const body = registerSchema.parse(json)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다' },
        { status: 400 }
      )
    }

    // Create academy and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create academy
      const academy = await tx.academy.create({
        data: {
          name: body.academyName,
          phone: body.academyPhone,
          subscriptionPlan: 'free',
        },
      })

      // Create admin user for the academy
      const hashedPassword = await hashPassword(body.password)
      const user = await tx.user.create({
        data: {
          email: body.email,
          name: body.name,
          password: hashedPassword,
          role: 'ADMIN',
          academyId: academy.id,
        },
      })

      return { user, academy }
    })

    return NextResponse.json(
      {
        message: '회원가입이 완료되었습니다',
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
