/**
 * 엑셀 템플릿 생성 로직
 */

import * as XLSX from 'xlsx'

/**
 * 학생 정보 템플릿 데이터
 */
const STUDENT_TEMPLATE = [
  ['이름', '학년', '반', '연락처', '부모연락처', '주소'],
  ['김철수', 3, 1, '010-1234-5678', '010-9876-5432', '서울시 강남구 테헤란로 123'],
  [
    '이영희',
    2,
    2,
    '010-2345-6789',
    '010-8765-4321',
    '서울시 서초구 서초대로 456',
  ],
  ['박민수', 1, 1, '010-3456-7890', '010-7654-3210', '경기도 성남시 분당구 판교역로 789'],
]

/**
 * 성적 정보 템플릿 데이터
 */
const GRADE_TEMPLATE = [
  ['학생명', '과목', '학기', '시험종류', '점수', '시험일자'],
  ['김철수', '수학', '2025-1학기', '중간고사', 85, '2025-05-15'],
  ['김철수', '영어', '2025-1학기', '중간고사', 90, '2025-05-15'],
  ['김철수', '국어', '2025-1학기', '중간고사', 88, '2025-05-15'],
  ['이영희', '수학', '2025-1학기', '중간고사', 92, '2025-05-15'],
  ['이영희', '영어', '2025-1학기', '중간고사', 87, '2025-05-15'],
  ['박민수', '과학', '2025-1학기', '중간고사', 78, '2025-05-15'],
]

/**
 * 목표 정보 템플릿 데이터
 */
const GOAL_TEMPLATE = [
  ['학생명', '목표제목', '현재점수', '목표점수', '마감일'],
  ['김철수', '수학 성적 90점 달성', 75, 90, '2025-06-30'],
  ['이영희', '영어 성적 95점 이상 유지', 87, 95, '2025-07-15'],
  ['박민수', '과학 성적 80점 이상', 65, 80, '2025-08-31'],
]

/**
 * 템플릿 타입별 데이터 매핑
 */
const TEMPLATES = {
  students: STUDENT_TEMPLATE,
  grades: GRADE_TEMPLATE,
  goals: GOAL_TEMPLATE,
} as const

/**
 * 엑셀 템플릿 생성
 */
export function createExcelTemplate(type: keyof typeof TEMPLATES): Buffer {
  const templateData = TEMPLATES[type]

  // 워크시트 생성
  const worksheet = XLSX.utils.aoa_to_sheet(templateData)

  // 컬럼 너비 설정
  const columnWidths = templateData[0].map((_, colIndex) => {
    const maxLength = Math.max(
      ...templateData.map((row) => {
        const cell = row[colIndex]
        return cell ? String(cell).length : 0
      })
    )
    return { wch: Math.max(maxLength + 2, 10) }
  })
  worksheet['!cols'] = columnWidths

  // 워크북 생성
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

  // Buffer로 변환
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  return buffer
}

/**
 * 템플릿 파일명 생성
 */
export function getTemplateFileName(type: keyof typeof TEMPLATES): string {
  const fileNames = {
    students: '학생정보_템플릿.xlsx',
    grades: '성적정보_템플릿.xlsx',
    goals: '목표정보_템플릿.xlsx',
  }

  return fileNames[type]
}

/**
 * 템플릿 설명 가져오기
 */
export function getTemplateDescription(type: keyof typeof TEMPLATES): string {
  const descriptions = {
    students:
      '학생의 기본 정보를 입력하는 템플릿입니다. 이름과 학년은 필수 항목입니다.',
    grades:
      '학생의 성적 정보를 입력하는 템플릿입니다. 학생명, 과목, 점수는 필수 항목입니다.',
    goals:
      '학생의 학습 목표를 입력하는 템플릿입니다. 학생명, 목표제목, 목표점수는 필수 항목입니다.',
  }

  return descriptions[type]
}

/**
 * 모든 템플릿 타입 목록
 */
export const TEMPLATE_TYPES = ['students', 'grades', 'goals'] as const

/**
 * 템플릿 정보 타입
 */
export interface TemplateInfo {
  type: keyof typeof TEMPLATES
  name: string
  description: string
  fileName: string
}

/**
 * 모든 템플릿 정보 가져오기
 */
export function getAllTemplateInfo(): TemplateInfo[] {
  return TEMPLATE_TYPES.map((type) => ({
    type,
    name: type === 'students' ? '학생 정보' : type === 'grades' ? '성적 정보' : '목표 정보',
    description: getTemplateDescription(type),
    fileName: getTemplateFileName(type),
  }))
}
