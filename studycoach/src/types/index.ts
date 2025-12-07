import { Role, GoalStatus, AttendanceStatus } from '@prisma/client'

export type { Role, GoalStatus, AttendanceStatus }

export interface User {
  id: string
  email: string
  name: string
  role: Role
  academyId: string
}

export interface Student {
  id: string
  name: string
  grade: string
  birthDate?: Date | null
  phone?: string | null
  academyId: string
  notes?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Grade {
  id: string
  examName: string
  examDate: Date
  examType: string
  subject: string
  score: number
  maxScore: number
  studentId: string
  memo?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Goal {
  id: string
  title: string
  description?: string | null
  targetValue: number
  currentValue: number
  unit: string
  deadline?: Date | null
  status: GoalStatus
  studentId: string
  createdAt: Date
  updatedAt: Date
}

export interface Attendance {
  id: string
  date: Date
  status: AttendanceStatus
  studentId: string
  memo?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface SessionUser {
  id: string
  email: string
  name: string
  role: Role
  academyId: string
}
