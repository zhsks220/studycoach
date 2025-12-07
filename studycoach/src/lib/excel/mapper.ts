/**
 * 엑셀 데이터를 DB 모델로 매핑
 */

import { StudentData, GradeData, GoalData } from './types'
import { Prisma } from '@prisma/client'

/**
 * 학생 데이터를 Prisma 생성 데이터로 변환
 */
export function mapStudentToPrisma(
  data: StudentData
): Prisma.StudentCreateInput {
  return {
    name: data.name,
    grade: data.grade,
    class: data.class ?? undefined,
    phone: data.phone ?? undefined,
    parentPhone: data.parentPhone ?? undefined,
    address: data.address ?? undefined,
  }
}

/**
 * 성적 데이터를 Prisma 생성 데이터로 변환
 * 주의: studentId는 별도로 찾아서 매핑해야 함
 */
export function mapGradeToPrismaInput(data: GradeData) {
  return {
    subject: data.subject,
    semester: data.semester,
    examType: data.examType,
    score: data.score,
    examDate: new Date(data.examDate),
    studentName: data.studentName, // 임시로 저장 (나중에 studentId로 변환)
  }
}

/**
 * 목표 데이터를 Prisma 생성 데이터로 변환
 * 주의: studentId는 별도로 찾아서 매핑해야 함
 */
export function mapGoalToPrismaInput(data: GoalData) {
  return {
    title: data.title,
    currentScore: data.currentScore,
    targetScore: data.targetScore,
    deadline: new Date(data.deadline),
    status: 'IN_PROGRESS' as const,
    studentName: data.studentName, // 임시로 저장 (나중에 studentId로 변환)
  }
}

/**
 * 학생 이름으로 ID 찾기 헬퍼
 * DB에서 학생을 찾아 매핑할 때 사용
 */
export async function findStudentIdByName(
  prisma: any,
  studentName: string
): Promise<string | null> {
  const student = await prisma.student.findFirst({
    where: {
      name: studentName,
    },
    select: {
      id: true,
    },
  })

  return student?.id ?? null
}

/**
 * 여러 학생 이름을 한번에 조회하여 맵 생성
 */
export async function createStudentNameToIdMap(
  prisma: any,
  studentNames: string[]
): Promise<Map<string, string>> {
  const uniqueNames = [...new Set(studentNames)]

  const students = await prisma.student.findMany({
    where: {
      name: {
        in: uniqueNames,
      },
    },
    select: {
      id: true,
      name: true,
    },
  })

  const map = new Map<string, string>()
  students.forEach((student: any) => {
    map.set(student.name, student.id)
  })

  return map
}

/**
 * 성적 데이터 매핑 (학생 ID 포함)
 */
export function mapGradeToPrisma(
  data: GradeData,
  studentId: string
): Prisma.GradeCreateInput {
  return {
    subject: data.subject,
    semester: data.semester,
    examType: data.examType,
    score: data.score,
    examDate: new Date(data.examDate),
    student: {
      connect: { id: studentId },
    },
  }
}

/**
 * 목표 데이터 매핑 (학생 ID 포함)
 */
export function mapGoalToPrisma(
  data: GoalData,
  studentId: string
): Prisma.GoalCreateInput {
  return {
    title: data.title,
    currentScore: data.currentScore,
    targetScore: data.targetScore,
    deadline: new Date(data.deadline),
    status: 'IN_PROGRESS',
    student: {
      connect: { id: studentId },
    },
  }
}
