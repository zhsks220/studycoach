'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

interface ExcelUploaderProps {
  type: 'students' | 'grades' | 'goals'
  onUpload: (file: File) => Promise<void>
  isLoading?: boolean
}

const TYPE_LABELS = {
  students: '학생 정보',
  grades: '성적 정보',
  goals: '목표 정보',
}

export function ExcelUploader({ type, onUpload, isLoading }: ExcelUploaderProps) {
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      // 파일 확장자 검증
      const validExtensions = ['.xlsx', '.xls']
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

      if (!validExtensions.includes(fileExtension)) {
        setError('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다')
        return
      }

      // 파일 크기 검증 (5MB)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        setError('파일 크기는 5MB를 초과할 수 없습니다')
        return
      }

      setError(null)
      setUploadProgress(0)

      try {
        // 업로드 시작
        setUploadProgress(30)
        await onUpload(file)
        setUploadProgress(100)

        // 성공 후 초기화
        setTimeout(() => {
          setUploadProgress(0)
        }, 2000)
      } catch (err) {
        setError('업로드 중 오류가 발생했습니다')
        setUploadProgress(0)
      }
    },
    [onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    disabled: isLoading,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          {TYPE_LABELS[type]} 엑셀 업로드
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${
              isDragActive
                ? 'border-primary bg-primary/5 scale-[1.02]'
                : 'border-muted-foreground/25'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50 hover:bg-primary/5'}
          `}
        >
          <input {...getInputProps()} />
          <Upload
            className={`h-12 w-12 mx-auto mb-4 transition-colors ${
              isDragActive ? 'text-primary' : 'text-muted-foreground'
            }`}
          />
          {isDragActive ? (
            <p className="text-lg font-medium text-primary">파일을 여기에 놓으세요</p>
          ) : (
            <>
              <p className="text-lg font-medium mb-2">
                엑셀 파일을 드래그하거나 클릭하여 선택
              </p>
              <p className="text-sm text-muted-foreground">
                .xlsx, .xls 파일 (최대 5MB)
              </p>
            </>
          )}
        </div>

        {/* 업로드 진행률 */}
        {isLoading && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">업로드 중...</span>
              <span className="font-medium">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* 성공 메시지 */}
        {uploadProgress === 100 && !isLoading && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              파일이 성공적으로 업로드되었습니다
            </AlertDescription>
          </Alert>
        )}

        {/* 에러 메시지 */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 안내 메시지 */}
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 <strong>팁:</strong> 템플릿을 다운로드하여 형식에 맞게 작성하면 오류 없이 업로드할 수
            있습니다.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
