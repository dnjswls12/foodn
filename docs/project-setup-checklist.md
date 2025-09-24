# 🏗️ 프로젝트 설정 및 환경 구성 체크리스트

## 개요
프로젝트 초기 설정부터 기본 환경 구성까지의 체크리스트입니다.

---

## 1️⃣ Next.js 프로젝트 초기 설정

### 기본 프로젝트 생성
- [x] Next.js 14 프로젝트 생성
  ```bash
  npx create-next-app@latest foodn --typescript --tailwind --eslint --app --src-dir --import-alias="@/*"
  ```
- [x] 프로젝트 디렉토리로 이동
  ```bash
  cd foodn
  ```
- [x] 기본 실행 테스트
  ```bash
  npm run dev
  ```

### package.json 검토 및 수정
- [x] 프로젝트 정보 업데이트
  - [x] name: "foodn"
  - [x] version: "0.1.0"  
  - [ ] description: "원클릭 AI 식단 기록 서비스"
- [x] scripts 섹션 확인
- [x] dependencies 검토

### Next.js 설정 파일 구성
- [ ] **next.config.ts** 기본 설정
  ```typescript
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '*.supabase.co',
        },
      ],
    },
  };
  
  export default nextConfig;
  ```

### TypeScript 설정 최적화
- [x] **tsconfig.json** 설정 검토
  - [x] strict 모드 활성화 확인
  - [x] baseUrl 및 paths 설정 확인
  - [x] lib 배열에 필요한 라이브러리 포함 확인

---

## 2️⃣ UI 라이브러리 및 스타일링 설정

### TailwindCSS 설정
- [x] TailwindCSS 설치 (create-next-app으로 이미 설치됨)
- [ ] **tailwind.config.ts** 커스터마이징
  ```typescript
  import type { Config } from "tailwindcss";
  
  const config: Config = {
    darkMode: ["class"],
    content: [
      "./pages/**/*.{ts,tsx}",
      "./components/**/*.{ts,tsx}",
      "./app/**/*.{ts,tsx}",
      "./src/**/*.{ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          // 프로젝트 컬러 팔레트 정의
          primary: {
            50: '#f0f9ff',
            500: '#0ea5e9',
            600: '#0284c7',
          },
          // 추가 컬러 설정
        },
      },
    },
    plugins: [require("tailwindcss-animate")],
  };
  
  export default config;
  ```

### shadcn/ui 설정
- [ ] shadcn/ui 초기화
  ```bash
  npx shadcn-ui@latest init
  ```
- [ ] 기본 컴포넌트 설치
  ```bash
  npx shadcn-ui@latest add button
  npx shadcn-ui@latest add input
  npx shadcn-ui@latest add card
  npx shadcn-ui@latest add toast
  npx shadcn-ui@latest add dialog
  npx shadcn-ui@latest add progress
  ```

