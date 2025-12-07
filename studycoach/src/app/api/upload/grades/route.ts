import { NextRequest, NextResponse } from 'next/server'
import { parseExcelFile, mapExcelData, validateData, gradeSchema } from '@/lib/excel'
import { createStudentNameToIdMap, mapGradeToPrisma } from '@/lib/excel/mapper'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // FormData에서 파일 추출
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다' }, { status: 400 })
    }

    // 1. 엑셀 파일 파싱
    console.log('Parsing Excel file...')
    const parseResult = await parseExcelFile(file, 'grades')

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: '파일 파싱 중 오류가 발생했습니다',
          parseErrors: parseResult.errors,
        },
        { status: 400 }
      )
    }

    // 2. 한글 컬럼명을 영문 필드명으로 변환
    console.log('Mapping Excel data...')
    const mappedData = mapExcelData(parseResult.data, 'grades')

    // 3. 데이터 검증
    console.log('Validating data...')
    const validationResult = validateData(mappedData, gradeSchema)

    // 검증 실패한 데이터가 있으면 미리보기 반환
    if (validationResult.invalid.length > 0) {
      return NextResponse.json(
        {
          success: false,
          preview: true,
          data: {
            valid: validationResult.valid,
            invalid: validationResult.invalid,
            totalRows: parseResult.totalRows,
            validRows: validationResult.valid.length,
          },
        },
        { status: 200 }
      )
    }

    // 4. 학생 이름으로 학생 ID 매핑
    console.log('Mapping student names to IDs...')
    const studentNames = [...new Set(validationResult.valid.map((g) => g.studentName))]
    const studentMap = await createStudentNameToIdMap(prisma, studentNames)

    // 학생을 찾지 못한 경우 에러 처리
    const missingStudents = studentNames.filter((name) => !studentMap.has(name))
    if (missingStudents.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: '등록되지 않은 학생이 있습니다',
          missingStudents,
        },
        { status: 400 }
      )
    }

    // 5. DB에 저장 (트랜잭션)
    console.log(`Saving ${validationResult.valid.length} grades to database...`)
    const createdGrades = await prisma.$transaction(
      validationResult.valid.map((grade) => {
        const studentId = studentMap.get(grade.studentName)!
        return prisma.grade.create({
          data: mapGradeToPrisma(grade, studentId),
        })
      })
    )

    console.log(`Successfully created ${createdGrades.length} grades`)

    return NextResponse.json({
      success: true,
      data: {
        created: createdGrades.length,
        total: parseResult.totalRows,
        validRows: validationResult.valid.length,
        grades: createdGrades,
      },
    })
  } catch (error) {
    console.error('Grade upload error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '업로드 처리 중 오류가 발생했습니다',
      },
      { status: 500 }
    )
  }
}
