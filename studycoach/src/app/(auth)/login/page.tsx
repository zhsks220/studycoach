'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('환영합니다!')
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      toast.error('로그인 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-primary/5 blur-[100px]" />
      <div className="absolute bottom-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-400/5 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-sm z-10"
      >
        <Card className="border-none shadow-xl bg-card/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="space-y-1 text-center pb-8 pt-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"
            >
              <Sparkles className="h-8 w-8" />
            </motion.div>
            <CardTitle className="text-2xl font-semibold tracking-tight">StudyCoach</CardTitle>
            <CardDescription className="text-muted-foreground/80">
              오늘의 학습 관리를 시작하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8 px-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground/80">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="h-11 bg-muted/30 border-border/50 focus:bg-background transition-colors"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground/80">비밀번호</Label>
                  <a href="#" className="text-xs text-primary hover:underline">비밀번호 찾기</a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-11 bg-muted/30 border-border/50 focus:bg-background transition-colors"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 text-base font-medium shadow-md transition-all hover:translate-y-[-1px] hover:shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>로그인 중...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>로그인</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border/40">
              <p className="text-xs text-center text-muted-foreground mb-4 font-medium">데모 계정으로 빠르게 시작하기</p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ email: 'admin@studycoach.com', password: 'password123' })}
                  className="text-xs bg-muted/50 hover:bg-muted p-2 rounded-md transition-colors text-left flex justify-between group"
                >
                  <span className="font-medium text-foreground/80">관리자 (Admin)</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">선택 →</span>
                </button>
                {/* Simplified demo list for cleaner UI */}
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          계정이 없으신가요?{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">
            무료로 시작하기
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
