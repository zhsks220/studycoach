import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, Target, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  // In a real app, these would come from your database
  const stats = [
    {
      title: '전체 학생',
      value: '5',
      icon: Users,
      description: '등록된 학생 수',
    },
    {
      title: '성적 기록',
      value: '125',
      icon: FileText,
      description: '입력된 성적 수',
    },
    {
      title: '활성 목표',
      value: '6',
      icon: Target,
      description: '진행 중인 목표',
    },
    {
      title: '평균 점수',
      value: '82.5',
      icon: TrendingUp,
      description: '전체 평균',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-gray-600 mt-2">학원 전체 현황을 한눈에 확인하세요</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">김철수 학생 성적 입력</p>
                  <p className="text-xs text-gray-500">2학기 중간고사 - 수학 85점</p>
                </div>
                <span className="text-xs text-gray-500">방금 전</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">이영희 목표 달성</p>
                  <p className="text-xs text-gray-500">과학 성적 10점 향상 완료</p>
                </div>
                <span className="text-xs text-gray-500">1시간 전</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">박민수 출석 체크</p>
                  <p className="text-xs text-gray-500">오늘 출석 완료</p>
                </div>
                <span className="text-xs text-gray-500">2시간 전</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>이번 주 목표</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">성적 입력 완료율</span>
                  <span className="text-sm text-gray-600">75%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: '75%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">출석률</span>
                  <span className="text-sm text-gray-600">92%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-green-600" style={{ width: '92%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">목표 달성률</span>
                  <span className="text-sm text-gray-600">60%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-yellow-600" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
