# 🔐 사용자 인증 시스템 구현 가이드

## 개요
Supabase Auth를 사용한 이메일 기반 회원가입/로그인 시스템 구현 가이드입니다.

---

## 1️⃣ Auth 라이브러리 설정

### 필요한 패키지 설치
- [ ] Auth 관련 라이브러리 설치:
  ```bash
  npm install @supabase/auth-helpers-nextjs
  npm install react-hook-form @hookform/resolvers zod
  ```

### 타입 정의
- [ ] `src/types/auth.ts` 파일 생성:
  ```typescript
  import { User, Session } from '@supabase/supabase-js'
  
  export interface AuthState {
    user: User | null
    session: Session | null
    loading: boolean
  }
  
  export interface AuthContextType extends AuthState {
    signUp: (email: string, password: string) => Promise<void>
    signIn: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
    resetPassword: (email: string) => Promise<void>
  }
  
  export interface SignUpData {
    email: string
    password: string
    confirmPassword: string
  }
  
  export interface SignInData {
    email: string
    password: string
  }
  
  export interface AuthError {
    message: string
    code?: string
  }
  ```

---

## 2️⃣ AuthContext 및 Provider 구현

### AuthContext 생성
- [ ] `src/context/AuthContext.tsx` 파일 생성:
  ```typescript
  'use client'
  
  import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
  import { User, Session, AuthError } from '@supabase/supabase-js'
  import { supabase } from '@/lib/supabase'
  import { AuthContextType, AuthState } from '@/types/auth'
  
  const AuthContext = createContext<AuthContextType | undefined>(undefined)
  
  export function AuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
      user: null,
      session: null,
      loading: true,
    })
  
    useEffect(() => {
      // 초기 세션 가져오기
      const getInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
        })
      }
  
      getInitialSession()
  
      // 인증 상태 변화 감지
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setAuthState({
            user: session?.user ?? null,
            session,
            loading: false,
          })
        }
      )
  
      return () => subscription.unsubscribe()
    }, [])
  
    const signUp = async (email: string, password: string) => {
      setAuthState(prev => ({ ...prev, loading: true }))
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
  
      if (error) {
        setAuthState(prev => ({ ...prev, loading: false }))
        throw error
      }
    }
  
    const signIn = async (email: string, password: string) => {
      setAuthState(prev => ({ ...prev, loading: true }))
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
  
      if (error) {
        setAuthState(prev => ({ ...prev, loading: false }))
        throw error
      }
    }
  
    const signOut = async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    }
  
    const resetPassword = async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      if (error) throw error
    }
  
    const value: AuthContextType = {
      ...authState,
      signUp,
      signIn,
      signOut,
      resetPassword,
    }
  
    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    )
  }
  
  export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
  }
  ```

### 루트 레이아웃에 Provider 추가
- [ ] `src/app/layout.tsx` 수정:
  ```typescript
  import { AuthProvider } from '@/context/AuthContext'
  import './globals.css'
  
  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <html lang="ko">
        <body>
          <AuthProvider>
            {children}
          </AuthProvider>
        </body>
      </html>
    )
  }
  ```

---

## 3️⃣ 회원가입 페이지 구현

### 회원가입 폼 스키마 정의
- [ ] `src/lib/validations/auth.ts` 파일 생성:
  ```typescript
  import { z } from 'zod'
  
  export const signUpSchema = z.object({
    email: z
      .string()
      .min(1, '이메일을 입력해주세요')
      .email('올바른 이메일 형식이 아닙니다'),
    password: z
      .string()
      .min(6, '비밀번호는 최소 6자 이상이어야 합니다')
      .max(100, '비밀번호는 100자를 초과할 수 없습니다'),
    confirmPassword: z
      .string()
      .min(1, '비밀번호 확인을 입력해주세요'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  })
  
  export const signInSchema = z.object({
    email: z
      .string()
      .min(1, '이메일을 입력해주세요')
      .email('올바른 이메일 형식이 아닙니다'),
    password: z
      .string()
      .min(1, '비밀번호를 입력해주세요'),
  })
  
  export type SignUpFormData = z.infer<typeof signUpSchema>
  export type SignInFormData = z.infer<typeof signInSchema>
  ```

