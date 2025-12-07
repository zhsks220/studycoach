'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  Users,
  FileText,
  Target,
  BarChart3,
  Upload,
  LogOut,
  Menu,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    title: '대시보드',
    href: '/',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: '학생 관리',
    href: '/students',
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: '성적 관리',
    href: '/grades',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: '목표 관리',
    href: '/goals',
    icon: <Target className="h-5 w-5" />,
  },
  {
    title: '데이터 업로드',
    href: '/upload',
    icon: <Upload className="h-5 w-5" />,
  },
  {
    title: '분석',
    href: '/analytics',
    icon: <BarChart3 className="h-5 w-5" />,
  },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/10">
      {/* Sidebar - Folk Style (Minimal, Clean) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center px-6">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-sm transition-transform group-hover:scale-105">
              SC
            </div>
            <span className="text-xl font-bold tracking-tight text-sidebar-foreground">StudyCoach</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <LayoutGroup>
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute inset-0 rounded-md bg-sidebar-accent"
                      initial={false}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center space-x-3">
                    {item.icon}
                    <span>{item.title}</span>
                  </span>
                </Link>
              )
            })}
          </LayoutGroup>
        </nav>

        <div className="border-t p-4 mt-auto">
          <div className="flex items-center space-x-3 rounded-lg bg-sidebar-accent/50 p-3">
            <Avatar className="h-9 w-9 border border-sidebar-border">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {session?.user?.name ? getInitials(session.user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-sidebar-foreground">{session?.user?.name}</span>
              <span className="truncate text-xs text-muted-foreground capitalize">
                {session?.user?.role === 'ADMIN' && '관리자'}
                {session?.user?.role === 'TEACHER' && '강사'}
                {session?.user?.role === 'PARENT' && '학부모'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header - Transparent/Minimal */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm lg:px-8">
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex items-center ml-auto gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page Content with Transition */}
        <main className="flex-1 overflow-auto p-6 lg:p-8 bg-background">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full mx-auto max-w-7xl"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
