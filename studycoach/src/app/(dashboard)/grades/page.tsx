'use client'

import { useState } from 'react'
import { useGrades } from '@/hooks/useGrades'
import { useStudents } from '@/hooks/useStudents'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Plus, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { GradeFormDialog } from '@/components/forms/grade-form-dialog'

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">성적 관리</h1>
          <p className="text-gray-600 mt-2">학생들의 시험 성적을 관리합니다</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          성적 입력
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            성적 기록
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <Select value={studentFilter} onValueChange={setStudentFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="학생 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 학생</SelectItem>
                {students?.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name} ({student.grade})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="과목 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 과목</SelectItem>
                <SelectItem value="수학">수학</SelectItem>
                <SelectItem value="영어">영어</SelectItem>
                <SelectItem value="국어">국어</SelectItem>
                <SelectItem value="과학">과학</SelectItem>
                <SelectItem value="사회">사회</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">로딩 중...</div>
            </div>
          ) : grades && grades.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>학생</TableHead>
                    <TableHead>시험명</TableHead>
                    <TableHead>과목</TableHead>
                    <TableHead>점수</TableHead>
                    <TableHead>시험 유형</TableHead>
                    <TableHead>시험 날짜</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade) => (
                    <TableRow key={grade.id}>
                      <TableCell className="font-medium">
                        {grade.student?.name}
                        <div className="text-xs text-gray-500">{grade.student?.grade}</div>
                      </TableCell>
                      <TableCell>{grade.examName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{grade.subject}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`text-lg font-bold ${getScoreColor(grade.score)}`}>
                          {grade.score}점
                        </span>
                        <span className="text-sm text-gray-500 ml-1">/ {grade.maxScore}점</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{grade.examType}</Badge>
                      </TableCell>
                      <TableCell>{format(new Date(grade.examDate), 'yyyy.MM.dd')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">등록된 성적이 없습니다</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                첫 성적 입력하기
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <GradeFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  )
}
