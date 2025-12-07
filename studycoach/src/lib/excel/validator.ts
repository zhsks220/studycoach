/**
 * 엑셀 데이터 검증 로직
 */

import { z } from 'zod'

/**
 * 전화번호 정규식 (선택적)
 */
const phoneRegex = /^010-\d{4}-\d{4}$/

/**
 * 학생 데이터 스키마
 */
export const studentSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다').max(50, '이름은 50자 이하여야 합니다'),
  grade: z
    .number()
    .int('학년은 정수여야 합니다')
    .min(1, '학년은 1 이상이어야 합니다')
    .max(12, '학년은 12 이하여야 합니다'),
  class: z
    .number()
    .int('반은 정수여야 합니다')
    .min(1, '반은 1 이상이어야 합니다')
    .max(20, '반은 20 이하여야 합니다')
    .optional()
    .nullable(),
  phone: z
    .string()
    .regex(phoneRegex, '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)')
    .optional()
    .nullable(),
  parentPhone: z
    .string()
    .regex(phoneRegex, '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)')
    .optional()
    .nullable(),
  address: z.string().max(200, '주소는 200자 이하여야 합니다').optional().nullable(),
})

/**
 * 성적 데이터 스키마
 */
export const gradeSchema = z.object({
  studentName: z.string().min(1, '학생명은 필수입니다'),
  subject: z.string().min(1, '과목명은 필수입니다').max(50, '과목명은 50자 이하여야 합니다'),
  semester: z.string().min(1, '학기는 필수입니다'),
  examType: z.enum(['중간고사', '기말고사', '모의고사', '수행평가'], {
    errorMap: () => ({
      message: '시험종류는 중간고사, 기말고사, 모의고사, 수행평가 중 하나여야 합니다',
    }),
  }),
  score: z
    .number()
    .min(0, '점수는 0 이상이어야 합니다')
    .max(100, '점수는 100 이하여야 합니다'),
  examDate: z.string().min(1, '시험일자는 필수입니다'),
})

/**
 * 목표 데이터 스키마
 */
export const goalSchema = z.object({
  studentName: z.string().min(1, '학생명은 필수입니다'),
  title: z.string().min(1, '목표제목은 필수입니다').max(100, '목표제목은 100자 이하여야 합니다'),
  currentScore: z
    .number()
    .min(0, '현재점수는 0 이상이어야 합니다')
    .max(100, '현재점수는 100 이하여야 합니다'),
  targetScore: z
    .number()
    .min(0, '목표점수는 0 이상이어야 합니다')
    .max(100, '목표점수는 100 이하여야 합니다'),
  deadline: z.string().min(1, '마감일은 필수입니다'),
})

// 타입은 types.ts에서 export됨 (StudentData, GradeData, GoalData)

/**
 * 데이터 검증 결과
 */
export interface ValidationResult<T> {
  valid: T[]
  invalid: {
    row: number
    data: any
    errors: string[]
  }[]
}

/**
 * 데이터 배열 검증
 */
export function validateData<T>(
  data: unknown[],
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  const results: ValidationResult<T> = {
    valid: [],
    invalid: [],
  }

  data.forEach((row, index) => {
    const result = schema.safeParse(row)

    if (result.success) {
      results.valid.push(result.data)
    } else {
      results.invalid.push({
        row: index + 2, // Excel 행 번호 (헤더 포함, 1-based)
        data: row,
        errors: result.error.errors.map((e) => {
          const path = e.path.join('.')
          return path ? `${path}: ${e.message}` : e.message
        }),
      })
    }
  })

  return results
}

/**
 * 스키마 타입 가져오기
 */
export function getSchemaByType(type: 'students' | 'grades' | 'goals') {
  switch (type) {
    case 'students':
      return studentSchema
    case 'grades':
      return gradeSchema
    case 'goals':
      return goalSchema
    default:
      throw new Error(`Unknown type: ${type}`)
  }
}
