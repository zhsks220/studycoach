'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateGrade } from '@/hooks/useGrades'
import { useStudents } from '@/hooks/useStudents'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const formSchema = z.object({
  studentId: z.string().min(1, '학생을 선택해주세요'),
  examName: z.string().min(1, '시험명을 입력해주세요'),
  examDate: z.string().min(1, '시험 날짜를 선택해주세요'),
  examType: z.string().min(1, '시험 유형을 선택해주세요'),
  subject: z.string().min(1, '과목을 선택해주세요'),
  score: z.string().min(1, '점수를 입력해주세요'),
  maxScore: z.string().optional(),
  memo: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface GradeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GradeFormDialog({ open, onOpenChange }: GradeFormDialogProps) {
  const createGrade = useCreateGrade()
  const { data: students } = useStudents()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: '',
      examName: '',
      examDate: '',
      examType: '정기고사',
      subject: '',
      score: '',
      maxScore: '100',
      memo: '',
    },
  })

  const onSubmit = async (data: FormValues) => {
    await createGrade.mutateAsync({
      studentId: data.studentId,
      examName: data.examName,
      examDate: data.examDate,
      examType: data.examType,
      subject: data.subject,
      score: parseFloat(data.score),
      maxScore: data.maxScore ? parseFloat(data.maxScore) : 100,
      memo: data.memo,
    })
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>성적 입력</DialogTitle>
          <DialogDescription>학생의 시험 성적을 입력해주세요</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>학생 *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="학생 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students?.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.grade})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="examName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시험명 *</FormLabel>
                    <FormControl>
                      <Input placeholder="1학기 중간고사" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="examType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시험 유형 *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="정기고사">정기고사</SelectItem>
                        <SelectItem value="모의고사">모의고사</SelectItem>
                        <SelectItem value="수행평가">수행평가</SelectItem>
                        <SelectItem value="단원평가">단원평가</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>과목 *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="과목 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="수학">수학</SelectItem>
                        <SelectItem value="영어">영어</SelectItem>
                        <SelectItem value="국어">국어</SelectItem>
                        <SelectItem value="과학">과학</SelectItem>
                        <SelectItem value="사회">사회</SelectItem>
                        <SelectItem value="역사">역사</SelectItem>
                        <SelectItem value="도덕">도덕</SelectItem>
                        <SelectItem value="기술가정">기술가정</SelectItem>
                        <SelectItem value="체육">체육</SelectItem>
                        <SelectItem value="음악">음악</SelectItem>
                        <SelectItem value="미술">미술</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="examDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시험 날짜 *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>점수 *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" placeholder="85" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>만점</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="memo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>메모</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="특이사항이나 메모를 입력하세요"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  onOpenChange(false)
                }}
              >
                취소
              </Button>
              <Button type="submit" disabled={createGrade.isPending}>
                {createGrade.isPending ? '입력 중...' : '입력'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
