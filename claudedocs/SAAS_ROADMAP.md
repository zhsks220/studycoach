# 스터디 코치 SaaS 비즈니스 전환 로드맵

## 📊 현재 시스템 분석

### 기술 스택
- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: SQLite (Prisma ORM)
- **Auth**: NextAuth.js
- **State**: Zustand, React Query
- **UI**: Radix UI, Tailwind CSS

### 현재 기능
- 학원(Academy) 관리
- 사용자(원장/강사/학부모/학생) 관리
- 학생 성적 관리
- 목표 설정 및 추적
- 출석 관리
- 기본 구독 시스템 (free plan)

### 현재 아키텍처 한계
- ❌ SQLite: 멀티 테넌트 확장성 부족
- ❌ 단일 서버: 트래픽 증가 대응 어려움
- ❌ 파일 저장소: 클라우드 저장소 미구축
- ❌ 결제 시스템: 미구현
- ⚠️ 보안: 엔터프라이즈급 보안 미비

---

## 🎯 SaaS 전환 5단계 로드맵

---

## 📍 Phase 1: MVP 검증 및 기반 구축 (1-2개월)

### 목표
✅ 유료 고객 10개 학원 확보
✅ 핵심 기능 안정화
✅ 초기 수익 모델 검증

### 1.1 기술 인프라 개선

#### Database Migration
```yaml
현재: SQLite
목표: PostgreSQL (Supabase 또는 Neon)

작업:
  - Prisma schema 수정 (provider: postgresql)
  - 멀티 테넌트 데이터 격리 전략 구현
  - 데이터 마이그레이션 스크립트 작성
  - 백업 및 복구 시스템 구축

우선순위: 🔴 CRITICAL
```

#### 구독 및 결제 시스템
```yaml
도구: Stripe 또는 Toss Payments

구현:
  - 구독 플랜 테이블 추가 (SubscriptionPlan, SubscriptionHistory)
  - 결제 API 통합
  - 웹훅 처리 (결제 성공/실패/취소)
  - 구독 업그레이드/다운그레이드 로직
  - 청구서 자동 발행

우선순위: 🔴 CRITICAL
```

### 1.2 비즈니스 모델 설계

#### 가격 전략 (한국 학원 시장 기준)
```yaml
Free Plan:
  가격: ₩0
  제한:
    - 학생 수: 최대 10명
    - 사용자: 2명 (원장 + 강사 1명)
    - 데이터 보관: 3개월
    - 기능: 기본 성적 관리, 출석 체크
  목적: 무료 체험 및 마케팅

Starter Plan:
  가격: ₩49,000/월
  제한:
    - 학생 수: 최대 30명
    - 사용자: 5명
    - 데이터 보관: 1년
    - 기능: 모든 기본 기능 + 보고서
  타겟: 소형 학원 (20-30명)

Professional Plan:
  가격: ₩99,000/월
  제한:
    - 학생 수: 최대 100명
    - 사용자: 무제한
    - 데이터 보관: 3년
    - 기능: 고급 분석, API 접근, 맞춤 보고서
  타겟: 중형 학원 (50-100명)

Enterprise Plan:
  가격: ₩299,000/월 (협의 가능)
  제한:
    - 학생 수: 무제한
    - 사용자: 무제한
    - 데이터 보관: 영구
    - 기능: 모든 기능 + 전담 지원 + 맞춤 개발
  타겟: 대형 학원, 프랜차이즈
```

### 1.3 필수 기능 개발

#### Tenant Isolation (멀티 테넌시)
```typescript
// 각 학원의 데이터를 완전히 격리
// Row-Level Security 구현

// Prisma Middleware 예시
prisma.$use(async (params, next) => {
  const academyId = getCurrentAcademyId(); // 세션에서 가져오기

  if (params.model !== 'Academy') {
    params.args.where = {
      ...params.args.where,
      academyId
    };
  }

  return next(params);
});
```

#### 구독 상태 검증 미들웨어
```typescript
// API 호출 시 구독 상태 확인
export async function requireActiveSubscription(req: Request) {
  const academy = await getAcademy(req);

  if (!academy.subscriptionEnd || academy.subscriptionEnd < new Date()) {
    throw new Error('구독이 만료되었습니다');
  }

  // 플랜별 제한 확인
  if (academy.subscriptionPlan === 'starter') {
    const studentCount = await prisma.student.count({
      where: { academyId: academy.id }
    });

    if (studentCount >= 30) {
      throw new Error('Starter 플랜의 학생 수 한도를 초과했습니다');
    }
  }
}
```

