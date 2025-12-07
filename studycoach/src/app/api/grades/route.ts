import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createGradeSchema = z.object({
  studentId: z.string().min(1, '학생을 선택해주세요'),
  examName: z.string().min(1, '시험명을 입력해주세요'),
  examDate: z.string().min(1, '시험 날짜를 선택해주세요'),
  examType: z.string().default('정기고사'),
  subject: z.string().min(1, '과목을 선택해주세요'),
  score: z.number().min(0).max(100, '점수는 0-100 사이여야 합니다'),
  maxScore: z.number().default(100),
  memo: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const subject = searchParams.get('subject')

    const where: any = {
      student: {
        academyId: session.user.academyId,
      },
    }

    if (studentId) {
      where.studentId = studentId
    }

    if (subject) {
      where.subject = subject
    }

    const grades = await prisma.grade.findMany({
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
        examDate: 'desc',
      },
    })

    return NextResponse.json(grades)
  } catch (error) {
    console.error('Grade fetch error:', error)
    return NextResponse.json({ error: '성적 목록을 불러오는데 실패했습니다' }, { status: 500 })
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
    const body = createGradeSchema.parse(json)

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

    const grade = await prisma.grade.create({
      data: {
        examName: body.examName,
        examDate: new Date(body.examDate),
        examType: body.examType,
        subject: body.subject,
        score: body.score,
        maxScore: body.maxScore,
        memo: body.memo,
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

    return NextResponse.json(grade, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Grade creation error:', error)
    return NextResponse.json({ error: '성적 등록에 실패했습니다' }, { status: 500 })
  }
}
