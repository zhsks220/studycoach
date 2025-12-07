/**
 * 학생 능력치 계산 로직
 */

import type { AbilityData } from '@/components/charts/student-ability-radar'

export interface GradeRecord {
  subject: string
  score: number
  examType: string
  examDate: Date
}

/**
 * 과목별 최신 평균 점수 계산
 */
export function calculateSubjectAbilities(grades: GradeRecord[]): AbilityData[] {
  // 과목별로 그룹화
  const subjectMap = new Map<string, number[]>()

  grades.forEach((grade) => {
    if (!subjectMap.has(grade.subject)) {
      subjectMap.set(grade.subject, [])
    }
    subjectMap.get(grade.subject)!.push(grade.score)
  })

  // 각 과목의 평균 계산
  const abilities: AbilityData[] = []

  subjectMap.forEach((scores, subject) => {
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
    abilities.push({
      subject,
      score: Math.round(average),
      fullMark: 100,
    })
  })

  // 과목명 기준 정렬 (주요 과목 우선)
  const subjectOrder = ['수학', '영어', '국어', '과학', '사회']

  abilities.sort((a, b) => {
    const indexA = subjectOrder.indexOf(a.subject)
    const indexB = subjectOrder.indexOf(b.subject)

    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB
    }
    if (indexA !== -1) return -1
    if (indexB !== -1) return 1

    return a.subject.localeCompare(b.subject, 'ko')
  })

  return abilities
}

/**
 * 최근 N개 시험 기준 능력치 계산
 */
export function calculateRecentAbilities(
  grades: GradeRecord[],
  recentCount: number = 3
): AbilityData[] {
  // 날짜 기준 정렬 (최신순)
  const sortedGrades = [...grades].sort(
    (a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime()
  )

  // 과목별로 최근 N개 추출
  const subjectMap = new Map<string, number[]>()

  sortedGrades.forEach((grade) => {
    if (!subjectMap.has(grade.subject)) {
      subjectMap.set(grade.subject, [])
    }
    const scores = subjectMap.get(grade.subject)!
    if (scores.length < recentCount) {
      scores.push(grade.score)
    }
  })

  // 각 과목의 평균 계산
  const abilities: AbilityData[] = []

  subjectMap.forEach((scores, subject) => {
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
    abilities.push({
      subject,
      score: Math.round(average),
      fullMark: 100,
    })
  })

  return abilities
}

/**
 * 학기별 능력치 계산
 */
export function calculateSemesterAbilities(
  grades: GradeRecord[],
  semester: string
): AbilityData[] {
  const semesterGrades = grades.filter((grade) => {
    // 시험명이나 학기 정보에서 학기 추출 (예: "2025-1학기" 또는 "1학기 중간고사")
    return grade.examType.includes(semester)
  })

  return calculateSubjectAbilities(semesterGrades)
}