### 1.4 마케팅 및 검증

#### 랜딩 페이지
- 가치 제안 명확화
- 데모 요청 폼
- 가격 정보 투명하게 공개
- 고객 사례 (추후 추가)

#### 베타 테스터 모집
- 무료 3개월 제공
- 피드백 수집
- 사용성 개선

---

## 📍 Phase 2: 시장 확장 및 기능 고도화 (3-4개월)

### 목표
✅ 유료 고객 50개 학원
✅ ARR(연간 반복 매출) ₩30M 달성
✅ 제품-시장 적합성(PMF) 검증

### 2.1 고급 기능 개발

#### AI 기반 학습 분석
```yaml
기능:
  - 학생별 성적 추세 예측
  - 취약 과목 자동 분석
  - 맞춤 학습 계획 추천
  - 목표 달성 가능성 예측

기술:
  - OpenAI API 또는 자체 모델
  - 데이터 분석 파이프라인
  - 시각화 대시보드

가격: Professional Plan 이상
```

#### 학부모 포털
```yaml
기능:
  - 자녀 성적 실시간 조회
  - 출결 알림 (SMS/이메일)
  - 상담 예약 시스템
  - 과제 및 피드백 확인

기술:
  - 별도 학부모 대시보드
  - 알림 시스템 (Firebase Cloud Messaging)
  - 모바일 친화적 UI
```

#### 보고서 자동화
```yaml
기능:
  - 월간/분기별 성적표 자동 생성
  - 학원 운영 리포트 (원장용)
  - PDF 다운로드 및 이메일 발송
  - 맞춤 템플릿 설정

기술:
  - PDF 생성 라이브러리
  - 이메일 발송 (SendGrid, AWS SES)
  - 크론잡 스케줄링
```

### 2.2 기술 인프라 강화

#### 확장성
```yaml
Database:
  - 읽기 전용 레플리카 추가
  - 커넥션 풀 최적화
  - 인덱스 최적화

Caching:
  - Redis 도입
  - API 응답 캐싱
  - 세션 관리

CDN:
  - Vercel Edge Functions
  - 정적 자산 최적화
```

#### 보안 강화
```yaml
필수:
  - 2FA (Two-Factor Authentication)
  - IP 화이트리스트 (Enterprise)
  - 데이터 암호화 (at-rest, in-transit)
  - 정기 보안 감사
  - GDPR/개인정보보호법 준수
```

#### 모니터링
```yaml
도구:
  - Sentry (에러 추적)
  - Vercel Analytics (성능)
  - Mixpanel/Amplitude (사용자 행동)
  - Uptime monitoring (Better Uptime)

메트릭:
  - API 응답 시간
  - 에러율
  - 사용자 활성도
  - 구독 전환율
```

### 2.3 비즈니스 확장

#### 영업 전략
- 직접 영업 팀 구성
- 파트너십 (학원 프랜차이즈)
- 웨비나 및 온라인 데모
- SEO 및 콘텐츠 마케팅

#### 고객 성공팀
- 온보딩 프로세스 표준화
- 정기 체크인
- 헬프데스크 시스템 (Zendesk, Intercom)

---

## 📍 Phase 3: 엔터프라이즈 진출 (5-8개월)

### 목표
✅ 대형 학원/프랜차이즈 고객 확보
✅ ARR ₩100M 달성
✅ 시장 점유율 확대

### 3.1 엔터프라이즈 기능

#### Multi-Branch 관리
```yaml
기능:
  - 프랜차이즈 본사 대시보드
  - 지점별 성과 비교
  - 통합 리포팅
  - 지점 간 데이터 공유 설정

스키마:
  Branch (지점)
    - belongsTo Academy
    - 독립적인 사용자/학생 관리
    - 통합 분석 가능
```

#### API 및 통합
```yaml
기능:
  - REST API 제공
  - Webhook 지원
  - 타사 시스템 연동 (ERP, LMS)
  - Zapier/Make.com 통합

문서화:
  - OpenAPI/Swagger 스펙
  - 개발자 포털
  - SDK 제공 (Python, JavaScript)
```

#### 커스터마이징
```yaml
기능:
  - 브랜드 커스터마이징 (로고, 색상)
  - 맞춤 필드 추가
  - 워크플로우 자동화
  - 권한 관리 세분화 (RBAC)
```

### 3.2 기술 아키텍처 고도화

