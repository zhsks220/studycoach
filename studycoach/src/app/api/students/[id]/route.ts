import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateStudentSchema = z.object({
  name: z.string().optional(),
  grade: z.string().optional(),
  birthDate: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const student = await prisma.student.findUnique({
      where: {
        id: id,
        academyId: session.user.academyId,
      },
      include: {
        grades: {
          orderBy: {
            examDate: 'desc',
          },
        },
        goals: {
          orderBy: {
            deadline: 'asc',
          },
        },
        attendances: {
          orderBy: {
            date: 'desc',
          },
        },
      },
    })

    if (!student) {
      return NextResponse.json({ error: '학생을 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error('Student fetch error:', error)
    return NextResponse.json({ error: '학생 정보를 불러오는데 실패했습니다' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const json = await request.json()
    const body = updateStudentSchema.parse(json)

    const updateData: any = {}
    if (body.name) updateData.name = body.name
    if (body.grade) updateData.grade = body.grade
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.birthDate !== undefined) {
      updateData.birthDate = body.birthDate ? new Date(body.birthDate) : null
    }

    const student = await prisma.student.update({
      where: {
        id: id,
        academyId: session.user.academyId,
      },
      data: updateData,
    })

    return NextResponse.json(student)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Student update error:', error)
    return NextResponse.json({ error: '학생 정보 수정에 실패했습니다' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자만 삭제할 수 있습니다' }, { status: 403 })
    }

    await prisma.student.delete({
      where: {
        id: id,
        academyId: session.user.academyId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Student deletion error:', error)
    return NextResponse.json({ error: '학생 삭제에 실패했습니다' }, { status: 500 })
  }
}
