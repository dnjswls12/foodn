# 🚀 배포 및 최적화 가이드

## 개요
모바일 UX 최적화, 성능 개선, 프로덕션 배포까지의 완전한 가이드입니다.

---

## 📱 모바일 UX 최적화 (Task 14)

### PWA (Progressive Web App) 설정
- [ ] **14.1.1** manifest.json 파일 생성
  ```json
  {
    "name": "AI 식단 관리",
    "short_name": "FoodTracker",
    "description": "원클릭 AI 식단 기록 서비스",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#0ea5e9",
    "orientation": "portrait",
    "icons": [
      {
        "src": "/icons/icon-192x192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "maskable"
      },
      {
        "src": "/icons/icon-512x512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any"
      }
    ]
  }
  ```

- [ ] **14.1.2** Service Worker 구현
  ```typescript
  // public/sw.js
  const CACHE_NAME = 'food-tracker-v1'
  const urlsToCache = [
    '/',
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/manifest.json'
  ]
  
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(urlsToCache))
    )
  })
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request)
        .then((response) => response || fetch(event.request))
    )
  })
  ```

- [ ] **14.1.3** next-pwa 설정
  ```bash
  npm install next-pwa
  ```
  
  ```typescript
  // next.config.js
  const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development'
  })
  
  module.exports = withPWA({
    // 기존 설정
  })
  ```

