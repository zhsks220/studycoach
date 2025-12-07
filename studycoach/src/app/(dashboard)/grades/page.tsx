'use client'

import { useState } from 'react'
import { useGrades } from '@/hooks/useGrades'
import { useStudents } from '@/hooks/useStudents'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Search, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { GradeFormDialog } from '@/components/forms/grade-form-dialog'
import { motion, AnimatePresence } from 'framer-motion'

export default function GradesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [studentFilter, setStudentFilter] = useState<string>('')
  const [subjectFilter, setSubjectFilter] = useState<string>('')

  const { data: students } = useStudents()
  const { data: grades, isLoading } = useGrades({
    studentId: studentFilter || undefined,
    subject: subjectFilter || undefined,
  })

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 h-full flex flex-col"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">성적 관리</h1>
          <p className="text-muted-foreground mt-1">학생들의 시험 성적 데이터를 기록하고 관리합니다.</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          성적 입력
        </Button>
      </div>

      <Card className="flex-1 border-none shadow-none bg-transparent">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row items-center justify-between">
          <div className="flex items-center gap-2 flex-1 w-full sm:max-w-xl">
            <div className="relative flex-1 max-w-[200px]">
              <Select value={studentFilter} onValueChange={setStudentFilter}>
                <SelectTrigger className="w-full bg-background border-border/60">
                  <SelectValue placeholder="모든 학생" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 학생</SelectItem>
                  {students?.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1 max-w-[150px]">
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-full bg-background border-border/60">
                  <SelectValue placeholder="모든 과목" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 과목</SelectItem>
                  <SelectItem value="수학">수학</SelectItem>
                  <SelectItem value="영어">영어</SelectItem>
                  <SelectItem value="국어">국어</SelectItem>
                  <SelectItem value="과학">과학</SelectItem>
                  <SelectItem value="사회">사회</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            총 <span className="font-medium text-foreground">{grades?.length || 0}</span>건
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-sm text-muted-foreground">데이터 불러오는 중...</span>
              </div>
            </div>
          ) : grades && grades.length > 0 ? (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead>학생 정보</TableHead>
                  <TableHead>시험명</TableHead>
                  <TableHead>과목</TableHead>
                  <TableHead>점수</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead>날짜</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {grades.map((grade, index) => (
                    <motion.tr
                      key={grade.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group border-b transition-colors hover:bg-muted/40"
                    >
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{grade.student?.name}</span>
                          <span className="text-xs text-muted-foreground">{grade.student?.grade}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{grade.examName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">{grade.subject}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-base font-bold ${getScoreColor(grade.score)}`}>
                            {grade.score}
                          </span>
                          <span className="text-xs text-muted-foreground">/ {grade.maxScore}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="opacity-80">{grade.examType}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(grade.examDate), 'yy.MM.dd')}
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="rounded-full bg-muted/50 p-4 mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">등록된 성적이 없습니다</h3>
              <p className="text-muted-foreground mt-1 mb-6 max-w-sm">
                학생들의 시험 성적을 등록하여 추이를 분석해보세요.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                첫 성적 입력하기
              </Button>
            </div>
          )}
        </div>
      </Card>

      <GradeFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </motion.div>
  )
}
