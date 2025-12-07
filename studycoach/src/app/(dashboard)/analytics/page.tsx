'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart3, TrendingUp, Users, BookOpen, Target, Award, Calendar } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Area,
  AreaChart,
} from 'recharts'

interface AnalyticsData {
  totalStudents: number
  totalGrades: number
  averageScore: number
  activeGoals: number
  attendanceRate: number
  topPerformers: {
    id: string
    name: string
    averageScore: number
  }[]
  subjectPerformance: {
    subject: string
    averageScore: number
    count: number
  }[]
  recentTrends: {
    month: string
    averageScore: number
  }[]
  gradeDistribution: {
    range: string
    count: number
  }[]
  monthlyAttendance: {
    month: string
    attendanceRate: number
  }[]
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
        <p className="font-medium text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

async function fetchAnalytics(): Promise<AnalyticsData> {
  const response = await fetch('/api/analytics')
  if (!response.ok) {
    throw new Error('Failed to fetch analytics')
  }
  return response.json()
}

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">분석 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">분석 대시보드</h1>
          <p className="text-muted-foreground">학생 성과 및 통계 데이터 시각화</p>
        </div>
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 학생</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalStudents || 0}명</div>
            <p className="text-xs text-muted-foreground mt-1">등록된 학생 수</p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>전월 대비 +12%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 점수</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.averageScore ? analytics.averageScore.toFixed(1) : '0.0'}점
            </div>
            <p className="text-xs text-muted-foreground mt-1">전체 학생 평균</p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>전월 대비 +2.3점</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 목표</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.activeGoals || 0}개</div>
            <p className="text-xs text-muted-foreground mt-1">진행 중인 목표</p>
            <div className="mt-2 flex items-center text-xs text-blue-600">
              <Target className="h-3 w-3 mr-1" />
              <span>목표 달성률 78%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">출석률</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.attendanceRate ? analytics.attendanceRate.toFixed(1) : '0.0'}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">최근 30일 기준</p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>전월 대비 +5.2%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 성적 추세 라인 차트 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            월별 성적 추세
          </CardTitle>
          <CardDescription>최근 6개월간 평균 점수 변화</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics?.recentTrends && analytics.recentTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.recentTrends}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="averageScore"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorScore)"
                  name="평균 점수"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p>추세 데이터가 없습니다</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* 과목별 성적 바 차트 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              과목별 평균 점수
            </CardTitle>
            <CardDescription>각 과목의 전체 평균 점수</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.subjectPerformance && analytics.subjectPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.subjectPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" domain={[0, 100]} className="text-xs" />
                  <YAxis
                    dataKey="subject"
                    type="category"
                    width={80}
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="averageScore" name="평균 점수" radius={[0, 8, 8, 0]}>
                    {analytics.subjectPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <p>과목별 데이터가 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 성적 분포 파이 차트 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              성적 등급 분포
            </CardTitle>
            <CardDescription>학생들의 성적 분포 현황</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.gradeDistribution && analytics.gradeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.gradeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, percent }) =>
                      `${range}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <p>성적 분포 데이터가 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* 성적 우수 학생 - 바 차트로 변경 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              성적 우수 학생 Top 5
            </CardTitle>
            <CardDescription>평균 점수 기준 상위 5명</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.topPerformers && analytics.topPerformers.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.topPerformers} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="name"
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis domain={[0, 100]} className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="averageScore"
                    name="평균 점수"
                    fill="#f59e0b"
                    radius={[8, 8, 0, 0]}
                  >
                    {analytics.topPerformers.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === 0
                            ? '#f59e0b'
                            : index === 1
                            ? '#94a3b8'
                            : index === 2
                            ? '#fb923c'
                            : '#3b82f6'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <p>성적 데이터가 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 출석률 추세 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              월별 출석률 추세
            </CardTitle>
            <CardDescription>최근 6개월간 출석률 변화</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.monthlyAttendance && analytics.monthlyAttendance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.monthlyAttendance}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="attendanceRate"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 5 }}
                    activeDot={{ r: 8 }}
                    name="출석률"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <p>출석 데이터가 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 과목별 레이더 차트 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            과목별 성과 레이더
          </CardTitle>
          <CardDescription>과목별 종합 성과 분석</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics?.subjectPerformance && analytics.subjectPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={analytics.subjectPerformance}>
                <PolarGrid className="stroke-muted" />
                <PolarAngleAxis
                  dataKey="subject"
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} className="text-xs" />
                <Radar
                  name="평균 점수"
                  dataKey="averageScore"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.5}
                  strokeWidth={2}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p>과목별 데이터가 없습니다</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
