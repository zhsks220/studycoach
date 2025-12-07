'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, FileText, Target, TrendingUp, ArrowUpRight, ArrowDownRight, Minus, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface DashboardData {
    stats: {
        studentCount: number
        gradeCount: number
        goalCount: number
        averageScore: number
    }
    activities: Array<{
        type: 'grade' | 'goal' | 'attendance'
        title: string
        description: string
        createdAt: string
    }>
    metrics: {
        gradeInputRate: number
        attendanceRate: number
        goalAchievementRate: number
    }
}

async function fetchDashboardData(): Promise<DashboardData> {
    const res = await fetch('/api/dashboard')
    if (!res.ok) throw new Error('Failed to fetch dashboard data')
    return res.json()
}

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '방금 전'
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`
    return date.toLocaleDateString('ko-KR')
}

function getActivityColor(type: string): string {
    switch (type) {
        case 'grade': return 'bg-blue-500'
        case 'goal': return 'bg-green-500'
        case 'attendance': return 'bg-yellow-500'
        default: return 'bg-gray-500'
    }
}

export function OverviewView() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['dashboard'],
        queryFn: fetchDashboardData,
        refetchInterval: 30000, // 30초마다 자동 새로고침
    })

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    }

    const stats = data ? [
        {
            title: '전체 학생',
            value: data.stats.studentCount.toString(),
            icon: Users,
            description: '등록된 학생 수',
            change: '',
            trend: 'neutral' as const
        },
        {
            title: '입력된 성적',
            value: data.stats.gradeCount.toString(),
            icon: FileText,
            description: '총 성적 기록',
            change: '',
            trend: 'neutral' as const
        },
        {
            title: '진행 중 목표',
            value: data.stats.goalCount.toString(),
            icon: Target,
            description: '학생 목표 수',
            change: '',
            trend: 'neutral' as const
        },
        {
            title: '평균 점수',
            value: data.stats.averageScore.toFixed(1),
            icon: TrendingUp,
            description: '전체 평균',
            change: '',
            trend: 'up' as const
        },
    ] : []

    const metrics = data ? [
        { label: "성적 입력 완료율", value: data.metrics.gradeInputRate, color: "bg-primary" },
        { label: "출석률", value: data.metrics.attendanceRate, color: "bg-green-500" },
        { label: "목표 달성률", value: data.metrics.goalAchievementRate, color: "bg-orange-500" },
    ] : []

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <p>데이터를 불러오는 중 오류가 발생했습니다.</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                    다시 시도
                </Button>
            </div>
        )
    }

    return (
        <motion.div
            className="space-y-8"
            variants={container}
            initial="hidden"
            animate="show"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
                    <p className="text-muted-foreground mt-1">학원 운영 현황을 한눈에 파악하세요.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" className="hidden sm:flex">리포트 다운로드</Button>
                    <Link href="/students">
                        <Button>학생 추가</Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <motion.div key={stat.title} variants={item}>
                        <Card className="group hover:shadow-md transition-all duration-300 border-border/50">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <motion.div variants={item} className="col-span-4">
                    <Card className="h-full border-border/50">
                        <CardHeader>
                            <CardTitle>최근 활동</CardTitle>
                            <CardDescription>최근 활동 내역입니다.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {data?.activities && data.activities.length > 0 ? (
                                <div className="space-y-6">
                                    {data.activities.map((activity, idx) => (
                                        <div key={idx} className="flex items-start gap-4 group">
                                            <div className={`mt-1 h-2 w-2 rounded-full ${getActivityColor(activity.type)} ring-4 ring-background group-hover:scale-125 transition-transform`} />
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-medium leading-none">{activity.title}</p>
                                                <p className="text-xs text-muted-foreground">{activity.description}</p>
                                            </div>
                                            <span className="text-xs text-muted-foreground">{formatTimeAgo(activity.createdAt)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                    <p className="text-sm">아직 활동 내역이 없습니다.</p>
                                    <p className="text-xs mt-1">학생을 등록하고 성적을 입력해보세요.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item} className="col-span-3">
                    <Card className="h-full border-border/50">
                        <CardHeader>
                            <CardTitle>이번 주 목표 달성 현황</CardTitle>
                            <CardDescription>주간 목표 달성률 리포트</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {metrics.map((metric, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{metric.label}</span>
                                        <span className="text-muted-foreground">{metric.value}%</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                                        <motion.div
                                            className={`h-full ${metric.color}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${metric.value}%` }}
                                            transition={{ duration: 1, delay: 0.5 + idx * 0.1, ease: 'easeOut' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    )
}