### 글로벌 CSS 설정
- [x] **app/globals.css** 커스터마이징
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  
  @layer base {
    :root {
      --background: 0 0% 100%;
      --foreground: 222.2 84% 4.9%;
      /* 추가 CSS 변수 정의 */
    }
    
    .dark {
      --background: 222.2 84% 4.9%;
      --foreground: 210 40% 98%;
      /* 다크모드 변수 정의 */
    }
  }
  
  @layer base {
    * {
      @apply border-border;
    }
    
    body {
      @apply bg-background text-foreground;
    }
  }
  ```

### 다크모드 설정 (선택사항)
- [ ] next-themes 라이브러리 설치
  ```bash
  npm install next-themes
  ```
- [ ] ThemeProvider 컴포넌트 생성
- [ ] 다크모드 토글 버튼 구현

---

## 3️⃣ 개발 도구 및 코드 품질 설정

### 환경변수 설정
- [ ] **.env.local** 파일 생성
  ```
  # Supabase
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  
  # n8n Webhook
  N8N_WEBHOOK_URL=your_n8n_webhook_url
  
  # 기타 환경변수
  NEXTAUTH_SECRET=your_secret_key
  ```

- [ ] **.env.example** 파일 생성
  ```
  # Supabase
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  
  # n8n Webhook
  N8N_WEBHOOK_URL=
  
  # 기타 환경변수
  NEXTAUTH_SECRET=
  ```

### Prettier 설정
- [ ] **.prettierrc** 파일 생성
  ```json
  {
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 80,
    "tabWidth": 2,
    "useTabs": false
  }
  ```

- [ ] **.prettierignore** 파일 생성
  ```
  node_modules
  .next
  dist
  build
  ```

### ESLint 설정 커스터마이징
- [ ] **.eslintrc.json** 수정
  ```json
  {
    "extends": [
      "next/core-web-vitals",
      "prettier"
    ],
    "rules": {
      "prefer-const": "error",
      "no-unused-vars": "warn",
      "@typescript-eslint/no-unused-vars": "warn"
    }
  }
  ```

### Git 설정
- [ ] **.gitignore** 파일 검토 및 추가
  ```
  # 기본 Next.js gitignore 내용
  
  # 환경변수
  .env*.local
  
  # 에디터
  .vscode/
  .idea/
  
  # OS
  .DS_Store
  Thumbs.db
  
  # 로그
  *.log
  ```

---

## 4️⃣ 프로젝트 폴더 구조 설정

### 기본 폴더 구조 생성
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 라우트 그룹
│   ├── dashboard/         # 대시보드 페이지
│   ├── globals.css        # 글로벌 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈 페이지
├── components/            # 재사용 가능한 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── auth/             # 인증 관련 컴포넌트
│   ├── food/             # 식단 관련 컴포넌트
│   └── layout/           # 레이아웃 컴포넌트
├── lib/                  # 유틸리티 및 설정
│   ├── supabase.ts       # Supabase 클라이언트
│   ├── utils.ts          # 유틸리티 함수
│   └── types.ts          # 타입 정의
├── hooks/                # 커스텀 훅
└── context/              # React Context
```

### 폴더별 생성 체크리스트
- [ ] **src/components/ui/** 폴더 생성 (shadcn/ui 컴포넌트용)
- [ ] **src/components/auth/** 폴더 생성
- [ ] **src/components/food/** 폴더 생성
- [ ] **src/components/layout/** 폴더 생성
- [ ] **src/lib/** 폴더 생성
- [ ] **src/hooks/** 폴더 생성
- [ ] **src/context/** 폴더 생성
- [ ] **src/types/** 폴더 생성

---

## 5️⃣ 추가 라이브러리 설치

### 필수 라이브러리
- [ ] Supabase 관련
  ```bash
  npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
  ```

- [x] 유틸리티 라이브러리
  ```bash
  npm install clsx tailwind-merge class-variance-authority
  npm install lucide-react  # 아이콘 라이브러리 (설치됨)
  npm install date-fns      # 날짜 처리
  ```

- [ ] 폼 관리
  ```bash
  npm install react-hook-form @hookform/resolvers zod
  ```

### 개발 도구
- [ ] 타입 체크 도구
  ```bash
  npm install -D @types/node
  ```

---

## ✅ 설정 완료 확인

### 기본 동작 테스트
- [ ] `npm run dev` 정상 실행 확인
- [ ] `npm run build` 빌드 성공 확인
- [ ] `npm run lint` ESLint 통과 확인
- [ ] TypeScript 컴파일 에러 없음 확인

### 파일 검증
- [ ] 모든 설정 파일이 올바르게 생성됨
- [ ] 환경변수 파일 설정 완료
- [ ] 폴더 구조 정상 생성

---

## 📝 다음 단계
프로젝트 기본 설정이 완료되면 다음 단계로 진행:
1. **Supabase 프로젝트 설정 및 연동** (Task 2)
2. **데이터베이스 스키마 설계** (Task 3)

---

**완료 날짜**: _____ | **담당자**: _____ | **검토자**: _____