### 모바일 뷰포트 최적화
- [ ] **14.2.1** 메타 태그 설정
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <meta name="theme-color" content="#0ea5e9" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  ```

- [ ] **14.2.2** 반응형 디자인 검증
  - [ ] iPhone SE (375px) 테스트
  - [ ] iPhone 12/13 (390px) 테스트
  - [ ] iPhone 14 Pro Max (428px) 테스트
  - [ ] Samsung Galaxy S21 (360px) 테스트
  - [ ] iPad (768px) 테스트

- [ ] **14.2.3** 세이프 에어리어 대응
  ```css
  .safe-area {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
  ```

### 터치 인터랙션 최적화
- [ ] **14.3.1** 터치 타겟 크기
  - [ ] 최소 44x44dp 터치 영역
  - [ ] 버튼 간 충분한 간격 (8px 이상)
  - [ ] 스와이프 제스처 지원

- [ ] **14.3.2** 터치 피드백
  ```css
  .button {
    @apply transition-all duration-150;
    
    &:active {
      @apply scale-95 bg-opacity-80;
    }
    
    &:focus-visible {
      @apply ring-2 ring-offset-2 ring-blue-500;
    }
  }
  ```

- [ ] **14.3.3** 스크롤 성능 개선
  ```css
  .scrollable {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }
  ```

### 로딩 성능 최적화
- [ ] **14.4.1** 이미지 최적화
  ```typescript
  // next.config.js
  module.exports = {
    images: {
      formats: ['image/webp', 'image/avif'],
      minimumCacheTTL: 60,
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    },
  }
  ```

- [ ] **14.4.2** 코드 스플리팅
  ```typescript
  // 동적 임포트 사용
  const DashboardPage = dynamic(() => import('@/components/DashboardPage'), {
    loading: () => <DashboardSkeleton />,
    ssr: false
  })
  ```

- [ ] **14.4.3** 번들 분석 및 최적화
  ```bash
  npm install @next/bundle-analyzer
  ```
  
  ```typescript
  // next.config.js
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  })
  
  module.exports = withBundleAnalyzer({
    // 기존 설정
  })
  ```

---

## ⚠️ 에러 처리 및 피드백 시스템 (Task 13)

### 전역 에러 바운더리
- [ ] **13.1.1** Error Boundary 컴포넌트
  ```typescript
  // src/components/ErrorBoundary.tsx
  import { Component, ReactNode } from 'react'
  
  interface Props {
    children: ReactNode
    fallback?: ReactNode
  }
  
  interface State {
    hasError: boolean
    error?: Error
  }
  
  export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
      super(props)
      this.state = { hasError: false }
    }
  
    static getDerivedStateFromError(error: Error): State {
      return { hasError: true, error }
    }
  
    componentDidCatch(error: Error, errorInfo: any) {
      console.error('Error caught by boundary:', error, errorInfo)
      // 에러 로깅 서비스에 전송 (Sentry 등)
    }
  
    render() {
      if (this.state.hasError) {
        return this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">오류가 발생했습니다</h2>
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                페이지 새로고침
              </button>
            </div>
          </div>
        )
      }
  
      return this.props.children
    }
  }
  ```

### Toast 알림 시스템
- [ ] **13.2.1** Toast Provider 설정
  ```bash
  npm install sonner
  ```

- [ ] **13.2.2** Toast 컴포넌트 통합
  ```typescript
  // src/app/layout.tsx
  import { Toaster } from 'sonner'
  
  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="ko">
        <body>
          <AuthProvider>
            {children}
            <Toaster 
              position="top-center"
              richColors
              closeButton
            />
          </AuthProvider>
        </body>
      </html>
    )
  }
  ```

- [ ] **13.2.3** 에러별 메시지 정의
  ```typescript
  // src/lib/error-messages.ts
  export const ERROR_MESSAGES = {
    NO_FOOD_DETECTED: '이미지에서 음식을 찾을 수 없습니다. 다른 사진으로 시도해주세요.',
    AI_SERVICE_ERROR: 'AI 분석 서비스에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
    NETWORK_ERROR: '네트워크 연결을 확인하고 다시 시도해주세요.',
    FILE_TOO_LARGE: '파일 크기가 너무 큽니다. 5MB 이하의 파일을 선택해주세요.',
    INVALID_FILE_TYPE: 'JPG, PNG, WebP 파일만 업로드 가능합니다.',
    UPLOAD_FAILED: '이미지 업로드에 실패했습니다. 다시 시도해주세요.',
    AUTH_REQUIRED: '로그인이 필요한 서비스입니다.',
    SESSION_EXPIRED: '세션이 만료되었습니다. 다시 로그인해주세요.',
  } as const
  ```

### 네트워크 에러 처리
- [ ] **13.4.1** 연결 상태 감지
  ```typescript
  // src/hooks/useNetworkStatus.ts
  import { useState, useEffect } from 'react'
  
  export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(true)
  
    useEffect(() => {
      const handleOnline = () => setIsOnline(true)
      const handleOffline = () => setIsOnline(false)
  
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
  
      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }, [])
  
    return isOnline
  }
  ```

- [ ] **13.4.2** 오프라인 상태 UI
  ```typescript
  // src/components/OfflineIndicator.tsx
  export function OfflineIndicator() {
    const isOnline = useNetworkStatus()
  
    if (isOnline) return null
  
    return (
      <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50">
        <p className="text-sm">인터넷 연결을 확인해주세요</p>
      </div>
    )
  }
  ```

### 재시도 메커니즘
- [ ] **13.7.1** 자동 재시도 함수
  ```typescript
  // src/lib/retry.ts
  export async function withRetry<T>(
    fn: () => Promise<T>,
    options: {
      maxRetries?: number
      delay?: number
      backoff?: boolean
    } = {}
  ): Promise<T> {
    const { maxRetries = 3, delay = 1000, backoff = true } = options
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        if (attempt === maxRetries) {
          throw error
        }
        
        const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
    
    throw new Error('Max retries exceeded')
  }
  ```

---

## 🚀 프로덕션 배포 (Task 15)

### 환경 설정
- [ ] **15.1.1** 프로덕션 환경변수
  ```env
  # .env.production
  NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
  N8N_WEBHOOK_URL=https://your-prod-n8n-instance.com/webhook/food-analysis
  NEXTAUTH_URL=https://your-domain.com
  NEXTAUTH_SECRET=your-production-secret
  ```

- [ ] **15.1.2** Vercel 환경변수 설정
  - [ ] Vercel 대시보드에서 환경변수 추가
  - [ ] Preview/Development 환경별 설정
  - [ ] Sensitive 값 암호화 확인

### Vercel 배포 설정
- [ ] **15.4.1** vercel.json 설정
  ```json
  {
    "buildCommand": "npm run build",
    "devCommand": "npm run dev",
    "installCommand": "npm install",
    "framework": "nextjs",
    "rewrites": [
      {
        "source": "/api/(.*)",
        "destination": "/api/$1"
      }
    ],
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          }
        ]
      }
    ]
  }
  ```

- [ ] **15.4.2** 빌드 최적화
  ```typescript
  // next.config.js
  module.exports = {
    experimental: {
      optimizeCss: true,
      optimizeServerReact: true,
    },
    compiler: {
      removeConsole: process.env.NODE_ENV === 'production',
    },
    poweredByHeader: false,
    reactStrictMode: true,
  }
  ```

### 성능 테스트
- [ ] **15.3.1** Lighthouse 성능 측정
  - [ ] Performance Score > 90
  - [ ] Accessibility Score > 95
  - [ ] Best Practices Score > 90
  - [ ] SEO Score > 90

- [ ] **15.3.2** Core Web Vitals 최적화
  - [ ] LCP (Largest Contentful Paint) < 2.5s
  - [ ] FID (First Input Delay) < 100ms
  - [ ] CLS (Cumulative Layout Shift) < 0.1

- [ ] **15.3.3** 모바일 성능 테스트
  - [ ] 3G 네트워크에서 로딩 시간 측정
  - [ ] 저사양 기기 테스트
  - [ ] 배터리 소모량 최적화

### 모니터링 설정
- [ ] **15.7.1** 에러 추적 (Sentry)
  ```bash
  npm install @sentry/nextjs
  ```
  
  ```typescript
  // sentry.client.config.ts
  import * as Sentry from '@sentry/nextjs'
  
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV,
  })
  ```

- [ ] **15.7.2** 성능 모니터링
  - [ ] Vercel Analytics 설정
  - [ ] 커스텀 메트릭 추가
  - [ ] 알림 설정

### 도메인 연결 (선택사항)
- [ ] **15.6.1** 커스텀 도메인 설정
  - [ ] Vercel에서 도메인 추가
  - [ ] DNS 설정 (CNAME 또는 A 레코드)
  - [ ] SSL 인증서 자동 발급 확인

- [ ] **15.6.2** 도메인 설정 업데이트
  ```env
  NEXTAUTH_URL=https://your-custom-domain.com
  ```

---

## ✅ 배포 전 체크리스트

### 기능 테스트
- [ ] 회원가입/로그인 정상 동작
- [ ] 이미지 업로드 및 분석 성공
- [ ] 식단 기록 저장 및 조회
- [ ] 모바일 UX 검증
- [ ] 에러 상황 처리 확인

### 성능 검증
- [ ] 페이지 로딩 속도 (< 3초)
- [ ] 이미지 업로드 속도
- [ ] API 응답 시간
- [ ] 메모리 사용량 확인

### 보안 체크
- [ ] 환경변수 보안 확인
- [ ] API 키 노출 여부 검사
- [ ] HTTPS 적용 확인
- [ ] XSS/CSRF 방어 확인

### 브라우저 호환성
- [ ] Chrome (Android/iOS)
- [ ] Safari (iOS)
- [ ] Samsung Internet
- [ ] Firefox Mobile

---

## 📊 성능 최적화 지표

### 목표 지표
| 메트릭 | 목표 값 | 현재 값 | 상태 |
|--------|---------|---------|------|
| First Contentful Paint | < 1.5s | - | ⏳ |
| Largest Contentful Paint | < 2.5s | - | ⏳ |
| Time to Interactive | < 3.5s | - | ⏳ |
| First Input Delay | < 100ms | - | ⏳ |
| Cumulative Layout Shift | < 0.1 | - | ⏳ |

### 번들 크기 목표
- [ ] JavaScript 번들 < 200KB (gzipped)
- [ ] CSS 번들 < 50KB (gzipped)
- [ ] 이미지 최적화 적용
- [ ] 미사용 코드 제거

---

## 📝 배포 후 모니터링

### 일일 체크 항목
- [ ] 서비스 가용성 (Uptime)
- [ ] 에러율 모니터링
- [ ] 성능 지표 확인
- [ ] 사용자 피드백 수집

### 주간 리뷰 항목
- [ ] 성능 트렌드 분석
- [ ] 에러 패턴 분석
- [ ] 사용자 행동 분석
- [ ] 기능 사용률 확인

---

**완료 날짜**: _____ | **담당자**: _____ | **검토자**: _____
