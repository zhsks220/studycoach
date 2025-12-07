import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create Academy
  const academy = await prisma.academy.create({
    data: {
      name: '스마트학원',
      address: '서울시 강남구 테헤란로 123',
      phone: '02-1234-5678',
      subscriptionPlan: 'BASIC',
    },
  })
  console.log('✅ Academy created:', academy.name)

  // Create Users
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
  console.log('✅ Admin user created:', adminUser.email)

  const teacherUser = await prisma.user.create({
    data: {
      email: 'teacher@studycoach.com',
      name: '이선생',
      role: 'TEACHER',
      password: hashedPassword,
      academyId: academy.id,
    },
  })
  console.log('✅ Teacher user created:', teacherUser.email)

  const parentUser = await prisma.user.create({
    data: {
      email: 'parent@studycoach.com',
      name: '박엄마',
      role: 'PARENT',
      password: hashedPassword,
      academyId: academy.id,
    },
  })
  console.log('✅ Parent user created:', parentUser.email)

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
  console.log('✅ Student created:', student1.name)

  const student2 = await prisma.student.create({
    data: {
      name: '이영희',
      grade: '중3',
      birthDate: new Date('2008-07-22'),
      phone: '010-2345-6789',
      academyId: academy.id,
    },
  })
  console.log('✅ Student created:', student2.name)

  const student3 = await prisma.student.create({
    data: {
      name: '박민수',
      grade: '중1',
      birthDate: new Date('2010-11-03'),
      academyId: academy.id,
    },
  })
  console.log('✅ Student created:', student3.name)

  const student4 = await prisma.student.create({
    data: {
      name: '최지혜',
      grade: '중2',
      birthDate: new Date('2009-08-20'),
      phone: '010-3456-7890',
      academyId: academy.id,
    },
  })
  console.log('✅ Student created:', student4.name)

  const student5 = await prisma.student.create({
    data: {
      name: '정우진',
      grade: '중3',
      birthDate: new Date('2008-12-05'),
      academyId: academy.id,
    },
  })
  console.log('✅ Student created:', student5.name)

  // Create Grades for multiple students
  const subjects = ['수학', '영어', '국어', '과학', '사회']
  const exams = [
    { name: '1학기 중간고사', date: new Date('2024-05-10'), type: '정기고사' },
    { name: '1학기 기말고사', date: new Date('2024-07-15'), type: '정기고사' },
    { name: '2학기 중간고사', date: new Date('2024-10-12'), type: '정기고사' },
    { name: '모의고사 1회', date: new Date('2024-06-20'), type: '모의고사' },
    { name: '모의고사 2회', date: new Date('2024-09-25'), type: '모의고사' },
  ]

  const students = [student1, student2, student3, student4, student5]
  let gradeCount = 0

  for (const student of students) {
    for (const exam of exams) {
      for (const subject of subjects) {
        const baseScore = Math.floor(Math.random() * 20) + 70 // 70-90
        await prisma.grade.create({
          data: {
            examName: exam.name,
            examDate: exam.date,
            examType: exam.type,
            subject,
            score: baseScore + Math.floor(Math.random() * 10), // add variance
            maxScore: 100,
            studentId: student.id,
          },
        })
        gradeCount++
      }
    }
  }
  console.log(`✅ Created ${gradeCount} grade records`)

  // Create Goals
  const goals = [
    {
      title: '수학 90점 달성',
      description: '다음 시험에서 수학 90점 이상 받기',
      targetValue: 90,
      currentValue: 85,
      unit: '점',
      deadline: new Date('2024-12-31'),
      studentId: student1.id,
    },
    {
      title: '영어 평균 85점 유지',
      description: '연간 영어 평균 85점 이상 유지하기',
      targetValue: 85,
      currentValue: 87,
      unit: '점',
      deadline: new Date('2024-12-31'),
      studentId: student1.id,
    },
    {
      title: '과학 성적 10점 향상',
      description: '이번 학기 과학 성적 10점 올리기',
      targetValue: 10,
      currentValue: 7,
      unit: '점',
      deadline: new Date('2024-11-30'),
      studentId: student2.id,
    },
    {
      title: '전과목 평균 80점',
      description: '모든 과목 평균 80점 이상 달성',
      targetValue: 80,
      currentValue: 75,
      unit: '점',
      deadline: new Date('2024-12-31'),
      studentId: student3.id,
    },
    {
      title: '국어 A등급 받기',
      description: '국어 성적 A등급(90점 이상) 달성',
      targetValue: 90,
      currentValue: 82,
      unit: '점',
      deadline: new Date('2024-11-15'),
      studentId: student4.id,
    },
    {
      title: '수능 목표 점수',
      description: '수능 모의고사 목표 점수 달성',
      targetValue: 350,
      currentValue: 320,
      unit: '점',
      deadline: new Date('2024-11-14'),
      studentId: student5.id,
    },
  ]

  for (const goal of goals) {
    await prisma.goal.create({ data: goal })
  }
  console.log(`✅ Created ${goals.length} goals`)

  // Create Attendance Records
  const today = new Date()
  let attendanceCount = 0

  for (const student of [student1, student2, student3]) {
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      // 90% present, 5% late, 5% absent
      const rand = Math.random()
      let status: 'PRESENT' | 'LATE' | 'ABSENT' = 'PRESENT'
      if (rand < 0.05) status = 'ABSENT'
      else if (rand < 0.1) status = 'LATE'

      await prisma.attendance.create({
        data: {
          date,
          status,
          studentId: student.id,
        },
      })
      attendanceCount++
    }
  }
  console.log(`✅ Created ${attendanceCount} attendance records`)

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📝 Login Credentials:\n')
  console.log('Admin:')
  console.log('  Email: admin@studycoach.com')
  console.log('  Password: password123\n')
  console.log('Teacher:')
  console.log('  Email: teacher@studycoach.com')
  console.log('  Password: password123\n')
  console.log('Parent:')
  console.log('  Email: parent@studycoach.com')
  console.log('  Password: password123\n')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
