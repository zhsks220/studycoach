# 스터디 코치 기술 아키텍처 로드맵

## 🏗️ 현재 아키텍처 (AS-IS)

```
┌─────────────────────────────────────┐
│       Next.js Frontend              │
│   (React 19 + TypeScript)           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Next.js API Routes              │
│   (Server-Side Logic)               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Prisma ORM                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      SQLite Database                │
│   (prisma/dev.db)                   │
└─────────────────────────────────────┘
```

### 현재 제약사항
- **단일 데이터베이스**: 동시 접속 제한, 확장성 부족
- **파일 기반 DB**: 백업/복구 어려움, 클라우드 호스팅 부적합
- **세션 관리**: 서버 메모리 의존
- **파일 저장**: 로컬 파일 시스템
- **캐싱**: 없음
- **부하 분산**: 불가능

---

## 🎯 목표 아키텍처 (TO-BE) - Phase 3 완료 시

```
┌─────────────────────────────────────────────────────┐
│            CDN (Vercel Edge Network)                │
│        Static Assets, Edge Functions                │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│           Next.js Frontend (SSR/SSG)                │
│   React 19, TypeScript, Zustand, React Query        │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│            API Gateway / Load Balancer              │
│          (Vercel Serverless Functions)              │
└─────┬──────────────┬──────────────┬─────────────────┘
      │              │              │
      │              │              │
┌─────▼──────┐ ┌─────▼──────┐ ┌───▼──────────────────┐
│   Core     │ │  Payment   │ │   Notification       │
│  Service   │ │  Service   │ │   Service            │
│ (Next.js)  │ │  (Stripe)  │ │ (Firebase/SendGrid)  │
└─────┬──────┘ └────────────┘ └──────────────────────┘
      │
      │ ┌────────────────────────────────┐
      ├─┤   Redis Cache (Upstash)       │
      │ └────────────────────────────────┘
      │
      │ ┌────────────────────────────────┐
      └─┤  PostgreSQL (Primary + Replica)│
        │     (Supabase / Neon)          │
        └─────────────┬──────────────────┘
                      │
        ┌─────────────▼──────────────────┐
        │   S3-compatible Storage        │
        │  (Cloudflare R2 / AWS S3)      │
        └────────────────────────────────┘
```

---

## 📍 Phase 1: 즉시 마이그레이션 (Week 1-4)

### 1.1 Database Migration: SQLite → PostgreSQL

#### 선택지 비교

| 옵션 | 장점 | 단점 | 가격 |
|------|------|------|------|
| **Supabase** | 무료 시작, Realtime 지원, Auth 내장 | 한국 리전 없음 | $0-$25/월 |
| **Neon** | Serverless, 빠른 확장, 합리적 가격 | 한국 리전 없음 | $0-$19/월 |
| **AWS RDS** | 완전한 제어, 한국 리전 | 관리 부담, 비쌈 | ~$50/월 |
| **Railway** | 간단한 설정, 좋은 DX | 한국 리전 없음 | $5-$20/월 |

#### 추천: **Neon** (Phase 1-2) → **AWS RDS** (Phase 3+)

**Phase 1-2에 Neon을 선택한 이유:**
- Serverless 특성으로 초기 트래픽에 최적
- 자동 스케일링
- 합리적인 가격
- Vercel과 원클릭 통합

**Phase 3+ AWS RDS 전환 이유:**
- 한국 리전 필요 (지연시간 최소화)
- 완전한 제어 필요
- 엔터프라이즈 고객 요구사항

#### Migration 단계

##### Step 1: Prisma Schema 수정
```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql" // SQLite에서 변경
  url      = env("DATABASE_URL")
}

// 기존 모델은 대부분 호환됨
// SQLite → PostgreSQL 변경사항:
// - @default(cuid()) → 동일 지원
// - DateTime → TIMESTAMPTZ 자동 매핑
// - 인덱스 최적화 필요
```

##### Step 2: 마이그레이션 스크립트
```typescript
// scripts/migrate-to-postgresql.ts

import { PrismaClient as SQLiteClient } from '../prisma/generated/sqlite';
import { PrismaClient as PostgresClient } from '@prisma/client';

const sqlite = new SQLiteClient({
  datasources: { db: { url: 'file:./prisma/dev.db' } }
});

const postgres = new PostgresClient({
  datasources: { db: { url: process.env.NEW_DATABASE_URL } }
});

async function migrate() {
  // 1. Academy 마이그레이션
  const academies = await sqlite.academy.findMany();
  await postgres.academy.createMany({ data: academies });

  // 2. User 마이그레이션
  const users = await sqlite.user.findMany();
  await postgres.user.createMany({ data: users });

  // 3. Student, Goal, Grade, Attendance 순차 마이그레이션
  // ... (관계 순서 고려)

  console.log('Migration completed!');
}

migrate()
  .catch(console.error)
  .finally(async () => {
    await sqlite.$disconnect();
    await postgres.$disconnect();
  });
```

