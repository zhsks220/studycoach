# StudyCoach 배포 가이드

## 개요
이 가이드는 StudyCoach를 **Vercel + Supabase** 무료 티어로 배포하는 방법을 설명합니다.

---

## 1단계: Supabase 데이터베이스 설정 (5분)

### 1.1 Supabase 가입
1. [https://supabase.com](https://supabase.com) 접속
2. GitHub 계정으로 가입 (가장 빠름)

### 1.2 새 프로젝트 생성
1. Dashboard에서 **New Project** 클릭
2. 설정:
   - **Name**: `studycoach` (원하는 이름)
   - **Database Password**: 강력한 비밀번호 설정 → **꼭 메모!**
   - **Region**: `Northeast Asia (Seoul)` 선택
3. **Create new project** 클릭

### 1.3 데이터베이스 연결 정보 복사
프로젝트 생성 후 (1-2분 소요):

1. 왼쪽 메뉴 **Settings** → **Database** 클릭
2. **Connection string** 섹션에서:

**Transaction pooler (Port 6543)** - `DATABASE_URL`용:
```
postgresql://postgres.[project-ref]:[password]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Session pooler (Port 5432)** - `DIRECT_URL`용:
```
postgresql://postgres.[project-ref]:[password]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres
```

⚠️ `[password]` 부분을 생성 시 설정한 비밀번호로 교체!

---

## 2단계: Vercel 배포 (5분)

### 2.1 Vercel 가입
1. [https://vercel.com](https://vercel.com) 접속
2. **Continue with GitHub** 클릭

### 2.2 프로젝트 Import
1. Dashboard에서 **Add New** → **Project**
2. GitHub repository에서 `studycoach` 선택
3. **Import** 클릭

### 2.3 환경변수 설정
**Environment Variables** 섹션에서 추가:

| Name | Value |
|------|-------|
| `DATABASE_URL` | (Supabase Transaction pooler URL) |
| `DIRECT_URL` | (Supabase Session pooler URL) |
| `NEXTAUTH_SECRET` | (아래 명령어로 생성) |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` (배포 후 수정) |

**NEXTAUTH_SECRET 생성 방법**:
```bash
# 터미널에서 실행
openssl rand -base64 32
```
또는 [https://generate-secret.vercel.app/32](https://generate-secret.vercel.app/32) 접속

### 2.4 배포 실행
1. **Deploy** 클릭
2. 약 2-3분 대기
3. 배포 완료 시 URL 확인 (예: `https://studycoach-xxx.vercel.app`)

### 2.5 NEXTAUTH_URL 업데이트
1. Vercel Dashboard → 프로젝트 → **Settings** → **Environment Variables**
2. `NEXTAUTH_URL` 값을 실제 배포 URL로 수정
3. **Redeploy** 실행

---

## 3단계: 데이터베이스 마이그레이션 (2분)

### 로컬에서 실행:
```bash
# 프로젝트 폴더에서
npx prisma db push
```

이 명령어가 Supabase에 테이블을 생성합니다.

---

## 4단계: 첫 계정 생성

1. 배포된 URL 접속 (예: `https://studycoach-xxx.vercel.app`)
2. **무료로 시작하기** 클릭
3. 학원 정보 및 관리자 계정 생성
4. 로그인하여 사용 시작!

---

## 문제 해결

### 배포 실패 시
- Vercel 빌드 로그 확인
- 환경변수가 모두 설정되었는지 확인
- `DATABASE_URL`에 실제 비밀번호가 들어갔는지 확인

### 데이터베이스 연결 실패 시
- Supabase 프로젝트가 활성 상태인지 확인
- Connection string에서 `[password]`를 실제 비밀번호로 교체했는지 확인
- `?pgbouncer=true` 파라미터 확인

### 로그인 실패 시
- `NEXTAUTH_SECRET`이 설정되었는지 확인
- `NEXTAUTH_URL`이 실제 배포 URL과 일치하는지 확인

---

## 비용 안내

| 서비스 | 무료 한도 | 예상 사용량 (학원 1곳) |
|--------|----------|----------------------|
| Vercel | 100GB 대역폭/월 | ~1GB/월 |
| Supabase | 500MB DB, 50K 요청/월 | ~50MB, ~10K 요청/월 |

→ **학원 1곳 테스트는 무료 티어로 충분합니다!**

---

## 연락처
문제 발생 시 GitHub Issues에 등록해주세요.
