'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExcelUploader, UploadPreview, TemplateDownload } from '@/components/upload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react'
import { parseExcelFile, mapExcelData } from '@/lib/excel'

interface UploadResult {
  valid: any[]
  invalid: any[]
  totalRows: number
  validRows: number
}

export default function UploadPage() {
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentType, setCurrentType] = useState<'students' | 'grades' | 'goals'>('students')

  const handleUpload = async (file: File, type: 'students' | 'grades' | 'goals') => {
    setIsLoading(true)
    setUploadResult(null)

    try {
      // 1. 먼저 클라이언트에서 파싱 및 미리보기
      const parseResult = await parseExcelFile(file, type)
      const mappedData = mapExcelData(parseResult.data, type)

      // 2. 서버로 업로드
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/upload/${type}`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        // 성공
        toast.success(`${result.data.created}건의 데이터가 성공적으로 업로드되었습니다`, {
          description: `전체 ${result.data.total}건 중 ${result.data.created}건 저장 완료`,
        })

        setUploadResult({
          valid: mappedData,
          invalid: [],
          totalRows: result.data.total,
          validRows: result.data.created,
        })
      } else if (result.preview) {
        // 검증 실패 - 미리보기 표시
        toast.warning('일부 데이터에 오류가 있습니다', {
          description: `${result.data.invalid.length}건의 오류를 확인하세요`,
        })

        setUploadResult({
          valid: result.data.valid || [],
          invalid: result.data.invalid || [],
          totalRows: result.data.totalRows,
          validRows: result.data.validRows,
        })
      } else {
        // 오류
        toast.error(result.error || '업로드 실패', {
          description: result.missingStudents
            ? `등록되지 않은 학생: ${result.missingStudents.join(', ')}`
            : undefined,
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('업로드 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmUpload = async () => {
    if (!uploadResult || uploadResult.valid.length === 0) return

    toast.info('정상 데이터만 업로드됩니다', {
      description: `${uploadResult.valid.length}건의 데이터가 저장됩니다`,
    })

    // 이미 서버에서 처리되었으므로 결과만 초기화
    setUploadResult(null)
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Upload className="h-8 w-8" />
            데이터 업로드
          </h1>
          <p className="text-muted-foreground mt-2">
            엑셀 파일을 업로드하여 대량의 데이터를 한번에 입력하세요
          </p>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 메인 영역 - 업로드 및 미리보기 */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs
            defaultValue="students"
            onValueChange={(value) => {
              setCurrentType(value as 'students' | 'grades' | 'goals')
              setUploadResult(null)
            }}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="students" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                학생 정보
              </TabsTrigger>
              <TabsTrigger value="grades" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                성적 정보
              </TabsTrigger>
              <TabsTrigger value="goals" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                목표 정보
              </TabsTrigger>
            </TabsList>

            {/* 학생 정보 탭 */}
            <TabsContent value="students" className="space-y-4 mt-6">
              <ExcelUploader
                type="students"
                onUpload={(file) => handleUpload(file, 'students')}
                isLoading={isLoading}
              />

              {uploadResult && currentType === 'students' && (
                <>
                  <UploadPreview
                    data={uploadResult.valid}
                    errors={uploadResult.invalid}
                    type="students"
                  />

                  {uploadResult.invalid.length > 0 && uploadResult.valid.length > 0 && (
                    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-orange-900 dark:text-orange-100">
                                일부 데이터에 오류가 있습니다
                              </p>
                              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                                정상 데이터({uploadResult.valid.length}건)만 업로드하시겠습니까?
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={handleConfirmUpload}
                            variant="default"
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            정상 데이터만 업로드
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            {/* 성적 정보 탭 */}
            <TabsContent value="grades" className="space-y-4 mt-6">
              <ExcelUploader
                type="grades"
                onUpload={(file) => handleUpload(file, 'grades')}
                isLoading={isLoading}
              />

              {uploadResult && currentType === 'grades' && (
                <>
                  <UploadPreview
                    data={uploadResult.valid}
                    errors={uploadResult.invalid}
                    type="grades"
                  />

                  {uploadResult.invalid.length > 0 && uploadResult.valid.length > 0 && (
                    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-orange-900 dark:text-orange-100">
                                일부 데이터에 오류가 있습니다
                              </p>
                              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                                정상 데이터({uploadResult.valid.length}건)만 업로드하시겠습니까?
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={handleConfirmUpload}
                            variant="default"
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            정상 데이터만 업로드
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            {/* 목표 정보 탭 */}
            <TabsContent value="goals" className="space-y-4 mt-6">
              <ExcelUploader
                type="goals"
                onUpload={(file) => handleUpload(file, 'goals')}
                isLoading={isLoading}
              />

              {uploadResult && currentType === 'goals' && (
                <>
                  <UploadPreview
                    data={uploadResult.valid}
                    errors={uploadResult.invalid}
                    type="goals"
                  />

                  {uploadResult.invalid.length > 0 && uploadResult.valid.length > 0 && (
                    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-orange-900 dark:text-orange-100">
                                일부 데이터에 오류가 있습니다
                              </p>
                              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                                정상 데이터({uploadResult.valid.length}건)만 업로드하시겠습니까?
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={handleConfirmUpload}
                            variant="default"
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            정상 데이터만 업로드
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* 사이드바 - 템플릿 다운로드 */}
        <div className="space-y-6">
          <TemplateDownload />

          {/* 업로드 가이드 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                업로드 가이드
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">1단계: 템플릿 다운로드</h4>
                <p className="text-xs text-muted-foreground">
                  원하는 데이터 타입의 템플릿을 다운로드합니다
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm">2단계: 데이터 입력</h4>
                <p className="text-xs text-muted-foreground">
                  템플릿의 예시를 참고하여 데이터를 입력합니다
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm">3단계: 파일 업로드</h4>
                <p className="text-xs text-muted-foreground">
                  작성한 엑셀 파일을 드래그하거나 선택하여 업로드합니다
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm">4단계: 결과 확인</h4>
                <p className="text-xs text-muted-foreground">
                  업로드 결과를 확인하고 오류가 있다면 수정합니다
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
