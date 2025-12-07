/**
 * 엑셀 업로드 관련 타입 정의
 */

export type DataType = 'students' | 'grades' | 'goals'

export interface ExcelParseResult<T> {
  data: T[]
  errors: ParseError[]
  warnings: string[]
  totalRows: number
  validRows: number
}

export interface ParseError {
  row: number
  field?: string
  message: string
  value?: any
}

export interface StudentExcelData {
  이름: string
  학년: number
  반?: number
  연락처?: string
  부모연락처?: string
  주소?: string
}

export interface GradeExcelData {
  학생명: string
  과목: string
  학기: string
  시험종류: string
  점수: number
  시험일자: string
}

export interface GoalExcelData {
  학생명: string
  목표제목: string
  현재점수: number
  목표점수: number
  마감일: string
}

export interface StudentData {
  name: string
  grade: number
  class?: number
  phone?: string
  parentPhone?: string
  address?: string
}

export interface GradeData {
  studentName: string
  subject: string
  semester: string
  examType: string
  score: number
  examDate: string
}

export interface GoalData {
  studentName: string
  title: string
  currentScore: number
  targetScore: number
  deadline: string
}
