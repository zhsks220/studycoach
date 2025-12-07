'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface UploadPreviewProps {
  data: any[]
  errors: {
    row: number
    data?: any
    errors: string[]
  }[]
  warnings?: string[]
  type: 'students' | 'grades' | 'goals'
}

const TYPE_LABELS = {
  students: '학생 정보',
  grades: '성적 정보',
  goals: '목표 정보',
}

export function UploadPreview({ data, errors, warnings = [], type }: UploadPreviewProps) {
  const totalRows = data.length + errors.length
  const successRate = totalRows > 0 ? Math.round((data.length / totalRows) * 100) : 0

  // 미리보기용 컬럼 추출
  const getPreviewColumns = (row: any): string => {
    const keys = Object.keys(row).slice(0, 3)
    const values = keys.map((key) => `${key}: ${row[key]}`).join(', ')
    return values.length > 50 ? values.substring(0, 50) + '...' : values
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            <span>{TYPE_LABELS[type]} 업로드 미리보기</span>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3" />
              성공: {data.length}건
            </Badge>
            {errors.length > 0 && (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                오류: {errors.length}건
              </Badge>
            )}
            {warnings.length > 0 && (
              <Badge
                variant="outline"
                className="gap-1 bg-yellow-50 text-yellow-700 border-yellow-200"
              >
                <AlertTriangle className="h-3 w-3" />
                경고: {warnings.length}건
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 요약 통계 */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{data.length}</p>
            <p className="text-xs text-muted-foreground">성공</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-destructive">{errors.length}</p>
            <p className="text-xs text-muted-foreground">실패</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{successRate}%</p>
            <p className="text-xs text-muted-foreground">성공률</p>
          </div>
        </div>

        {/* 데이터 미리보기 테이블 */}
        <ScrollArea className="h-[400px] rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[80px]">행 번호</TableHead>
                <TableHead className="w-[100px]">상태</TableHead>
                <TableHead>데이터</TableHead>
                <TableHead className="w-[200px]">비고</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* 성공한 데이터 (최대 10개만 표시) */}
              {data.slice(0, 10).map((row, index) => (
                <TableRow key={`success-${index}`} className="hover:bg-green-50/50">
                  <TableCell className="font-medium">{index + 2}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="gap-1 bg-green-50 text-green-700 border-green-200"
                    >
                      <CheckCircle className="h-3 w-3" />
                      정상
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {getPreviewColumns(row)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">-</TableCell>
                </TableRow>
              ))}

              {/* 오류 데이터 */}
              {errors.map((error, index) => (
                <TableRow key={`error-${index}`} className="hover:bg-destructive/5">
                  <TableCell className="font-medium">{error.row}</TableCell>
                  <TableCell>
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      오류
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {error.data ? getPreviewColumns(error.data) : '데이터 없음'}
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="space-y-1">
                      {error.errors.map((err, i) => (
                        <p key={i} className="text-destructive">
                          • {err}
                        </p>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {/* 더 많은 데이터가 있을 경우 안내 */}
              {data.length > 10 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-4">
                    <Info className="h-4 w-4 inline mr-2" />
                    외 {data.length - 10}개의 성공 데이터가 더 있습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* 경고 메시지 */}
        {warnings.length > 0 && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-sm text-yellow-800 dark:text-yellow-200">
                  경고 사항
                </p>
                {warnings.map((warning, index) => (
                  <p key={index} className="text-xs text-yellow-700 dark:text-yellow-300">
                    • {warning}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
