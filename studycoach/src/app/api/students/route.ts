import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createStudentSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  grade: z.string().min(1, '학년을 선택해주세요'),
  birthDate: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const grade = searchParams.get('grade')

    const where: any = {
      academyId: session.user.academyId,
    }

    if (search) {
      where.name = {
        contains: search,
      }
    }

    if (grade) {
      where.grade = grade
    }

    const students = await prisma.student.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            grades: true,
            goals: true,
            attendances: true,
          },
        },
      },
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('Student fetch error:', error)
    return NextResponse.json({ error: '학생 목록을 불러오는데 실패했습니다' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const json = await request.json()
    const body = createStudentSchema.parse(json)

    const student = await prisma.student.create({
      data: {
        name: body.name,
        grade: body.grade,
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        phone: body.phone,
        notes: body.notes,
        academyId: session.user.academyId,
      },
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Student creation error:', error)
    return NextResponse.json({ error: '학생 등록에 실패했습니다' }, { status: 500 })
  }
}
