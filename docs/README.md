# 🍽️ AI 식단 관리 서비스 프로토타입 개발 문서

## 프로젝트 개요

**원클릭 AI 식단 기록 서비스 프로토타입**은 "마찰 없는 기록(Frictionless Logging)" 철학을 바탕으로 한 혁신적인 식단 관리 솔루션입니다. 사용자는 단 하나의 버튼만 눌러 음식 사진을 찍으면, AI 분석부터 데이터베이스 저장까지 모든 과정이 자동으로 처리됩니다.

### 🎯 핵심 목표
- **Zero Friction**: 사용자 추가 입력 없이 사진 한 장으로 완전한 식단 기록
- **Smart Analysis**: AI 기반 음식 인식 및 영양성분 자동 분석
- **Time-based Classification**: 업로드 시각 기반 자동 끼니 분류 (아침/점심/저녁/간식)

### 🛠️ 기술 스택
- **Frontend/Backend**: Next.js 14 (App Router) + TypeScript
- **Database/Auth**: Supabase (PostgreSQL + Authentication + Storage)
- **AI/Automation**: n8n (웹훅 기반 AI 분석 워크플로우)
- **UI Framework**: TailwindCSS + shadcn/ui
- **Deployment**: Vercel

---

## 📁 문서 구조

### 📋 [development-tasks.md](./development-tasks.md)
**전체 개발 태스크 목록과 진행 상황을 한눈에 볼 수 있는 마스터 체크리스트**
- 15개 주요 태스크와 세부 subtask들
- 의존성 관계 및 우선순위 정보
- 진행률 추적 및 담당자 할당

### 🏗️ [project-setup-checklist.md](./project-setup-checklist.md)
**프로젝트 초기 설정 완전 가이드**
- Next.js 14 + TypeScript 프로젝트 생성
- TailwindCSS + shadcn/ui 설정
- 개발 도구 및 코드 품질 설정
- 폴더 구조 및 환경변수 설정

### 🛢️ [supabase-setup-guide.md](./supabase-setup-guide.md)
**Supabase 백엔드 설정 상세 가이드**
- Supabase 프로젝트 생성 및 설정
- 데이터베이스 스키마 설계 (food_logs 테이블)
- RLS (Row Level Security) 정책 설정
- Storage 버킷 설정 및 Next.js 연동

### 🔐 [authentication-implementation.md](./authentication-implementation.md)
**사용자 인증 시스템 구현 가이드**
- Supabase Auth 설정 및 타입 정의
- AuthContext 및 Provider 구현
- 회원가입/로그인 페이지 및 컴포넌트
- 보호된 라우트 및 인증 가드 구현

### 🎯 [core-features-checklist.md](./core-features-checklist.md)
**핵심 기능 구현 체크리스트**
- 이미지 업로드 컴포넌트 (카메라/갤러리 지원)
- n8n 웹훅 연동 서비스 (AI 분석 요청/응답)
- 식단 기록 메인 페이지 (원클릭 플로우)
- 식단 데이터 조회 API 및 대시보드

### 🚀 [deployment-optimization.md](./deployment-optimization.md)
**배포 및 최적화 완전 가이드**
- PWA 설정 및 모바일 UX 최적화
- 에러 처리 및 사용자 피드백 시스템
- 성능 최적화 및 모니터링 설정
- Vercel 프로덕션 배포

---

## 🗂️ 태스크 분류 및 의존성

### Phase 1: 기반 설정 (Tasks 1-4)
```
1. 프로젝트 환경 설정 ← 시작점
2. Supabase 설정 ← Task 1
3. 데이터베이스 스키마 ← Task 2
4. Storage 설정 ← Task 2
```

### Phase 2: 인증 및 UI (Tasks 5-6)
```
5. 사용자 인증 시스템 ← Task 2
6. 메인 레이아웃 ← Tasks 1, 5
```

### Phase 3: 핵심 기능 (Tasks 7-9)
```
7. 이미지 업로드 ← Tasks 4, 6
8. n8n 웹훅 연동 ← Task 7
9. 메인 페이지 ← Task 8
```

### Phase 4: 데이터 표시 (Tasks 10-12)
```
10. 데이터 조회 API ← Tasks 3, 5
11. 대시보드 페이지 ← Task 10
12. 상세 정보 컴포넌트 ← Task 11
```

### Phase 5: 완성 및 배포 (Tasks 13-15)
```
13. 에러 처리 시스템 ← Tasks 9, 11
14. 모바일 UX 최적화 ← Task 12
15. 테스트 및 배포 ← Tasks 13, 14
```

---

## 📊 진행 상황 대시보드

### 🔄 현재 상태: 프로토타입 UI 구현 완료
- [x] **PRD 분석 및 태스크 분해**
- [x] **아키텍처 설계**
- [x] **의존성 관계 정의**
- [x] **문서화 완료**
- [x] **메인 서비스 페이지 구현**
- [x] **식단 기록 플로우 UI 구현**
- [x] **대시보드 및 데이터 표시 구현**

### 📈 개발 단계별 체크포인트

#### ✅ 설계 단계 (완료)
- [x] 요구사항 분석
- [x] 기술 스택 선정
- [x] 데이터베이스 스키마 설계
- [x] API 명세 정의
- [x] 사용자 플로우 설계

