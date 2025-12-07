'use client'

import { Button } from '@/components/ui/button'
import { Download, FileSpreadsheet, Info } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface TemplateInfo {
  type: 'students' | 'grades' | 'goals'
  label: string
  description: string
  icon: string
}

const TEMPLATES: TemplateInfo[] = [
  {
    type: 'students',
    label: '학생 정보 템플릿',
    description: '이름, 학년, 연락처 등 학생 기본 정보',
    icon: '👨‍🎓',
  },
  {
    type: 'grades',
    label: '성적 정보 템플릿',
    description: '과목별 시험 성적 및 점수',
    icon: '📊',
  },
  {
    type: 'goals',
    label: '목표 정보 템플릿',
    description: '학습 목표 및 달성 계획',
    icon: '🎯',
  },
]

export function TemplateDownload() {
  const downloadTemplate = async (type: string) => {
    try {
      const response = await fetch(`/api/templates/${type}`)

      if (!response.ok) {
        throw new Error('템플릿 다운로드 실패')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}_template.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('템플릿 다운로드 완료')
    } catch (error) {
      console.error('Template download error:', error)
      toast.error('템플릿 다운로드 중 오류가 발생했습니다')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          엑셀 템플릿 다운로드
        </CardTitle>
        <CardDescription>
          아래 템플릿을 다운로드하여 데이터를 입력한 후 업로드하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {TEMPLATES.map((template, index) => (
          <div key={template.type}>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3"
              onClick={() => downloadTemplate(template.type)}
            >
              <div className="flex items-start gap-3 w-full">
                <span className="text-2xl">{template.icon}</span>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{template.label}</span>
                    <Download className="h-4 w-4" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                </div>
              </div>
            </Button>
            {index < TEMPLATES.length - 1 && <Separator className="my-3" />}
          </div>
        ))}

        <Separator className="my-4" />

        {/* 안내사항 */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="font-medium text-sm text-blue-800 dark:text-blue-200">
                템플릿 사용 안내
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• 템플릿의 헤더(첫 번째 행)는 수정하지 마세요</li>
                <li>• 필수 항목은 반드시 입력해야 합니다</li>
                <li>• 예시 데이터를 참고하여 형식에 맞게 작성하세요</li>
                <li>• 작성 완료 후 .xlsx 또는 .xls 형식으로 저장하세요</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
