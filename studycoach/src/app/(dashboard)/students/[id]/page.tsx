'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  MapPin,
  Target,
  TrendingUp,
  BookOpen,
} from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { StudentAbilityRadar } from '@/components/charts/student-ability-radar'
import {
  GradeTrendChart,
  SubjectComparisonChart,
  ExamTypeChart,
} from '@/components/charts/grade-trend-chart'
import { calculateSubjectAbilities } from '@/lib/ability-calculator'

interface Student {
  id: string
  name: string
  grade: string
  phone?: string
  birthDate?: Date
  address?: string
  parentPhone?: string
  createdAt: Date
  grades: Array<{
    id: string
    subject: string
    score: number
    examType: string
    examName: string
    examDate: Date
  }>
  goals: Array<{
    id: string
    title: string
    currentValue: number
    targetValue: number
    deadline: Date
    status: string
  }>
  attendances: Array<{
    id: string
    date: Date
    status: string
  }>
}

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const { data: student, isLoading } = useQuery<Student>({
    queryKey: ['student', studentId],
    queryFn: async () => {
      const res = await fetch(`/api/students/${studentId}`)
      if (!res.ok) throw new Error('Failed to fetch student')
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-gray-500">학생 정보를 찾을 수 없습니다</p>
        <Button onClick={() => router.push('/students')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로 돌아가기
        </Button>
      </div>
    )
  }

  const abilityData = calculateSubjectAbilities(
    student.grades.map((g) => ({
      subject: g.subject,
      score: g.score,
      examType: g.examType,
      examDate: new Date(g.examDate),
    }))
  )

  const averageScore =
    student.grades.length > 0
      ? Math.round(
          student.grades.reduce((sum, g) => sum + g.score, 0) / student.grades.length
        )
      : 0

  const activeGoals = student.goals.filter((g) => g.status === 'IN_PROGRESS').length

  const attendanceRate =
    student.attendances.length > 0
      ? Math.round(
          (student.attendances.filter((a) => a.status === 'PRESENT').length /
            student.attendances.length) *
            100
        )
      : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/students')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{student.name}</h1>
            <p className="text-gray-600 mt-1">학생 상세 정보</p>
          </div>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-1">
          {student.grade}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            기본 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">연락처</p>
                  <p className="font-medium">{student.phone || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">생년월일</p>
                  <p className="font-medium">
                    {student.birthDate
                      ? format(new Date(student.birthDate), 'yyyy년 MM월 dd일', {
                          locale: ko,
                        })
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">학부모 연락처</p>
                  <p className="font-medium">{student.parentPhone || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">주소</p>
                  <p className="font-medium">{student.address || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">평균 점수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <span className="text-3xl font-bold">{averageScore}점</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              총 {student.grades.length}개 시험 기록
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">진행중인 목표</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              <span className="text-3xl font-bold">{activeGoals}개</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              전체 {student.goals.length}개 목표
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">출석률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              <span className="text-3xl font-bold">{attendanceRate}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              총 {student.attendances.length}일 기록
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 차트 섹션 */}
      {student.grades.length > 0 ? (
        <>
          {/* 첫 번째 행: 육각형 차트 */}
          <StudentAbilityRadar
            data={abilityData}
            title="과목별 능력치 분석"
            description="전체 시험 기록을 기반으로 한 과목별 평균 점수"
          />

          {/* 두 번째 행: 성적 추이 + 과목별 평균 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GradeTrendChart
              grades={student.grades}
              title="최근 성적 추이"
              description="최근 10개 시험의 점수 변화"
            />
            <SubjectComparisonChart
              grades={student.grades}
              title="과목별 평균 점수"
              description="과목별 전체 평균 비교"
            />
          </div>

          {/* 세 번째 행: 시험 유형별 평균 */}
          <ExamTypeChart
            grades={student.grades}
            title="시험 유형별 평균 점수"
            description="정기고사, 모의고사 등 유형별 성적 분석"
          />
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">아직 성적 기록이 없습니다</p>
          </CardContent>
        </Card>
      )}

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>최근 성적 기록</CardTitle>
        </CardHeader>
        <CardContent>
          {student.grades.length > 0 ? (
            <div className="space-y-3">
              {student.grades.slice(0, 10).map((grade) => (
                <div
                  key={grade.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{grade.subject}</p>
                    <p className="text-sm text-gray-500">
                      {grade.examName} ({grade.examType})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{grade.score}점</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(grade.examDate), 'yyyy-MM-dd')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">성적 기록이 없습니다</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>학습 목표</CardTitle>
        </CardHeader>
        <CardContent>
          {student.goals.length > 0 ? (
            <div className="space-y-3">
              {student.goals.map((goal) => (
                <div key={goal.id} className="p-3 rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium">{goal.title}</p>
                    <Badge
                      variant={goal.status === 'IN_PROGRESS' ? 'default' : 'secondary'}
                    >
                      {goal.status === 'IN_PROGRESS' ? '진행중' : '완료'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">
                      현재: {goal.currentValue}점
                    </span>
                    <span className="text-gray-500">→</span>
                    <span className="text-blue-600 font-medium">
                      목표: {goal.targetValue}점
                    </span>
                    <span className="text-gray-500 ml-auto">
                      {format(new Date(goal.deadline), 'yyyy-MM-dd까지')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">설정된 목표가 없습니다</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
