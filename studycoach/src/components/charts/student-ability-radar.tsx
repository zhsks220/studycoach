'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export interface AbilityData {
  subject: string
  score: number
  fullMark: number
}

interface StudentAbilityRadarProps {
  data: AbilityData[]
  title?: string
  description?: string
}

export function StudentAbilityRadar({
  data,
  title = '과목별 능력치',
  description,
}: StudentAbilityRadarProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && (theme === 'dark' || resolvedTheme === 'dark')
  const textColor = isDark ? '#e5e7eb' : '#374151'
  const gridColor = isDark ? '#374151' : '#e5e7eb'

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={data}>
            <PolarGrid stroke={gridColor} strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: textColor, fontSize: 12 }}
              stroke={gridColor}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: textColor, fontSize: 10 }}
              stroke={gridColor}
            />
            <Radar
              name="점수"
              dataKey="score"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${gridColor}`,
                borderRadius: '6px',
                padding: '8px 12px',
                color: textColor,
              }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: textColor }}
              itemStyle={{ color: '#3b82f6' }}
              formatter={(value: number) => [`${value}점`, '점수']}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                color: textColor,
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
