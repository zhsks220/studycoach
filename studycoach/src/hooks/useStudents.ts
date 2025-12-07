import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface Student {
  id: string
  name: string
  grade: string
  birthDate?: Date | null
  phone?: string | null
  notes?: string | null
  academyId: string
  createdAt: Date
  updatedAt: Date
  _count?: {
    grades: number
    goals: number
    attendances: number
  }
}

interface CreateStudentData {
  name: string
  grade: string
  birthDate?: string
  phone?: string
  notes?: string
}

interface UpdateStudentData extends Partial<CreateStudentData> {}

export function useStudents(filters?: { search?: string; grade?: string }) {
  const queryParams = new URLSearchParams()
  if (filters?.search) queryParams.append('search', filters.search)
  if (filters?.grade) queryParams.append('grade', filters.grade)

  return useQuery({
    queryKey: ['students', filters],
    queryFn: async () => {
      const response = await fetch(`/api/students?${queryParams}`)
      if (!response.ok) throw new Error('학생 목록을 불러오지 못했습니다')
      return response.json() as Promise<Student[]>
    },
  })
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: ['students', id],
    queryFn: async () => {
      const response = await fetch(`/api/students/${id}`)
      if (!response.ok) throw new Error('학생 정보를 불러오지 못했습니다')
      return response.json() as Promise<Student>
    },
    enabled: !!id,
  })
}

export function useCreateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateStudentData) => {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '학생 등록에 실패했습니다')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      toast.success('학생이 등록되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateStudentData }) => {
      const response = await fetch(`/api/students/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '학생 정보 수정에 실패했습니다')
      }
      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['students', variables.id] })
      toast.success('학생 정보가 수정되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '학생 삭제에 실패했습니다')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      toast.success('학생이 삭제되었습니다')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