#### 🏗️ 개발 단계 (진행 중)
- [ ] Phase 1: 기반 설정 (1/4) 
- [ ] Phase 2: 인증 및 UI (1/2) ✅ 메인 레이아웃 완료
- [x] Phase 3: 핵심 기능 (1/3) ✅ 메인 페이지 UI 완료
- [x] Phase 4: 데이터 표시 (1/3) ✅ 대시보드 UI 완료
- [ ] Phase 5: 완성 및 배포 (0/3)

#### 🚀 배포 단계 (예정)
- [ ] 스테이징 환경 테스트
- [ ] 프로덕션 배포
- [ ] 모니터링 설정
- [ ] 사용자 피드백 수집

---

## 🎯 개발 우선순위

### 🔥 즉시 시작 (Critical Path)
1. **Task 1**: 프로젝트 환경 설정 ([가이드](./project-setup-checklist.md))
2. **Task 2**: Supabase 설정 ([가이드](./supabase-setup-guide.md))
3. **Task 3**: 데이터베이스 스키마 생성

### ⚡ 병렬 진행 가능
- **Task 4**: Storage 설정 (Task 2 완료 후)
- **Task 5**: 인증 시스템 ([가이드](./authentication-implementation.md))

### 📱 핵심 기능 개발
- **Task 7-9**: 이미지 업로드 → n8n 연동 → 메인 페이지 ([가이드](./core-features-checklist.md))

---

## 🛠️ 개발 환경 요구사항

### 필수 도구
- **Node.js**: 18.17.0 이상
- **npm**: 9.0.0 이상
- **Git**: 버전 관리
- **VSCode**: 권장 에디터 + Extension Pack

### 권장 VSCode Extensions
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag"
  ]
}
```

### 개발 계정 설정
- **Supabase**: 프로젝트 생성 및 API 키 발급
- **Vercel**: 배포용 계정 (GitHub 연동 권장)
- **n8n**: 웹훅 워크플로우 설정

---

## 📞 n8n 워크플로우 명세

### 웹훅 엔드포인트
```
POST https://your-n8n-instance.com/webhook/food-analysis
Content-Type: multipart/form-data

{
  "image": File,
  "userId": string
}
```

### 처리 단계
1. **끼니 자동 판별** (시간 기반)
   - 04:00-10:59 → 아침
   - 11:00-16:59 → 점심
   - 17:00-21:59 → 저녁
   - 22:00-03:59 → 간식

2. **AI 이미지 분석** (외부 서비스)
3. **Supabase Storage 업로드**
4. **데이터베이스 저장**
5. **결과 응답**

### 응답 형식
```typescript
interface SuccessResponse {
  success: true
  data: {
    items: FoodItem[]
    summary: NutrientSummary
  }
}

interface ErrorResponse {
  success: false
  error: {
    code: 'NO_FOOD_DETECTED' | 'AI_SERVICE_ERROR' | 'TIMEOUT'
    message: string
  }
}
```

---

## 🔒 보안 고려사항

### 데이터 보안
- **RLS (Row Level Security)**: 모든 테이블에 적용
- **API 키 관리**: 환경변수 분리, .gitignore 포함
- **이미지 업로드**: 파일 타입 및 크기 제한

### 인증 보안
- **JWT 토큰**: Supabase Auth 기본 보안
- **세션 관리**: 자동 갱신 및 만료 처리
- **HTTPS**: 모든 통신 암호화

---

## 📈 성능 목표

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5초
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### 모바일 성능
- **첫 화면 로딩**: < 3초 (3G 네트워크)
- **이미지 업로드**: < 10초 (5MB 이미지)
- **AI 분석 응답**: < 30초

---

## 🤝 협업 가이드

### 브랜치 전략
```
main ← 프로덕션 배포
├── develop ← 개발 통합
├── feature/task-1-project-setup
├── feature/task-2-supabase-setup
└── feature/task-5-authentication
```

### 커밋 컨벤션
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드 업무 수정
```

### 이슈 관리
- **GitHub Issues**: 태스크별 이슈 생성
- **Labels**: `task-1`, `bug`, `enhancement`, `documentation`
- **Milestones**: Phase별 마일스톤 설정

---

## 📞 지원 및 문의

### 기술 문서
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Supabase 공식 문서](https://supabase.com/docs)
- [TailwindCSS 문서](https://tailwindcss.com/docs)
- [shadcn/ui 컴포넌트](https://ui.shadcn.com/)

### 커뮤니티
- [Next.js Discord](https://discord.gg/nextjs)
- [Supabase Discord](https://discord.gg/supabase)

---

## 📋 빠른 시작 가이드

### 1. 환경 설정
```bash
# 프로젝트 생성
npx create-next-app@latest foodn --typescript --tailwind --eslint --app

# 의존성 설치
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# 개발 서버 시작
npm run dev
```

### 2. 다음 단계
1. [프로젝트 설정 가이드](./project-setup-checklist.md) 따라하기
2. [Supabase 설정](./supabase-setup-guide.md) 완료하기
3. [development-tasks.md](./development-tasks.md)에서 체크박스 체크하며 진행

---

**프로젝트 생성일**: 2025-01-27  
**최종 업데이트**: 2025-01-27  
**버전**: 1.0.0  
**상태**: 개발 준비 완료 ✅
