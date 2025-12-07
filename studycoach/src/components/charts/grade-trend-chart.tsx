'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface GradeData {
  id: string
  subject: string
  score: number
  examName: string
  examDate: Date
  examType: string
}

interface GradeTrendChartProps {
  grades: GradeData[]
  title?: string
  description?: string
}

export function GradeTrendChart({
  grades,
  title = '성적 추이',
  description,
}: GradeTrendChartProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && (theme === 'dark' || resolvedTheme === 'dark')
  const textColor = isDark ? '#e5e7eb' : '#374151'
  const gridColor = isDark ? '#374151' : '#e5e7eb'

  // 날짜순으로 정렬하고 최근 10개만
  const sortedGrades = [...grades]
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
    .slice(-10)

  const chartData = sortedGrades.map((grade) => ({
    date: format(new Date(grade.examDate), 'MM/dd', { locale: ko }),
    점수: grade.score,
    exam: `${grade.subject} ${grade.examName}`,
    fullDate: format(new Date(grade.examDate), 'yyyy-MM-dd'),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="date"
              tick={{ fill: textColor, fontSize: 12 }}
              stroke={gridColor}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: textColor, fontSize: 12 }}
              stroke={gridColor}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${gridColor}`,
                borderRadius: '6px',
                padding: '8px 12px',
                color: textColor,
              }}
              labelStyle={{ color: textColor }}
              itemStyle={{ color: '#10b981' }}
              labelFormatter={(label) => `날짜: ${label}`}
              formatter={(value: number, name: string, props: any) => [
                `${value}점`,
                props.payload.exam,
              ]}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', color: textColor }} />
            <Line
              type="monotone"
              dataKey="점수"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface SubjectComparisonChartProps {
  grades: GradeData[]
  title?: string
  description?: string
}

export function SubjectComparisonChart({
  grades,
  title = '과목별 평균 점수',
  description,
}: SubjectComparisonChartProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && (theme === 'dark' || resolvedTheme === 'dark')
  const textColor = isDark ? '#e5e7eb' : '#374151'
  const gridColor = isDark ? '#374151' : '#e5e7eb'

  // 과목별 평균 계산
  const subjectMap = new Map<string, number[]>()

  grades.forEach((grade) => {
    if (!subjectMap.has(grade.subject)) {
      subjectMap.set(grade.subject, [])
    }
    subjectMap.get(grade.subject)!.push(grade.score)
  })

  const chartData = Array.from(subjectMap.entries())
    .map(([subject, scores]) => ({
      subject,
      평균점수: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
      시험수: scores.length,
    }))
    .sort((a, b) => b.평균점수 - a.평균점수)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="subject"
              tick={{ fill: textColor, fontSize: 12 }}
              stroke={gridColor}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: textColor, fontSize: 12 }}
              stroke={gridColor}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${gridColor}`,
                borderRadius: '6px',
                padding: '8px 12px',
                color: textColor,
              }}
              labelStyle={{ color: textColor }}
              itemStyle={{ color: '#f97316' }}
              formatter={(value: number, name: string, props: any) => [
                `${value}점 (${props.payload.시험수}회)`,
                '평균점수',
              ]}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', color: textColor }} />
            <Bar dataKey="평균점수" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface ExamTypeChartProps {
  grades: GradeData[]
  title?: string
  description?: string
}

export function ExamTypeChart({
  grades,
  title = '시험 유형별 평균',
  description,
}: ExamTypeChartProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && (theme === 'dark' || resolvedTheme === 'dark')
  const textColor = isDark ? '#e5e7eb' : '#374151'
  const gridColor = isDark ? '#374151' : '#e5e7eb'

  // 시험 유형별 평균 계산
  const examTypeMap = new Map<string, number[]>()

  grades.forEach((grade) => {
    if (!examTypeMap.has(grade.examType)) {
      examTypeMap.set(grade.examType, [])
    }
    examTypeMap.get(grade.examType)!.push(grade.score)
  })

  const chartData = Array.from(examTypeMap.entries()).map(([examType, scores]) => ({
    type: examType,
    평균점수: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
    시험수: scores.length,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: textColor, fontSize: 12 }}
              stroke={gridColor}
            />
            <YAxis
              type="category"
              dataKey="type"
              tick={{ fill: textColor, fontSize: 12 }}
              stroke={gridColor}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${gridColor}`,
                borderRadius: '6px',
                padding: '8px 12px',
                color: textColor,
              }}
              labelStyle={{ color: textColor }}
              itemStyle={{ color: '#a855f7' }}
              formatter={(value: number, name: string, props: any) => [
                `${value}점 (${props.payload.시험수}회)`,
                '평균점수',
              ]}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', color: textColor }} />
            <Bar dataKey="평균점수" fill="#a855f7" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
