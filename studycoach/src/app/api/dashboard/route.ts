import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const academyId = session.user.academyId

    // Get counts
    const [studentCount, gradeCount, goalCount, attendanceCount] = await Promise.all([
      prisma.student.count({ where: { academyId } }),
      prisma.grade.count({
        where: { student: { academyId } },
      }),
      prisma.goal.count({
        where: { student: { academyId }, status: 'IN_PROGRESS' },
      }),
      prisma.attendance.count({
        where: { student: { academyId } },
      }),
    ])

    // Get average score
    const grades = await prisma.grade.findMany({
      where: { student: { academyId } },
      select: { score: true },
    })
    const averageScore = grades.length > 0
      ? Math.round((grades.reduce((sum, g) => sum + g.score, 0) / grades.length) * 10) / 10
      : 0

    // Get recent activities (latest 10)
    const recentGrades = await prisma.grade.findMany({
      where: { student: { academyId } },
      include: { student: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    const recentGoals = await prisma.goal.findMany({
      where: { student: { academyId }, status: 'ACHIEVED' },
      include: { student: { select: { name: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    })

    const recentAttendances = await prisma.attendance.findMany({
      where: { student: { academyId } },
      include: { student: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // Merge and sort recent activities
    const activities = [
      ...recentGrades.map(g => ({
        type: 'grade' as const,
        title: `${g.student.name} 학생 성적 입력`,
        description: `${g.examName} - ${g.subject} ${g.score}점`,
        createdAt: g.createdAt.toISOString(),
      })),
      ...recentGoals.map(g => ({
        type: 'goal' as const,
        title: `${g.student.name} 목표 달성`,
        description: g.title,
        createdAt: g.updatedAt.toISOString(),
      })),
      ...recentAttendances.map(a => ({
        type: 'attendance' as const,
        title: `${a.student.name} 출석 체크`,
        description: a.status === 'PRESENT' ? '출석 완료' : a.status === 'LATE' ? '지각' : '결석',
        createdAt: a.createdAt.toISOString(),
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)

    // Calculate metrics
    const totalGoals = await prisma.goal.count({
      where: { student: { academyId } },
    })
    const achievedGoals = await prisma.goal.count({
      where: { student: { academyId }, status: 'ACHIEVED' },
    })
    const goalAchievementRate = totalGoals > 0
      ? Math.round((achievedGoals / totalGoals) * 100)
      : 0

    const totalAttendances = await prisma.attendance.count({
      where: { student: { academyId } },
    })
    const presentAttendances = await prisma.attendance.count({
      where: { student: { academyId }, status: 'PRESENT' },
    })
    const attendanceRate = totalAttendances > 0
      ? Math.round((presentAttendances / totalAttendances) * 100)
      : 0

    // Grade input rate (students with grades / total students)
    const studentsWithGrades = await prisma.student.count({
      where: {
        academyId,
        grades: { some: {} },
      },
    })
    const gradeInputRate = studentCount > 0
      ? Math.round((studentsWithGrades / studentCount) * 100)
      : 0

    return NextResponse.json({
      stats: {
        studentCount,
        gradeCount,
        goalCount,
        averageScore,
      },
      activities,
      metrics: {
        gradeInputRate,
        attendanceRate,
        goalAchievementRate,
      },
    })
  } catch (error) {
    console.error('Dashboard fetch error:', error)
    return NextResponse.json({ error: '데이터를 불러오는데 실패했습니다' }, { status: 500 })
  }
}
