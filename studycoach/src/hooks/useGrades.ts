import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface Grade {
  id: string
  examName: string
  examDate: Date
  examType: string
  subject: string
  score: number
  maxScore: number
  studentId: string
  memo?: string | null
  student?: {
    id: string
    name: string
    grade: string
  }
}

interface CreateGradeData {
  studentId: string
  examName: string
  examDate: string
  examType: string
  subject: string
  score: number
  maxScore?: number
  memo?: string
}

export function useGrades(filters?: { studentId?: string; subject?: string }) {
  const queryParams = new URLSearchParams()
  if (filters?.studentId) queryParams.append('studentId', filters.studentId)
  if (filters?.subject) queryParams.append('subject', filters.subject)

  return useQuery({
    queryKey: ['grades', filters],
    queryFn: async () => {
      const response = await fetch(`/api/grades?${queryParams}`)
      if (!response.ok) throw new Error('성적 목록을 불러오지 못했습니다')
      return response.json() as Promise<Grade[]>
    },
  })
}

export function useCreateGrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateGradeData) => {
      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '성적 등록에 실패했습니다')
      }
      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['grades'] })
      queryClient.invalidateQueries({ queryKey: ['students', variables.studentId] })
      toast.success('성적이 등록되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
