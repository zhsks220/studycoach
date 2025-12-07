'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Building2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    academyName: '',
    academyPhone: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.passwordConfirm) {
      toast.error('비밀번호가 일치하지 않습니다')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          academyName: formData.academyName,
          academyPhone: formData.academyPhone,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || '회원가입에 실패했습니다')
        return
      }

      toast.success('회원가입이 완료되었습니다! 로그인해주세요.')
      router.push('/login')
    } catch (error) {
      toast.error('회원가입 중 오류가 발생했습니다')
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
        className="w-full max-w-md z-10"
      >
        <Card className="border-none shadow-xl bg-card/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="space-y-1 text-center pb-6 pt-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"
            >
              <Sparkles className="h-8 w-8" />
            </motion.div>
            <CardTitle className="text-2xl font-semibold tracking-tight">StudyCoach 시작하기</CardTitle>
            <CardDescription className="text-muted-foreground/80">
              학원 정보를 입력하고 무료로 시작하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8 px-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Academy Info Section */}
              <div className="space-y-3 pb-4 border-b border-border/40">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <Building2 className="h-4 w-4" />
                  학원 정보
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academyName" className="text-sm font-medium text-foreground/80">학원명 *</Label>
                  <Input
                    id="academyName"
                    type="text"
                    placeholder="OO학원"
                    className="h-10 bg-muted/30 border-border/50 focus:bg-background transition-colors"
                    value={formData.academyName}
                    onChange={(e) => setFormData({ ...formData, academyName: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academyPhone" className="text-sm font-medium text-foreground/80">학원 연락처</Label>
                  <Input
                    id="academyPhone"
                    type="tel"
                    placeholder="02-1234-5678"
                    className="h-10 bg-muted/30 border-border/50 focus:bg-background transition-colors"
                    value={formData.academyPhone}
                    onChange={(e) => setFormData({ ...formData, academyPhone: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* User Info Section */}
              <div className="space-y-3 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-foreground/80">이름 *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="홍길동"
                    className="h-10 bg-muted/30 border-border/50 focus:bg-background transition-colors"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground/80">이메일 *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="h-10 bg-muted/30 border-border/50 focus:bg-background transition-colors"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground/80">비밀번호 *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="6자 이상"
                    className="h-10 bg-muted/30 border-border/50 focus:bg-background transition-colors"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordConfirm" className="text-sm font-medium text-foreground/80">비밀번호 확인 *</Label>
                  <Input
                    id="passwordConfirm"
                    type="password"
                    placeholder="비밀번호 재입력"
                    className="h-10 bg-muted/30 border-border/50 focus:bg-background transition-colors"
                    value={formData.passwordConfirm}
                    onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium shadow-md transition-all hover:translate-y-[-1px] hover:shadow-lg mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>가입 처리 중...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>무료로 시작하기</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                로그인
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