##### Step 3: 데이터 검증
```bash
# 데이터 카운트 비교
sqlite3 prisma/dev.db "SELECT COUNT(*) FROM Academy;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Academy\";"

# 샘플 데이터 비교
# 각 테이블별 랜덤 샘플 추출 및 비교
```

##### Step 4: 배포
```bash
# 1. 신규 환경 변수 설정
DATABASE_URL="postgresql://..."

# 2. Prisma 마이그레이션 실행
npx prisma migrate deploy

# 3. 데이터 마이그레이션
npm run migrate:data

# 4. 검증
npm run validate:migration

# 5. 배포
vercel --prod
```

### 1.2 구독 시스템 구현

#### Database Schema 추가

```prisma
// prisma/schema.prisma

model Academy {
  id              String   @id @default(cuid())
  name            String
  address         String?
  phone           String?

  // 구독 관련 (기존)
  subscriptionPlan String  @default("free")
  subscriptionEnd DateTime?

  // 구독 관련 (추가)
  stripeCustomerId     String?  @unique
  stripeSubscriptionId String?  @unique
  trialEndsAt          DateTime?
  canceledAt           DateTime?

  // 플랜 제한 (캐싱용)
  maxStudents     Int      @default(10)
  maxUsers        Int      @default(2)
  dataRetention   Int      @default(90) // 일 단위

  users           User[]
  students        Student[]
  subscriptionHistory SubscriptionHistory[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model SubscriptionHistory {
  id          String   @id @default(cuid())
  academyId   String
  academy     Academy  @relation(fields: [academyId], references: [id])

  plan        String
  status      SubscriptionStatus
  startDate   DateTime
  endDate     DateTime?

  amount      Float
  currency    String   @default("KRW")

  stripeInvoiceId      String?
  stripePaymentIntentId String?

  metadata    Json?

  createdAt   DateTime @default(now())
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  PAST_DUE
  TRIALING
  INCOMPLETE
}

model PlanLimit {
  id              String @id @default(cuid())
  plan            String @unique
  maxStudents     Int
  maxUsers        Int
  dataRetention   Int
  features        Json   // { analytics: true, reports: true, api: false }
  priceMonthly    Float
  priceYearly     Float?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

#### Stripe Integration

```typescript
// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// 플랜 정의
export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    stripePriceId: null,
    limits: {
      maxStudents: 10,
      maxUsers: 2,
      dataRetention: 90,
    },
  },
  starter: {
    name: 'Starter',
    price: 49000,
    stripePriceId: process.env.STRIPE_PRICE_STARTER!,
    limits: {
      maxStudents: 30,
      maxUsers: 5,
      dataRetention: 365,
    },
  },
  professional: {
    name: 'Professional',
    price: 99000,
    stripePriceId: process.env.STRIPE_PRICE_PROFESSIONAL!,
    limits: {
      maxStudents: 100,
      maxUsers: -1, // unlimited
      dataRetention: 1095, // 3년
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 299000,
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE!,
    limits: {
      maxStudents: -1,
      maxUsers: -1,
      dataRetention: -1, // unlimited
    },
  },
};
```

#### API Routes

```typescript
// app/api/subscription/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe, PLANS } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { plan } = await req.json();

  if (!PLANS[plan as keyof typeof PLANS]) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { academy: true },
  });

  if (!user?.academy) {
    return NextResponse.json({ error: 'Academy not found' }, { status: 404 });
  }

  // Stripe Customer 생성 (없으면)
  let stripeCustomerId = user.academy.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        academyId: user.academy.id,
        academyName: user.academy.name,
      },
    });

    stripeCustomerId = customer.id;

    await prisma.academy.update({
      where: { id: user.academy.id },
      data: { stripeCustomerId },
    });
  }

  // Checkout Session 생성
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: PLANS[plan as keyof typeof PLANS].stripePriceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?subscription=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?subscription=canceled`,
    metadata: {
      academyId: user.academy.id,
      plan,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
```

#### Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // 이벤트 처리
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const academyId = session.metadata?.academyId;
  const plan = session.metadata?.plan;

  if (!academyId || !plan) return;

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  await prisma.academy.update({
    where: { id: academyId },
    data: {
      subscriptionPlan: plan,
      stripeSubscriptionId: subscription.id,
      subscriptionEnd: new Date(subscription.current_period_end * 1000),
      maxStudents: PLANS[plan as keyof typeof PLANS].limits.maxStudents,
      maxUsers: PLANS[plan as keyof typeof PLANS].limits.maxUsers,
      dataRetention: PLANS[plan as keyof typeof PLANS].limits.dataRetention,
    },
  });

  // 구독 히스토리 기록
  await prisma.subscriptionHistory.create({
    data: {
      academyId,
      plan,
      status: 'ACTIVE',
      startDate: new Date(subscription.current_period_start * 1000),
      endDate: new Date(subscription.current_period_end * 1000),
      amount: (subscription.items.data[0].price.unit_amount || 0) / 100,
      currency: 'KRW',
      stripeInvoiceId: subscription.latest_invoice as string,
    },
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // 구독 업데이트 처리 (플랜 변경, 갱신 등)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // 구독 취소 처리
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // 결제 실패 처리 (이메일 알림 등)
}
```

### 1.3 Middleware: 구독 검증

```typescript
// middleware/subscription.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function requireActiveSubscription(req: NextRequest) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { academy: true },
  });

  if (!user?.academy) {
    return NextResponse.json({ error: 'Academy not found' }, { status: 404 });
  }

  const { academy } = user;

  // 무료 플랜은 항상 허용
  if (academy.subscriptionPlan === 'free') {
    return { academy, limits: PLANS.free.limits };
  }

  // 구독 만료 확인
  if (!academy.subscriptionEnd || academy.subscriptionEnd < new Date()) {
    return NextResponse.json(
      { error: '구독이 만료되었습니다. 구독을 갱신해주세요.' },
      { status: 402 } // Payment Required
    );
  }

  // 취소된 구독 확인
  if (academy.canceledAt && academy.canceledAt < new Date()) {
    return NextResponse.json(
      { error: '구독이 취소되었습니다.' },
      { status: 402 }
    );
  }

  return {
    academy,
    limits: PLANS[academy.subscriptionPlan as keyof typeof PLANS].limits,
  };
}

// 사용 예시
export async function checkStudentLimit(academyId: string) {
  const academy = await prisma.academy.findUnique({
    where: { id: academyId },
    include: { _count: { select: { students: true } } },
  });

  if (!academy) throw new Error('Academy not found');

  const currentStudents = academy._count.students;
  const maxStudents = academy.maxStudents;

  if (maxStudents !== -1 && currentStudents >= maxStudents) {
    throw new Error(
      `현재 플랜의 학생 수 한도(${maxStudents}명)를 초과했습니다. ` +
      `플랜을 업그레이드해주세요.`
    );
  }

  return true;
}
```

---

## 📍 Phase 2: 확장성 및 성능 (Week 5-12)

### 2.1 Caching Layer: Redis (Upstash)

#### 선택 이유
- Serverless-friendly (Vercel 환경에 최적)
- 무료 시작 가능
- 지연시간 최소화 (글로벌 엣지 로케이션)

#### 구현

```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 캐싱 헬퍼
export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300 // 5분
): Promise<T> {
  // 캐시 확인
  const cached = await redis.get<T>(key);
  if (cached) return cached;

  // 캐시 미스: 데이터 가져오기
  const data = await fetcher();

  // 캐시 저장
  await redis.setex(key, ttl, JSON.stringify(data));

  return data;
}

// 캐시 무효화
export async function invalidateCache(pattern: string) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

#### 사용 예시

```typescript
// app/api/students/[id]/route.ts
import { cached, invalidateCache } from '@/lib/redis';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const student = await cached(
    `student:${params.id}`,
    async () => {
      return await prisma.student.findUnique({
        where: { id: params.id },
        include: { goals: true, grades: true, attendances: true },
      });
    },
    600 // 10분 캐시
  );

  return NextResponse.json(student);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const data = await req.json();

  const student = await prisma.student.update({
    where: { id: params.id },
    data,
  });

  // 캐시 무효화
  await invalidateCache(`student:${params.id}`);
  await invalidateCache(`academy:${student.academyId}:students`);

  return NextResponse.json(student);
}
```

### 2.2 File Storage: Cloudflare R2

#### 선택 이유
- S3 호환 API
- 무료 egress (비용 절감)
- Cloudflare CDN 통합

#### 설정

```typescript
// lib/storage.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadFile(
  file: File,
  key: string
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  );

  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  });

  return await getSignedUrl(s3, command, { expiresIn });
}
```

---

## 📍 Phase 3: 엔터프라이즈 준비 (Month 5-8)

### 3.1 Multi-Region Database

```
Primary (Seoul): 쓰기 + 읽기
Replica (Tokyo): 읽기 전용
Replica (Singapore): 읽기 전용

- 지역별 읽기 성능 최적화
- 재해 복구 (Disaster Recovery)
- 고가용성 (High Availability)
```

### 3.2 Observability Stack

```yaml
Logging:
  - Vercel Logs (기본)
  - Datadog / New Relic (고급)

Monitoring:
  - Sentry (에러 추적)
  - Vercel Analytics (성능)
  - Uptime Robot (가동 시간)

APM:
  - New Relic (Phase 3+)
  - Request tracing
  - Database query 분석
```

---

## 🚀 배포 전략

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml

name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
          vercel-args: '--prod'
```

---

**다음 문서**: [구현 우선순위 및 일정](./IMPLEMENTATION_PRIORITY.md)
