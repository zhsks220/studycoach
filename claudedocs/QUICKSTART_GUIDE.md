# 🚀 StudyCoach MVP Quick Start Guide
## React + Next.js 14 + shadcn/ui Local Setup

**Time to First Run:** ~30 minutes
**Target:** Fully functional local development environment

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- ✅ **Node.js 20 LTS** installed ([Download](https://nodejs.org/))
- ✅ **npm 10+** (comes with Node.js)
- ✅ **Git** installed
- ✅ **VS Code** (recommended IDE)

### Verify Installation
```bash
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
git --version   # Any recent version
```

---

## 🏗️ Step-by-Step Setup

### Step 1: Create Next.js Project (5 min)

```bash
# Navigate to your projects folder
cd ~/Desktop/project/교육\ 프로그램/

# Create Next.js 14 project with TypeScript + Tailwind
npx create-next-app@latest studycoach \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

# When prompted, select:
# ✅ TypeScript
# ✅ ESLint
# ✅ Tailwind CSS
# ✅ App Router
# ✅ Use src/ directory
# ✅ Import alias (@/*)
# ❌ Turbopack (not stable yet)

# Navigate into project
cd studycoach
```

**Expected Output:**
```
✔ Creating project...
✔ Initializing project...
✔ Installing dependencies...

Success! Created studycoach at ~/Desktop/project/교육 프로그램/studycoach
```

---

### Step 2: Install Core Dependencies (3 min)

```bash
# Database & ORM
npm install @prisma/client
npm install -D prisma

# Authentication
npm install next-auth@beta bcryptjs
npm install -D @types/bcryptjs

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# State Management
npm install @tanstack/react-query zustand

# Charts
npm install recharts

# Utilities
npm install date-fns lucide-react sonner class-variance-authority clsx tailwind-merge
```

**Verify Installation:**
```bash
npm list --depth=0
# Should show all packages installed
```

---

### Step 3: Setup shadcn/ui (5 min)

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# When prompted, configure:
# Style: Default
# Base color: Slate
# CSS variables: Yes
```

**Install Essential Components:**
```bash
# Form & Input Components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add textarea

# Display Components
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add separator

# Overlay Components
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast

# Advanced Components
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add progress
```

**Verify shadcn/ui:**
```bash
ls src/components/ui/
# Should show: button.tsx, input.tsx, card.tsx, etc.
```

---

### Step 4: Setup Prisma with SQLite (7 min)

```bash
# Initialize Prisma with SQLite
npx prisma init --datasource-provider sqlite
```

**Create Database Schema:**

Create/Edit `prisma/schema.prisma`:

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

// Academy (학원)
model Academy {
  id              String   @id @default(cuid())
  name            String
  address         String?
  phone           String?
  subscriptionPlan String  @default("free")
  subscriptionEnd DateTime?

  users           User[]
  students        Student[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// User (사용자: 원장, 강사, 학부모, 학생)
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  name            String
  role            Role     @default(TEACHER)
  password        String

  academyId       String
  academy         Academy  @relation(fields: [academyId], references: [id])

  children        Student[] @relation("ParentToStudent")
  studentProfile  Student?  @relation("StudentUser")

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum Role {
  ADMIN
  TEACHER
  PARENT
  STUDENT
}

// Student (학생)
model Student {
  id              String   @id @default(cuid())
  name            String
  grade           String
  birthDate       DateTime?
  phone           String?

  academyId       String
  academy         Academy  @relation(fields: [academyId], references: [id])

  parents         User[]   @relation("ParentToStudent")
  userId          String?  @unique
  user            User?    @relation("StudentUser", fields: [userId], references: [id])

  goals           Goal[]
  grades          Grade[]
  attendances     Attendance[]

  notes           String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Goal (목표)
model Goal {
  id              String     @id @default(cuid())
  title           String
  description     String?
  targetValue     Float
  currentValue    Float      @default(0)
  unit            String     @default("점")
  deadline        DateTime?
  status          GoalStatus @default(IN_PROGRESS)

  studentId       String
  student         Student    @relation(fields: [studentId], references: [id], onDelete: Cascade)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum GoalStatus {
  IN_PROGRESS
  ACHIEVED
  FAILED
  CANCELLED
}

// Grade (성적)
model Grade {
  id              String   @id @default(cuid())
  examName        String
  examDate        DateTime
  examType        String   @default("정기고사")

  subject         String
  score           Float
  maxScore        Float    @default(100)

  studentId       String
  student         Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)

  memo            String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Attendance (출석)
model Attendance {
  id              String           @id @default(cuid())
  date            DateTime
  status          AttendanceStatus

  studentId       String
  student         Student          @relation(fields: [studentId], references: [id], onDelete: Cascade)

  memo            String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([studentId, date])
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  EXCUSED
}
```

**Run Migrations:**
```bash
# Create initial migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

**Expected Output:**
```
✔ Generated Prisma Client
✔ Database synchronized with schema
```

---

### Step 5: Create Seed Data (5 min)

Create `prisma/seed.ts`:

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create Academy
  const academy = await prisma.academy.create({
    data: {
      name: '스마트학원',
      address: '서울시 강남구 테헤란로 123',
      phone: '02-1234-5678',
      subscriptionPlan: 'BASIC',
    },
  })

  // Create Admin User
  const hashedPassword = await bcrypt.hash('password123', 10)

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@studycoach.com',
      name: '김원장',
      role: 'ADMIN',
      password: hashedPassword,
      academyId: academy.id,
    },
  })

  // Create Teacher
  const teacherUser = await prisma.user.create({
    data: {
      email: 'teacher@studycoach.com',
      name: '이선생',
      role: 'TEACHER',
      password: hashedPassword,
      academyId: academy.id,
    },
  })

  // Create Parent
  const parentUser = await prisma.user.create({
    data: {
      email: 'parent@studycoach.com',
      name: '박엄마',
      role: 'PARENT',
      password: hashedPassword,
      academyId: academy.id,
    },
  })

  // Create Students
  const student1 = await prisma.student.create({
    data: {
      name: '김철수',
      grade: '중2',
      birthDate: new Date('2009-03-15'),
      phone: '010-1234-5678',
      academyId: academy.id,
      parents: {
        connect: { id: parentUser.id },
      },
    },
  })

  const student2 = await prisma.student.create({
    data: {
      name: '이영희',
      grade: '중3',
      birthDate: new Date('2008-07-22'),
      phone: '010-2345-6789',
      academyId: academy.id,
    },
  })

  const student3 = await prisma.student.create({
    data: {
      name: '박민수',
      grade: '중1',
      birthDate: new Date('2010-11-03'),
      academyId: academy.id,
    },
  })

  // Create Grades for 김철수
  const subjects = ['수학', '영어', '국어', '과학', '사회']
  const exams = [
    { name: '1학기 중간고사', date: new Date('2024-05-10') },
    { name: '1학기 기말고사', date: new Date('2024-07-15') },
    { name: '2학기 중간고사', date: new Date('2024-10-12') },
  ]

  for (const exam of exams) {
    for (const subject of subjects) {
      await prisma.grade.create({
        data: {
          examName: exam.name,
          examDate: exam.date,
          examType: '정기고사',
          subject,
          score: Math.floor(Math.random() * 30) + 70, // 70-100
          maxScore: 100,
          studentId: student1.id,
        },
      })
    }
  }

  // Create Goals
  await prisma.goal.create({
    data: {
      title: '수학 90점 달성',
      description: '다음 시험에서 수학 90점 이상 받기',
      targetValue: 90,
      currentValue: 85,
      unit: '점',
      deadline: new Date('2024-12-31'),
      status: 'IN_PROGRESS',
      studentId: student1.id,
    },
  })

  await prisma.goal.create({
    data: {
      title: '영어 평균 85점 유지',
      description: '연간 영어 평균 85점 이상 유지하기',
      targetValue: 85,
      currentValue: 87,
      unit: '점',
      status: 'IN_PROGRESS',
      studentId: student1.id,
    },
  })

  // Create Attendance Records
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    await prisma.attendance.create({
      data: {
        date,
        status: i % 10 === 0 ? 'ABSENT' : 'PRESENT',
        studentId: student1.id,
      },
    })
  }

  console.log('✅ Seed data created successfully!')
  console.log(`
    📝 Login Credentials:

    Admin:
      Email: admin@studycoach.com
      Password: password123

    Teacher:
      Email: teacher@studycoach.com
      Password: password123

    Parent:
      Email: parent@studycoach.com
      Password: password123
  `)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

**Update package.json:**
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

**Install ts-node:**
```bash
npm install -D ts-node
```

**Run Seed:**
```bash
npx prisma db seed
```

**Expected Output:**
```
✅ Seed data created successfully!

📝 Login Credentials:

Admin:
  Email: admin@studycoach.com
  Password: password123
```

---

### Step 6: Setup Project Structure (3 min)

```bash
# Create directory structure
mkdir -p src/app/\(auth\)/login
mkdir -p src/app/\(auth\)/signup
mkdir -p src/app/\(dashboard\)
mkdir -p src/app/api/auth/\[...nextauth\]
mkdir -p src/app/api/students
mkdir -p src/app/api/grades
mkdir -p src/app/api/goals
mkdir -p src/lib
mkdir -p src/types
mkdir -p src/hooks
```

**Create Prisma Client Instance:**

Create `src/lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Create Utility Functions:**

Create `src/lib/utils.ts`:
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

### Step 7: Setup Environment Variables (2 min)

Create `.env.local`:
```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here-change-in-production"
```

**Generate Secret:**
```bash
# Generate random secret
openssl rand -base64 32
# Copy output to NEXTAUTH_SECRET
```

---

### Step 8: Test Setup (2 min)

```bash
# Start development server
npm run dev
```

**Open Browser:**
- Navigate to: http://localhost:3000
- You should see Next.js default page

**Open Prisma Studio:**
```bash
# In new terminal
npx prisma studio
```
- Navigate to: http://localhost:5555
- You should see your seeded data

**Verify Database:**
- Click on "Student" table
- Should see 3 students (김철수, 이영희, 박민수)
- Click on "Grade" table
- Should see ~15 grade records

---

## ✅ Verification Checklist

### Development Environment
- [ ] `npm run dev` starts without errors
- [ ] http://localhost:3000 loads successfully
- [ ] No TypeScript errors in terminal
- [ ] Tailwind CSS classes working

### Database
- [ ] Prisma Studio opens at http://localhost:5555
- [ ] Academy table has 1 record
- [ ] User table has 3 records (admin, teacher, parent)
- [ ] Student table has 3 records
- [ ] Grade table has ~15 records
- [ ] Goal table has 2 records
- [ ] Attendance table has ~30 records

### Dependencies
- [ ] All npm packages installed
- [ ] shadcn/ui components in `src/components/ui/`
- [ ] Prisma client generated
- [ ] TypeScript configured

---

## 🎯 Next Steps

### Week 1 Tasks (Start Here)
1. **Implement Authentication**
   - Setup NextAuth.js
   - Create login page
   - Create signup page
   - Test login with seed credentials

2. **Create Dashboard Layout**
   - Dashboard layout component
   - Sidebar navigation
   - Header with user menu
   - Protected route middleware

3. **Build First Feature: Student List**
   - Student list API route
   - Student list page
   - Student card component
   - Test with seed data

### Recommended Learning Path
1. **Study shadcn/ui components**
   - Visit: https://ui.shadcn.com
   - Try examples in playground
   - Understand component API

2. **Review Next.js 14 App Router**
   - Visit: https://nextjs.org/docs
   - Understand routing conventions
   - Learn Server/Client Components

3. **Learn Prisma Basics**
   - Visit: https://www.prisma.io/docs
   - Practice CRUD operations
   - Understand relations

---

## 🐛 Troubleshooting

### "Command not found: npx"
```bash
# Update npm
npm install -g npm@latest

# Or use full path
node_modules/.bin/prisma
```

### "Module not found: @prisma/client"
```bash
# Regenerate Prisma client
npx prisma generate
```

### "Port 3000 already in use"
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill

# Or use different port
npm run dev -- -p 3001
```

### "TypeScript errors after shadcn install"
```bash
# Restart TypeScript server in VS Code
# Press: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### "Database locked" error
```bash
# Close Prisma Studio and restart
# Check no other process using dev.db
```

---

## 📚 Resources

### Documentation
- [Next.js 14 Docs](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js v5](https://authjs.dev)
- [Recharts](https://recharts.org)
- [React Hook Form](https://react-hook-form.com)

### Tutorials
- [Next.js 14 Tutorial](https://nextjs.org/learn)
- [shadcn/ui Setup Guide](https://ui.shadcn.com/docs)
- [Prisma Quickstart](https://www.prisma.io/docs/getting-started/quickstart)

### Community
- [Next.js Discord](https://discord.gg/nextjs)
- [shadcn/ui Discord](https://discord.gg/shadcn)
- [Prisma Slack](https://slack.prisma.io)

---

## 🎉 Success!

If you've completed all steps:
- ✅ Next.js project running
- ✅ shadcn/ui components installed
- ✅ Prisma connected to SQLite
- ✅ Seed data populated
- ✅ Ready to build features!

**Start coding with Phase 1: Week 3 tasks in the implementation plan!**

---

**Questions?** Check [MVP_Implementation_Plan.md](./MVP_Implementation_Plan.md) for detailed phase breakdown.
