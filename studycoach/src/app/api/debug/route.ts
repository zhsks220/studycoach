import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const debugInfo: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
      DATABASE_URL_PREFIX: process.env.DATABASE_URL?.substring(0, 50) + '...',
      NEXTAUTH_SECRET_EXISTS: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
    },
    database: {
      connected: false,
      error: null as string | null,
      userCount: 0,
      firstUser: null as { email: string; name: string | null; role: string } | null,
    }
  }

  try {
    // Test database connection
    const userCount = await prisma.user.count()

    // Get first user email (redacted)
    const firstUser = await prisma.user.findFirst({
      select: { email: true, name: true, role: true }
    })

    debugInfo.database = {
      connected: true,
      error: null,
      userCount,
      firstUser,
    }
  } catch (error) {
    debugInfo.database = {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
      userCount: 0,
      firstUser: null,
    }
  }

  return NextResponse.json(debugInfo, { status: 200 })
}
