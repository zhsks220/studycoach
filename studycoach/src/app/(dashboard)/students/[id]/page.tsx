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
import { motion } from 'framer-motion'

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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
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
        <div className="animate-pulse text-muted-foreground/50">학생 정보를 불러오는 중...</div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">학생 정보를 찾을 수 없습니다</p>
        <Button variant="outline" onClick={() => router.push('/students')}>
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-muted" onClick={() => router.push('/students')}>
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{student.name}</h1>
            <p className="text-muted-foreground text-sm">학생 상세 리포트</p>
          </div>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-1.5 font-normal bg-background">
          {student.grade}
        </Badge>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-sm bg-muted/20">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border shadow-sm">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">연락처</p>
                    <p className="font-medium text-lg">{student.phone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border shadow-sm">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">생년월일</p>
                    <p className="font-medium text-lg">
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
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border shadow-sm">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">학부모 연락처</p>
                    <p className="font-medium text-lg">{student.parentPhone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border shadow-sm">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">주소</p>
                    <p className="font-medium text-lg">{student.address || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">평균 점수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <span className="text-3xl font-bold">{averageScore}점</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              총 {student.grades.length}개 시험 기록
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">진행중인 목표</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              <span className="text-3xl font-bold">{activeGoals}개</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              전체 {student.goals.length}개 목표
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">출석률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              <span className="text-3xl font-bold">{attendanceRate}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              총 {student.attendances.length}일 기록
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* 차트 섹션 */}
      {student.grades.length > 0 ? (
        <motion.div variants={itemVariants} className="space-y-6">
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
        </motion.div>
      ) : (
        <motion.div variants={itemVariants}>
          <Card className="border-dashed bg-muted/20 shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">아직 성적 기록이 없습니다</h3>
              <p className="text-muted-foreground text-sm">학생의 성적 데이터를 업로드하거나 추가해주세요</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Separator className="my-8" />

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">최근 성적 기록</h3>
            <Button variant="ghost" size="sm" className="text-xs h-8">전체보기</Button>
          </div>
          {student.grades.length > 0 ? (
            <div className="space-y-2">
              {student.grades.slice(0, 10).map((grade) => (
                <div
                  key={grade.id}
                  className="group flex items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm">
                      {grade.subject.substring(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium">{grade.examName}</p>
                      <p className="text-xs text-muted-foreground">
                        {grade.examType} • {format(new Date(grade.examDate), 'yyyy-MM-dd')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{grade.score}점</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">기록 없음</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">학습 목표</h3>
            <Button variant="ghost" size="sm" className="text-xs h-8">목표 관리</Button>
          </div>
          {student.goals.length > 0 ? (
            <div className="space-y-2">
              {student.goals.map((goal) => (
                <div key={goal.id} className="p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <p className="font-medium line-clamp-1">{goal.title}</p>
                    <Badge
                      variant={goal.status === 'IN_PROGRESS' ? 'default' : 'secondary'}
                      className="ml-2 whitespace-nowrap"
                    >
                      {goal.status === 'IN_PROGRESS' ? '진행중' : '완료'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium w-12 text-right">
                      {Math.round((goal.currentValue / goal.targetValue) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>{goal.currentValue} / {goal.targetValue}점</span>
                    <span>~{format(new Date(goal.deadline), 'yyyy-MM-dd')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">설정된 목표가 없습니다</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