#### Microservices 전환 검토
```yaml
현재: Monolith (Next.js)
목표: Hybrid (Core는 Monolith, 일부 Microservices)

분리 후보:
  - Payment Service (결제)
  - Notification Service (알림)
  - Analytics Service (분석)
  - Report Service (보고서 생성)

이유:
  - 독립적 확장
  - 장애 격리
  - 팀 분리 용이
```

#### Infrastructure as Code
```yaml
도구: Terraform, Pulumi

관리:
  - Database 인프라
  - 서버리스 함수
  - CDN 설정
  - DNS 관리
  - 환경별 구성 (dev, staging, prod)
```

---

## 📍 Phase 4: 플랫폼 생태계 구축 (9-12개월)

### 목표
✅ 마켓플레이스 오픈
✅ 파트너 생태계 구축
✅ ARR ₩500M 달성

### 4.1 마켓플레이스

#### 앱 스토어
```yaml
기능:
  - 서드파티 플러그인 판매
  - 템플릿 마켓 (보고서, 대시보드)
  - 통합 앱 (출결 앱, 학부모 앱 등)

수익 모델:
  - 수수료 30% (앱 판매)
  - 무료 앱도 허용 (생태계 활성화)
```

#### 개발자 프로그램
```yaml
제공:
  - API 문서 및 SDK
  - 샌드박스 환경
  - 기술 지원
  - 수익 쉐어 프로그램

파트너:
  - 학원 관리 솔루션 업체
  - 교육 콘텐츠 제공자
  - 데이터 분석 전문가
```

### 4.2 고급 분석 플랫폼

#### BI 도구 통합
```yaml
기능:
  - 커스텀 대시보드 빌더
  - SQL 쿼리 인터페이스
  - 데이터 Export (CSV, Excel)
  - 실시간 데이터 스트리밍

도구:
  - Metabase 임베딩
  - 또는 자체 BI 엔진 개발
```

---

## 📍 Phase 5: 글로벌 확장 (12-18개월)

### 목표
✅ 해외 시장 진출 (일본, 동남아)
✅ ARR ₩1B 달성
✅ 시리즈 A 투자 유치

### 5.1 국제화

#### Multi-Language
```yaml
언어:
  - 한국어 (기본)
  - 영어
  - 일본어
  - 베트남어

기술:
  - i18n 라이브러리
  - 번역 관리 플랫폼 (Lokalise)
  - 로케일별 날짜/시간/통화 포맷
```

#### Multi-Currency
```yaml
결제:
  - 국가별 결제 수단 지원
  - 환율 자동 적용
  - 세금 계산 (VAT, GST)

통화:
  - KRW (한국)
  - USD (미국, 국제)
  - JPY (일본)
  - VND (베트남)
```

### 5.2 시장별 커스터마이징

#### 일본 시장
```yaml
특징:
  - 학년 표기법 (小学1年生 등)
  - 입시 시스템 (センター試験)
  - 법규 준수 (個人情報保護法)

파트너십:
  - 현지 학원 체인
  - 교육 플랫폼 연동
```

#### 동남아 시장
```yaml
특징:
  - 저렴한 가격대 (PPP 고려)
  - 모바일 우선 전략
  - 낮은 대역폭 최적화

로컬 파트너:
  - 현지 대리점
  - 교육부/정부 기관 협력
```

---

## 💰 수익 모델 상세

### ARR 목표 및 예측

#### Phase 1 (2개월)
```yaml
고객: 10개 학원
평균 단가: ₩49,000/월
MRR: ₩490,000
ARR: ₩5.88M
```

#### Phase 2 (4개월)
```yaml
고객: 50개 학원
평균 단가: ₩70,000/월 (업그레이드 포함)
MRR: ₩3.5M
ARR: ₩42M
```

#### Phase 3 (8개월)
```yaml
고객: 150개 학원
평균 단가: ₩120,000/월 (Enterprise 추가)
MRR: ₩18M
ARR: ₩216M
```

#### Phase 4 (12개월)
```yaml
고객: 500개 학원 + 마켓플레이스 수수료
MRR: ₩50M+
ARR: ₩600M+
```

### 추가 수익원

```yaml
Professional Services:
  - 맞춤 개발: ₩5-20M/프로젝트
  - 컨설팅: ₩2-5M/월
  - 교육 및 트레이닝: ₩500K/세션

Data Services:
  - 익명화된 데이터 판매 (연구 목적)
  - 업계 벤치마크 리포트

Advertising:
  - 교육 업체 광고 (신중하게)
```

