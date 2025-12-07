import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createGoalSchema = z.object({
  studentId: z.string().min(1, '학생을 선택해주세요'),
  title: z.string().min(1, '목표 제목을 입력해주세요'),
  description: z.string().optional(),
  targetValue: z.number().min(0, '목표값은 0 이상이어야 합니다'),
  currentValue: z.number().min(0, '현재값은 0 이상이어야 합니다').default(0),
  unit: z.string().default('점'),
  deadline: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    const where: any = {
      student: {
        academyId: session.user.academyId,
      },
    }

    if (studentId) {
      where.studentId = studentId
    }

    const goals = await prisma.goal.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
      },
      orderBy: {
        deadline: 'asc',
      },
    })

    return NextResponse.json(goals)
  } catch (error) {
    console.error('Goal fetch error:', error)
    return NextResponse.json({ error: '목표 목록을 불러오는데 실패했습니다' }, { status: 500 })
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
    const body = createGoalSchema.parse(json)

    // Verify student belongs to same academy
    const student = await prisma.student.findFirst({
      where: {
        id: body.studentId,
        academyId: session.user.academyId,
      },
    })

    if (!student) {
      return NextResponse.json({ error: '학생을 찾을 수 없습니다' }, { status: 404 })
    }

    const goal = await prisma.goal.create({
      data: {
        title: body.title,
        description: body.description,
        targetValue: body.targetValue,
        currentValue: body.currentValue,
        unit: body.unit,
        deadline: body.deadline ? new Date(body.deadline) : null,
        studentId: body.studentId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
      },
    })

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Goal creation error:', error)
    return NextResponse.json({ error: '목표 생성에 실패했습니다' }, { status: 500 })
  }
}
