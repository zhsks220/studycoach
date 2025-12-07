'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-8 w-8" />
            목표 관리
          </h1>
          <p className="text-muted-foreground mt-2">학생들의 학습 목표를 관리하세요</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          목표 추가
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>목표 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">아직 등록된 목표가 없습니다</p>
            <p className="text-sm mt-2">
              상단의 "목표 추가" 버튼을 클릭하거나 데이터 업로드 메뉴에서 엑셀 파일로 일괄 등록하세요
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
