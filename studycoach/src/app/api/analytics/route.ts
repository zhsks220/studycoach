import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const academyId = session.user.academyId

    // 전체 학생 수
    const totalStudents = await prisma.student.count({
      where: { academyId },
    })

    // 전체 성적 데이터
    const allGrades = await prisma.grade.findMany({
      where: {
        student: {
          academyId,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // 평균 점수 계산
    const averageScore =
      allGrades.length > 0
        ? allGrades.reduce((sum, grade) => sum + grade.score, 0) / allGrades.length
        : 0

    // 활성 목표 수 (진행 중인 목표)
    const activeGoals = await prisma.goal.count({
      where: {
        student: {
          academyId,
        },
        status: 'IN_PROGRESS',
      },
    })

    // 최근 30일 출석률
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        student: {
          academyId,
        },
        date: {
          gte: thirtyDaysAgo,
        },
      },
    })

    const attendanceRate =
      attendanceRecords.length > 0
        ? (attendanceRecords.filter((a) => a.status === 'PRESENT').length /
            attendanceRecords.length) *
          100
        : 0

    // 성적 우수 학생 Top 5
    const studentScores = allGrades.reduce((acc, grade) => {
      if (!acc[grade.student.id]) {
        acc[grade.student.id] = {
          id: grade.student.id,
          name: grade.student.name,
          scores: [],
        }
      }
      acc[grade.student.id].scores.push(grade.score)
      return acc
    }, {} as Record<string, { id: string; name: string; scores: number[] }>)

    const topPerformers = Object.values(studentScores)
      .map((student) => ({
        id: student.id,
        name: student.name,
        averageScore:
          student.scores.reduce((sum, score) => sum + score, 0) / student.scores.length,
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5)

    // 과목별 성적
    const subjectScores = allGrades.reduce((acc, grade) => {
      if (!acc[grade.subject]) {
        acc[grade.subject] = []
      }
      acc[grade.subject].push(grade.score)
      return acc
    }, {} as Record<string, number[]>)

    const subjectPerformance = Object.entries(subjectScores)
      .map(([subject, scores]) => ({
        subject,
        averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
        count: scores.length,
      }))
      .sort((a, b) => b.averageScore - a.averageScore)

    // 최근 6개월 성적 추세
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const recentGrades = await prisma.grade.findMany({
      where: {
        student: {
          academyId,
        },
        examDate: {
          gte: sixMonthsAgo,
        },
      },
      orderBy: {
        examDate: 'asc',
      },
    })

    // 월별로 그룹화
    const monthlyScores = recentGrades.reduce((acc, grade) => {
      const month = new Date(grade.examDate).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
      })
      if (!acc[month]) {
        acc[month] = []
      }
      acc[month].push(grade.score)
      return acc
    }, {} as Record<string, number[]>)

    const recentTrends = Object.entries(monthlyScores).map(([month, scores]) => ({
      month,
      averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
    }))

    // 성적 분포 (등급별)
    const gradeDistribution = [
      { range: '90-100점', count: allGrades.filter((g) => g.score >= 90).length },
      {
        range: '80-89점',
        count: allGrades.filter((g) => g.score >= 80 && g.score < 90).length,
      },
      {
        range: '70-79점',
        count: allGrades.filter((g) => g.score >= 70 && g.score < 80).length,
      },
      {
        range: '60-69점',
        count: allGrades.filter((g) => g.score >= 60 && g.score < 70).length,
      },
      { range: '60점 미만', count: allGrades.filter((g) => g.score < 60).length },
    ].filter((item) => item.count > 0)

    // 월별 출석률 추세
    const recentAttendance = await prisma.attendance.findMany({
      where: {
        student: {
          academyId,
        },
        date: {
          gte: sixMonthsAgo,
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    const monthlyAttendanceData = recentAttendance.reduce((acc, record) => {
      const month = new Date(record.date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
      })
      if (!acc[month]) {
        acc[month] = { present: 0, total: 0 }
      }
      acc[month].total++
      if (record.status === 'PRESENT') {
        acc[month].present++
      }
      return acc
    }, {} as Record<string, { present: number; total: number }>)

    const monthlyAttendance = Object.entries(monthlyAttendanceData).map(([month, data]) => ({
      month,
      attendanceRate: (data.present / data.total) * 100,
    }))

    return NextResponse.json({
      totalStudents,
      totalGrades: allGrades.length,
      averageScore,
      activeGoals,
      attendanceRate,
      topPerformers,
      subjectPerformance,
      recentTrends,
      gradeDistribution,
      monthlyAttendance,
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: '분석 데이터를 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}
