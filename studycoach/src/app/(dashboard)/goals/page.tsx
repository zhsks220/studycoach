'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export default function GoalsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 flex flex-col h-full"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">목표 관리</h1>
          <p className="text-muted-foreground mt-1">학생들의 학습 목표 달성을 추적합니다.</p>
        </div>
        <Button className="shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          목표 추가
        </Button>
      </div>

      <Card className="flex-1 border-dashed border-2 shadow-none flex items-center justify-center bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center text-center p-12">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Target className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold">아직 등록된 목표가 없습니다</h3>
          <p className="text-muted-foreground mt-1 max-w-sm mb-6">
            새로운 목표를 설정하고 달성률을 확인해보세요.<br />
            전체 목표 설정 또는 학생별 목표를 할당할 수 있습니다.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            첫 목표 만들기
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