### 회원가입 컴포넌트
- [ ] `src/components/auth/SignUpForm.tsx` 파일 생성:
  ```typescript
  'use client'
  
  import { useState } from 'react'
  import { useRouter } from 'next/navigation'
  import { useForm } from 'react-hook-form'
  import { zodResolver } from '@hookform/resolvers/zod'
  import { Button } from '@/components/ui/button'
  import { Input } from '@/components/ui/input'
  import { useAuth } from '@/context/AuthContext'
  import { signUpSchema, SignUpFormData } from '@/lib/validations/auth'
  import { AuthError } from '@supabase/supabase-js'
  
  export function SignUpForm() {
    const [error, setError] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)
    const { signUp } = useAuth()
    const router = useRouter()
  
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<SignUpFormData>({
      resolver: zodResolver(signUpSchema),
    })
  
    const onSubmit = async (data: SignUpFormData) => {
      try {
        setIsLoading(true)
        setError('')
        
        await signUp(data.email, data.password)
        setEmailSent(true)
      } catch (err) {
        const error = err as AuthError
        setError(error.message || '회원가입 중 오류가 발생했습니다')
      } finally {
        setIsLoading(false)
      }
    }
  
    if (emailSent) {
      return (
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold">이메일을 확인해주세요</h2>
          <p className="text-gray-600">
            회원가입을 완료하려면 이메일에서 인증 링크를 클릭해주세요.
          </p>
          <Button 
            onClick={() => router.push('/auth/signin')}
            variant="outline"
          >
            로그인 페이지로 이동
          </Button>
        </div>
      )
    }
  
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            {...register('email')}
            type="email"
            placeholder="이메일"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>
  
        <div>
          <Input
            {...register('password')}
            type="password"
            placeholder="비밀번호"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
          )}
        </div>
  
        <div>
          <Input
            {...register('confirmPassword')}
            type="password"
            placeholder="비밀번호 확인"
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>
  
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
  
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? '가입 중...' : '회원가입'}
        </Button>
      </form>
    )
  }
  ```

### 회원가입 페이지
- [ ] `src/app/(auth)/signup/page.tsx` 파일 생성:
  ```typescript
  import Link from 'next/link'
  import { SignUpForm } from '@/components/auth/SignUpForm'
  
  export default function SignUpPage() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">회원가입</h1>
            <p className="mt-2 text-gray-600">
              AI 식단 관리 서비스에 오신 것을 환영합니다
            </p>
          </div>
          
          <SignUpForm />
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link href="/auth/signin" className="text-blue-600 hover:underline">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }
  ```

---

## 4️⃣ 로그인 페이지 구현

### 로그인 컴포넌트
- [ ] `src/components/auth/SignInForm.tsx` 파일 생성:
  ```typescript
  'use client'
  
  import { useState } from 'react'
  import { useRouter } from 'next/navigation'
  import { useForm } from 'react-hook-form'
  import { zodResolver } from '@hookform/resolvers/zod'
  import { Button } from '@/components/ui/button'
  import { Input } from '@/components/ui/input'
  import { useAuth } from '@/context/AuthContext'
  import { signInSchema, SignInFormData } from '@/lib/validations/auth'
  import { AuthError } from '@supabase/supabase-js'
  
  export function SignInForm() {
    const [error, setError] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    const { signIn } = useAuth()
    const router = useRouter()
  
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<SignInFormData>({
      resolver: zodResolver(signInSchema),
    })
  
    const onSubmit = async (data: SignInFormData) => {
      try {
        setIsLoading(true)
        setError('')
        
        await signIn(data.email, data.password)
        router.push('/') // 메인 페이지로 리다이렉트
      } catch (err) {
        const error = err as AuthError
        setError(error.message || '로그인 중 오류가 발생했습니다')
      } finally {
        setIsLoading(false)
      }
    }
  
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            {...register('email')}
            type="email"
            placeholder="이메일"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>
  
        <div>
          <Input
            {...register('password')}
            type="password"
            placeholder="비밀번호"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
          )}
        </div>
  
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
  
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? '로그인 중...' : '로그인'}
        </Button>
      </form>
    )
  }
  ```

### 로그인 페이지
- [ ] `src/app/(auth)/signin/page.tsx` 파일 생성:
  ```typescript
  import Link from 'next/link'
  import { SignInForm } from '@/components/auth/SignInForm'
  
  export default function SignInPage() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">로그인</h1>
            <p className="mt-2 text-gray-600">
              계정에 로그인하세요
            </p>
          </div>
          
          <SignInForm />
          
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
                비밀번호를 잊으셨나요?
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <Link href="/auth/signup" className="text-blue-600 hover:underline">
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }
  ```

---

## 5️⃣ 인증 가드 및 보호된 라우트

### ProtectedRoute 컴포넌트
- [ ] `src/components/auth/ProtectedRoute.tsx` 파일 생성:
  ```typescript
  'use client'
  
  import { useEffect } from 'react'
  import { useRouter } from 'next/navigation'
  import { useAuth } from '@/context/AuthContext'
  
  interface ProtectedRouteProps {
    children: React.ReactNode
    fallback?: React.ReactNode
  }
  
  export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
    const { user, loading } = useAuth()
    const router = useRouter()
  
    useEffect(() => {
      if (!loading && !user) {
        router.push('/auth/signin')
      }
    }, [user, loading, router])
  
    if (loading) {
      return (
        fallback || (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        )
      )
    }
  
    if (!user) {
      return null // 리다이렉트 중
    }
  
    return <>{children}</>
  }
  ```

