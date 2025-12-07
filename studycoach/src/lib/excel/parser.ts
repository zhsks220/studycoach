/**
 * 엑셀 파일 파싱 라이브러리
 */

import * as XLSX from 'xlsx'
import {
  DataType,
  ExcelParseResult,
  ParseError,
  StudentExcelData,
  GradeExcelData,
  GoalExcelData,
} from './types'

/**
 * 엑셀 파일을 읽어서 JSON 데이터로 변환
 */
export async function parseExcelFile<T = any>(
  file: File,
  type: DataType
): Promise<ExcelParseResult<T>> {
  try {
    // 파일을 ArrayBuffer로 읽기
    const arrayBuffer = await file.arrayBuffer()

    // XLSX로 워크북 파싱
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })

    // 첫 번째 시트 가져오기
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]

    // JSON으로 변환
    const jsonData = XLSX.utils.sheet_to_json<T>(worksheet, {
      header: 1,
      defval: null,
      blankrows: false,
    })

    // 헤더 행 제거 및 데이터 가공
    const headers = jsonData[0] as any[]
    const rows = jsonData.slice(1) as any[]

    // 헤더를 키로 하는 객체 배열로 변환
    const data = rows
      .filter((row) => row.some((cell: any) => cell !== null && cell !== ''))
      .map((row) => {
        const obj: any = {}
        headers.forEach((header, index) => {
          if (header) {
            obj[header] = row[index] ?? null
          }
        })
        return obj
      })

    // 기본 검증
    const errors: ParseError[] = []
    const validatedData: T[] = []

    data.forEach((row, index) => {
      const rowNumber = index + 2 // Excel 행 번호 (헤더 제외)
      const rowErrors = validateRow(row, type, rowNumber)

      if (rowErrors.length > 0) {
        errors.push(...rowErrors)
      } else {
        validatedData.push(row)
      }
    })

    return {
      data: validatedData,
      errors,
      warnings: [],
      totalRows: data.length,
      validRows: validatedData.length,
    }
  } catch (error) {
    console.error('Excel parsing error:', error)
    throw new Error('엑셀 파일 파싱 중 오류가 발생했습니다')
  }
}

/**
 * 행 데이터 기본 검증
 */
function validateRow(row: any, type: DataType, rowNumber: number): ParseError[] {
  const errors: ParseError[] = []

  switch (type) {
    case 'students':
      if (!row['이름'] || typeof row['이름'] !== 'string') {
        errors.push({
          row: rowNumber,
          field: '이름',
          message: '이름은 필수 항목입니다',
          value: row['이름'],
        })
      }
      if (!row['학년'] || typeof row['학년'] !== 'number') {
        errors.push({
          row: rowNumber,
          field: '학년',
          message: '학년은 숫자로 입력해야 합니다',
          value: row['학년'],
        })
      }
      break

    case 'grades':
      if (!row['학생명']) {
        errors.push({
          row: rowNumber,
          field: '학생명',
          message: '학생명은 필수 항목입니다',
          value: row['학생명'],
        })
      }
      if (!row['과목']) {
        errors.push({
          row: rowNumber,
          field: '과목',
          message: '과목은 필수 항목입니다',
          value: row['과목'],
        })
      }
      if (typeof row['점수'] !== 'number' || row['점수'] < 0 || row['점수'] > 100) {
        errors.push({
          row: rowNumber,
          field: '점수',
          message: '점수는 0~100 사이의 숫자여야 합니다',
          value: row['점수'],
        })
      }
      break

    case 'goals':
      if (!row['학생명']) {
        errors.push({
          row: rowNumber,
          field: '학생명',
          message: '학생명은 필수 항목입니다',
          value: row['학생명'],
        })
      }
      if (!row['목표제목']) {
        errors.push({
          row: rowNumber,
          field: '목표제목',
          message: '목표제목은 필수 항목입니다',
          value: row['목표제목'],
        })
      }
      if (
        typeof row['목표점수'] !== 'number' ||
        row['목표점수'] < 0 ||
        row['목표점수'] > 100
      ) {
        errors.push({
          row: rowNumber,
          field: '목표점수',
          message: '목표점수는 0~100 사이의 숫자여야 합니다',
          value: row['목표점수'],
        })
      }
      break
  }

  return errors
}

/**
 * 컬럼명 매핑
 */
export const COLUMN_MAPPINGS = {
  students: {
    이름: 'name',
    학년: 'grade',
    반: 'class',
    연락처: 'phone',
    부모연락처: 'parentPhone',
    주소: 'address',
  },
  grades: {
    학생명: 'studentName',
    과목: 'subject',
    학기: 'semester',
    시험종류: 'examType',
    점수: 'score',
    시험일자: 'examDate',
  },
  goals: {
    학생명: 'studentName',
    목표제목: 'title',
    현재점수: 'currentScore',
    목표점수: 'targetScore',
    마감일: 'deadline',
  },
} as const

/**
 * 엑셀 데이터를 영문 필드명으로 변환
 */
export function mapExcelData<T = any>(data: any[], type: DataType): T[] {
  const mapping = COLUMN_MAPPINGS[type]

  return data.map((row) => {
    const mapped: any = {}
    Object.entries(mapping).forEach(([koreanKey, englishKey]) => {
      if (row[koreanKey] !== undefined && row[koreanKey] !== null) {
        mapped[englishKey] = row[koreanKey]
      }
    })
    return mapped as T
  })
}