---

## 🛠️ 기술 로드맵 요약

### 즉시 필요 (Phase 1)
```yaml
Backend:
  - SQLite → PostgreSQL 마이그레이션
  - Stripe/Toss 결제 통합
  - 멀티 테넌트 미들웨어
  - 구독 관리 시스템

Frontend:
  - 가격 페이지
  - 결제 플로우 UI
  - 구독 관리 대시보드

DevOps:
  - 프로덕션 배포 파이프라인
  - 데이터베이스 백업 자동화
  - 모니터링 셋업
```

### 중기 필요 (Phase 2-3)
```yaml
Features:
  - AI 분석 엔진
  - 학부모 포털
  - 보고서 자동화
  - API 개발

Infrastructure:
  - Redis 캐싱
  - CDN 최적화
  - 읽기 전용 레플리카

Security:
  - 2FA
  - 보안 감사
  - 규정 준수
```

### 장기 필요 (Phase 4-5)
```yaml
Platform:
  - 마켓플레이스
  - 개발자 API
  - Webhook 시스템

Scale:
  - Microservices 전환 검토
  - 글로벌 인프라 (멀티 리전)
  - BI 플랫폼

International:
  - i18n/l10n
  - 멀티 커런시
  - 로컬 규정 준수
```

---

## 📈 성공 지표 (KPI)

### 제품 지표
```yaml
Activation:
  - 회원가입 → 첫 학생 등록: 24시간 이내 80%
  - 무료 → 유료 전환율: 15%

Engagement:
  - DAU/MAU 비율: > 40%
  - 주간 활성 사용자: > 70%
  - 기능 사용률: 핵심 기능 50% 이상

Retention:
  - 월간 리텐션: > 85%
  - 연간 리텐션: > 70%
  - 구독 갱신률: > 90%
```

### 비즈니스 지표
```yaml
Revenue:
  - MRR 성장률: > 20%/월 (초기)
  - ARR: 18개월 내 ₩1B
  - LTV/CAC 비율: > 3:1

Customer:
  - Churn Rate: < 5%/월
  - NPS (Net Promoter Score): > 50
  - 평균 계약 기간: > 24개월
```

---

## ⚠️ 리스크 및 대응

### 기술 리스크
```yaml
Database 마이그레이션 실패:
  대응: 철저한 테스트, 롤백 계획, 단계적 마이그레이션

보안 사고:
  대응: 정기 감사, 침투 테스트, 사고 대응 매뉴얼

확장성 문제:
  대응: 부하 테스트, 점진적 확장, 모니터링 강화
```

### 비즈니스 리스크
```yaml
경쟁사 출현:
  대응: 빠른 혁신, 고객 락인 (스위칭 비용), 차별화

고객 이탈:
  대응: 고객 성공 팀, 피드백 루프, 지속적 개선

규제 변화:
  대응: 법무 자문, 규정 준수 체크리스트, 유연한 아키텍처
```

---

## 🎯 다음 단계 (즉시 실행)

### Week 1-2: 기반 작업
1. PostgreSQL 마이그레이션 준비
2. Stripe 계정 설정 및 API 키 발급
3. 가격 전략 최종 확정
4. 랜딩 페이지 디자인

### Week 3-4: 개발
1. Database migration 스크립트 작성 및 테스트
2. 결제 API 통합
3. 구독 관리 UI 개발
4. 멀티 테넌트 미들웨어 구현

### Week 5-6: 테스트 및 배포
1. 베타 테스터 모집 (5-10개 학원)
2. 통합 테스트 및 QA
3. 프로덕션 배포
4. 모니터링 셋업

### Week 7-8: 마케팅 및 영업
1. 공식 출시 (Product Hunt, SNS)
2. 직접 영업 시작
3. 피드백 수집 및 개선
4. 첫 유료 고객 확보

---

## 📚 참고 자료

- [Stripe 결제 통합 가이드](https://stripe.com/docs)
- [SaaS 메트릭 가이드](https://www.saastr.com/resources/)
- [멀티 테넌트 아키텍처 베스트 프랙티스](https://docs.aws.amazon.com/whitepapers/latest/saas-architecture-fundamentals/multi-tenant-architecture.html)
- [한국 개인정보보호법 가이드](https://www.privacy.go.kr/)

---

**작성일**: 2025-11-03
**버전**: 1.0.0
**다음 리뷰**: Phase 1 완료 후