### 메인 페이지에 인증 가드 적용
- [ ] `src/app/page.tsx` 수정:
  ```typescript
  import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
  import { FoodRecordingPage } from '@/components/food/FoodRecordingPage'
  
  export default function HomePage() {
    return (
      <ProtectedRoute>
        <FoodRecordingPage />
      </ProtectedRoute>
    )
  }
  ```

---

## 6️⃣ 추가 기능 구현

### Auth 콜백 처리
- [ ] `src/app/auth/callback/route.ts` 파일 생성:
  ```typescript
  import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
  import { cookies } from 'next/headers'
  import { NextRequest, NextResponse } from 'next/server'
  
  export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
  
    if (code) {
      const supabase = createRouteHandlerClient({ cookies })
      await supabase.auth.exchangeCodeForSession(code)
    }
  
    // 인증 완료 후 메인 페이지로 리다이렉트
    return NextResponse.redirect(new URL('/', request.url))
  }
  ```

### 로그아웃 기능
- [ ] `src/components/auth/LogoutButton.tsx` 파일 생성:
  ```typescript
  'use client'
  
  import { useState } from 'react'
  import { useRouter } from 'next/navigation'
  import { Button } from '@/components/ui/button'
  import { useAuth } from '@/context/AuthContext'
  
  export function LogoutButton() {
    const [isLoading, setIsLoading] = useState(false)
    const { signOut } = useAuth()
    const router = useRouter()
  
    const handleLogout = async () => {
      try {
        setIsLoading(true)
        await signOut()
        router.push('/auth/signin')
      } catch (error) {
        console.error('로그아웃 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }
  
    return (
      <Button 
        onClick={handleLogout} 
        variant="outline" 
        disabled={isLoading}
      >
        {isLoading ? '로그아웃 중...' : '로그아웃'}
      </Button>
    )
  }
  ```

### 비밀번호 재설정
- [ ] `src/app/(auth)/forgot-password/page.tsx` 파일 생성:
  ```typescript
  'use client'
  
  import { useState } from 'react'
  import { useForm } from 'react-hook-form'
  import { Button } from '@/components/ui/button'
  import { Input } from '@/components/ui/input'
  import { useAuth } from '@/context/AuthContext'
  
  interface ForgotPasswordForm {
    email: string
  }
  
  export default function ForgotPasswordPage() {
    const [emailSent, setEmailSent] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { resetPassword } = useAuth()
  
    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>()
  
    const onSubmit = async (data: ForgotPasswordForm) => {
      try {
        setIsLoading(true)
        setError('')
        await resetPassword(data.email)
        setEmailSent(true)
      } catch (err: any) {
        setError(err.message || '오류가 발생했습니다')
      } finally {
        setIsLoading(false)
      }
    }
  
    if (emailSent) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8 p-8 text-center">
            <h1 className="text-3xl font-bold">이메일을 확인해주세요</h1>
            <p className="text-gray-600">
              비밀번호 재설정 링크를 이메일로 보내드렸습니다.
            </p>
          </div>
        </div>
      )
    }
  
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">비밀번호 재설정</h1>
            <p className="mt-2 text-gray-600">
              가입하신 이메일 주소를 입력해주세요
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                {...register('email', { 
                  required: '이메일을 입력해주세요',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: '올바른 이메일 형식이 아닙니다'
                  }
                })}
                type="email"
                placeholder="이메일"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>
  
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
  
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '전송 중...' : '재설정 링크 전송'}
            </Button>
          </form>
        </div>
      </div>
    )
  }
  ```

---

## ✅ 테스트 체크리스트

### 회원가입 테스트
- [ ] 이메일 형식 검증 동작
- [ ] 비밀번호 길이 검증 동작
- [ ] 비밀번호 확인 일치 검증 동작
- [ ] 회원가입 성공 시 인증 이메일 발송
- [ ] 이메일 인증 완료 후 로그인 가능

### 로그인 테스트
- [ ] 올바른 자격증명으로 로그인 성공
- [ ] 잘못된 자격증명으로 로그인 실패
- [ ] 로그인 후 메인 페이지 리다이렉트
- [ ] 세션 유지 확인

### 인증 가드 테스트
- [ ] 미인증 상태에서 보호된 페이지 접근 시 로그인 페이지로 리다이렉트
- [ ] 인증 후 보호된 페이지 정상 접근
- [ ] 로그아웃 후 보호된 페이지 접근 차단

### 추가 기능 테스트
- [ ] 로그아웃 기능 정상 동작
- [ ] 비밀번호 재설정 이메일 발송
- [ ] Auth 콜백 처리 정상 동작

---

## 📝 다음 단계
인증 시스템 구현이 완료되면 다음 단계로 진행:
1. **메인 레이아웃 및 네비게이션 구현** (Task 6)
2. **이미지 업로드 컴포넌트 구현** (Task 7)

---

**완료 날짜**: _____ | **담당자**: _____ | **검토자**: _____
