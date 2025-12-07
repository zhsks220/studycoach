import { NextRequest, NextResponse } from 'next/server'
import { createExcelTemplate, getTemplateFileName } from '@/lib/excel'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params

    // 유효한 타입인지 확인
    if (!['students', 'grades', 'goals'].includes(type)) {
      return NextResponse.json(
        { error: '유효하지 않은 템플릿 타입입니다' },
        { status: 400 }
      )
    }

    // 템플릿 생성
    const buffer = createExcelTemplate(type as 'students' | 'grades' | 'goals')
    const fileName = getTemplateFileName(type as 'students' | 'grades' | 'goals')

    // 응답 반환 (Buffer를 Uint8Array로 변환)
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Template download error:', error)
    return NextResponse.json(
      { error: '템플릿 다운로드 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
