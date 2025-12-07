'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useStudents, useDeleteStudent } from '@/hooks/useStudents'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Eye, Pencil, Trash2, Users, MoreHorizontal, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { StudentFormDialog } from '@/components/forms/student-form-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function StudentsPage() {
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState<string>('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [deleteStudentId, setDeleteStudentId] = useState<string | null>(null)

  const { data: students, isLoading } = useStudents({ search, grade: gradeFilter || undefined })
  const deleteStudent = useDeleteStudent()

  const handleDelete = async () => {
    if (deleteStudentId) {
      await deleteStudent.mutateAsync(deleteStudentId)
      setDeleteStudentId(null)
    }
  }

  const getInitials = (name: string) => {
    return name.slice(0, 2)
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
          <h1 className="text-3xl font-bold tracking-tight">지식 관리</h1>
          <p className="text-muted-foreground mt-1">학생들의 학습 데이터를 통합 관리합니다.</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          학생 추가
        </Button>
      </div>

      <Card className="flex-1 border-none shadow-none bg-transparent">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row items-center justify-between">
          <div className="flex items-center gap-2 flex-1 w-full sm:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="이름으로 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-background border-border/60 focus-visible:ring-primary/20"
              />
            </div>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-[130px] bg-background border-border/60">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="학년" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 학년</SelectItem>
                <SelectItem value="중1">중1</SelectItem>
                <SelectItem value="중2">중2</SelectItem>
                <SelectItem value="중3">중3</SelectItem>
                <SelectItem value="고1">고1</SelectItem>
                <SelectItem value="고2">고2</SelectItem>
                <SelectItem value="고3">고3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            총 <span className="font-medium text-foreground">{students?.length || 0}</span>명
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
          ) : students && students.length > 0 ? (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[250px]">학생 정보</TableHead>
                  <TableHead>학년</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead>성적</TableHead>
                  <TableHead>목표</TableHead>
                  <TableHead>출석</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {students.map((student, index) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group border-b transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border/50">
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-medium">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold">{student.name}</span>
                            <span className="text-xs text-muted-foreground">ID: {student.id.slice(0, 6)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal opacity-80 group-hover:opacity-100 transition-opacity">
                          {student.grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {student.phone || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <div className={`h-2 w-2 rounded-full ${(student._count?.grades || 0) > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-sm">{student._count?.grades || 0}건</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{student._count?.goals || 0}개</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{student._count?.attendances || 0}일</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>작업</DropdownMenuLabel>
                            <Link href={`/students/${student.id}`}>
                              <DropdownMenuItem className='cursor-pointer'>
                                <Eye className="mr-2 h-4 w-4" /> 상세 보기
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 cursor-pointer"
                              onClick={() => setDeleteStudentId(student.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> 삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="rounded-full bg-muted/50 p-4 mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">등록된 학생이 없습니다</h3>
              <p className="text-muted-foreground mt-1 mb-6 max-w-sm">
                새로운 학생을 등록하여 학습 관리 및 성적 분석을 시작해보세요.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                첫 학생 추가하기
              </Button>
            </div>
          )}
        </div>
      </Card>

      <StudentFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <AlertDialog open={!!deleteStudentId} onOpenChange={() => setDeleteStudentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>학생 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 학생을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 관련된 모든 성적, 목표, 출석 기록도 함께 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
