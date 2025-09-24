# 🛢️ Supabase 설정 및 연동 가이드

## 개요
Supabase 프로젝트 생성부터 Next.js 연동까지의 완전한 가이드입니다.

---

## 1️⃣ Supabase 프로젝트 생성

### 계정 생성 및 로그인
- [ ] [Supabase 웹사이트](https://supabase.com/) 접속
- [ ] 계정 생성 또는 GitHub 연동 로그인
- [ ] 대시보드 접속 확인

### 새 프로젝트 생성
- [ ] "New Project" 버튼 클릭
- [ ] 프로젝트 정보 입력:
  - [ ] **Project Name**: `ai-diet-tracker`
  - [ ] **Database Password**: 강력한 비밀번호 설정 (기록 필수)
  - [ ] **Region**: 가장 가까운 지역 선택 (예: Northeast Asia)
  - [ ] **Plan**: Free tier 선택
- [ ] "Create new project" 클릭
- [ ] 프로젝트 생성 완료 대기 (약 2-3분)

### 프로젝트 설정 확인
- [ ] 프로젝트 대시보드 접속
- [ ] **Settings** > **API** 페이지에서 정보 확인:
  - [ ] **Project URL** 복사 및 기록
  - [ ] **anon public** API key 복사 및 기록
  - [ ] **service_role** key 확인 (보안상 기록 주의)

---

## 2️⃣ 데이터베이스 스키마 설계

### Auth 스키마 확인
- [ ] **Authentication** > **Users** 페이지 접속
- [ ] 기본 auth.users 테이블 구조 확인
- [ ] Email 기반 인증 설정 확인

### 커스텀 테이블 생성

#### food_logs 테이블 생성
- [ ] **Database** > **Tables** > **Create a new table** 클릭
- [ ] 테이블 설정:
  - [ ] **Name**: `food_logs`
  - [ ] **Enable Row Level Security (RLS)**: 체크
  
- [ ] 컬럼 추가:
  ```sql
  -- id (Primary Key) - 자동 생성됨
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY
  
  -- 사용자 ID (Foreign Key)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
  
  -- 끼니 유형
  meal_type TEXT NOT NULL CHECK (meal_type IN ('아침', '점심', '저녁', '간식'))
  
  -- 이미지 URL
  image_url TEXT NOT NULL
  
  -- AI 분석 결과 (JSON)
  ai_analysis_result JSONB NOT NULL
  
  -- 총 칼로리
  total_calories INTEGER NOT NULL DEFAULT 0
  
  -- 영양성분 정보 (JSON)
  nutrients JSONB NOT NULL DEFAULT '{}'::jsonb
  
  -- 생성일시
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
  
  -- 수정일시
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
  ```

#### 인덱스 생성
- [ ] **Database** > **Indexes** 페이지에서 인덱스 추가:
  ```sql
  -- 사용자별 식단 조회 최적화
  CREATE INDEX idx_food_logs_user_id ON food_logs(user_id);
  
  -- 날짜별 조회 최적화
  CREATE INDEX idx_food_logs_created_at ON food_logs(created_at);
  
  -- 사용자별 날짜 조회 최적화
  CREATE INDEX idx_food_logs_user_date ON food_logs(user_id, created_at);
  
  -- 끼니별 조회 최적화
  CREATE INDEX idx_food_logs_meal_type ON food_logs(user_id, meal_type);
  ```

### RLS (Row Level Security) 정책 설정

#### food_logs 테이블 RLS 정책
- [ ] **Authentication** > **Policies** 페이지 접속
- [ ] `food_logs` 테이블 선택
- [ ] 정책 추가:

**SELECT 정책 (읽기)**
```sql
CREATE POLICY "Users can view own food logs" ON food_logs
FOR SELECT USING (auth.uid() = user_id);
```

**INSERT 정책 (삽입)**
```sql
CREATE POLICY "Users can insert own food logs" ON food_logs
FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**UPDATE 정책 (수정)**
```sql
CREATE POLICY "Users can update own food logs" ON food_logs
FOR UPDATE USING (auth.uid() = user_id);
```

**DELETE 정책 (삭제)**
```sql
CREATE POLICY "Users can delete own food logs" ON food_logs
FOR DELETE USING (auth.uid() = user_id);
```

---

## 3️⃣ Supabase Storage 설정

### 버킷 생성
- [ ] **Storage** > **Buckets** 페이지 접속
- [ ] "Create a new bucket" 클릭
- [ ] 버킷 설정:
  - [ ] **Name**: `food-images`
  - [ ] **Public bucket**: 체크 (이미지 공개 접근을 위해)
  - [ ] **File size limit**: 5MB
  - [ ] **Allowed MIME types**: `image/*`

### Storage 정책 설정
- [ ] 생성된 `food-images` 버킷의 **Policies** 탭 클릭
- [ ] 정책 추가:

**SELECT 정책 (공개 읽기)**
```sql
CREATE POLICY "Anyone can view food images" ON storage.objects
FOR SELECT USING (bucket_id = 'food-images');
```

**INSERT 정책 (인증된 사용자만 업로드)**
```sql
CREATE POLICY "Authenticated users can upload food images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'food-images' AND auth.role() = 'authenticated');
```

**DELETE 정책 (소유자만 삭제)**
```sql
CREATE POLICY "Users can delete own food images" ON storage.objects
FOR DELETE USING (bucket_id = 'food-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 4️⃣ Next.js 프로젝트 연동

### 필요한 라이브러리 설치
- [ ] Supabase 라이브러리 설치:
  ```bash
  npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
  ```

### 환경변수 설정
- [ ] `.env.local` 파일에 Supabase 정보 추가:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```

### Supabase 클라이언트 설정
- [ ] `src/lib/supabase.ts` 파일 생성:
  ```typescript
  import { createClient } from '@supabase/supabase-js'
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  export const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // 타입 정의
  export type Database = {
    public: {
      Tables: {
        food_logs: {
          Row: {
            id: number
            user_id: string
            meal_type: string
            image_url: string
            ai_analysis_result: any
            total_calories: number
            nutrients: any
            created_at: string
            updated_at: string
          }
          Insert: {
            user_id: string
            meal_type: string
            image_url: string
            ai_analysis_result: any
            total_calories: number
            nutrients?: any
          }
          Update: {
            meal_type?: string
            image_url?: string
            ai_analysis_result?: any
            total_calories?: number
            nutrients?: any
            updated_at?: string
          }
        }
      }
    }
  }
  ```

### 연결 테스트
- [ ] `src/app/test-supabase/page.tsx` 테스트 페이지 생성:
  ```typescript
  'use client'
  
  import { useEffect, useState } from 'react'
  import { supabase } from '@/lib/supabase'
  
  export default function TestSupabase() {
    const [connected, setConnected] = useState(false)
    const [error, setError] = useState<string | null>(null)
  
    useEffect(() => {
      const testConnection = async () => {
        try {
          const { data, error } = await supabase.from('food_logs').select('count')
          
          if (error) {
            setError(error.message)
          } else {
            setConnected(true)
          }
        } catch (err) {
          setError('Connection failed')
        }
      }
  
      testConnection()
    }, [])
  
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
        {connected ? (
          <p className="text-green-600">✅ Supabase connected successfully!</p>
        ) : error ? (
          <p className="text-red-600">❌ Connection failed: {error}</p>
        ) : (
          <p className="text-yellow-600">🔄 Testing connection...</p>
        )}
      </div>
    )
  }
  ```

- [ ] `localhost:3000/test-supabase` 접속하여 연결 테스트
- [ ] 성공 메시지 확인 후 테스트 페이지 삭제

---

## 5️⃣ Auth 설정

### 이메일 인증 설정
- [ ] **Authentication** > **Settings** 페이지 접속
- [ ] **User Signups** 섹션:
  - [ ] "Enable email confirmations" 체크
  - [ ] "Enable phone confirmations" 해제
- [ ] **Email Templates** 섹션에서 인증 이메일 템플릿 확인

### 허용된 URL 설정
- [ ] **Authentication** > **URL Configuration** 페이지 접속
- [ ] **Site URL**: `http://localhost:3000` 추가
- [ ] **Redirect URLs**:
  - [ ] `http://localhost:3000/auth/callback` 추가
  - [ ] 프로덕션 URL (배포 시 추가)

---

## 6️⃣ 타입 정의 및 유틸리티

### 타입 정의 파일 생성
- [ ] `src/types/database.ts` 파일 생성:
  ```typescript
  export interface FoodLog {
    id: number
    user_id: string
    meal_type: '아침' | '점심' | '저녁' | '간식'
    image_url: string
    ai_analysis_result: AIAnalysisResult
    total_calories: number
    nutrients: NutrientsInfo
    created_at: string
    updated_at: string
  }
  
  export interface AIAnalysisResult {
    items: FoodItem[]
    summary: NutrientSummary
  }
  
  export interface FoodItem {
    foodName: string
    confidence: number
    quantity: string
    calories: number
    nutrients: NutrientsInfo
  }
  
  export interface NutrientsInfo {
    carbohydrates: { value: number; unit: string }
    protein: { value: number; unit: string }
    fat: { value: number; unit: string }
    sugars?: { value: number; unit: string }
    sodium?: { value: number; unit: string }
  }
  
  export interface NutrientSummary {
    totalCalories: number
    totalCarbohydrates: { value: number; unit: string }
    totalProtein: { value: number; unit: string }
    totalFat: { value: number; unit: string }
  }
  ```

### 유틸리티 함수 생성
- [ ] `src/lib/database.ts` 파일 생성:
  ```typescript
  import { supabase } from './supabase'
  import type { FoodLog } from '@/types/database'
  
  // 식단 기록 생성
  export async function createFoodLog(foodLog: Omit<FoodLog, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('food_logs')
      .insert(foodLog)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
  
  // 사용자 식단 기록 조회
  export async function getFoodLogs(userId: string, date?: string) {
    let query = supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (date) {
      const startDate = `${date}T00:00:00.000Z`
      const endDate = `${date}T23:59:59.999Z`
      query = query.gte('created_at', startDate).lte('created_at', endDate)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  }
  
  // 이미지 업로드
  export async function uploadFoodImage(file: File, userId: string) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('food-images')
      .upload(fileName, file)
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from('food-images')
      .getPublicUrl(fileName)
    
    return publicUrl
  }
  ```

---

## ✅ 설정 완료 확인

### 데이터베이스 테스트
- [ ] 테이블이 올바르게 생성됨
- [ ] RLS 정책이 적용됨
- [ ] 인덱스가 생성됨

### Storage 테스트
- [ ] 버킷이 생성됨
- [ ] 이미지 업로드 테스트 성공
- [ ] 공개 URL 접근 가능

### 연동 테스트
- [ ] Next.js에서 Supabase 클라이언트 연결 성공
- [ ] 환경변수 정상 로드
- [ ] 타입스크립트 컴파일 에러 없음

---

## 📝 다음 단계
Supabase 설정이 완료되면 다음 단계로 진행:
1. **사용자 인증 시스템 구현** (Task 5)
2. **이미지 업로드 컴포넌트 구현** (Task 7)

---

## 🔒 보안 체크리스트
- [ ] RLS가 모든 테이블에 활성화됨
- [ ] anon key만 클라이언트에서 사용
- [ ] service_role key는 서버에서만 사용
- [ ] 환경변수가 .gitignore에 포함됨

---

**완료 날짜**: _____ | **담당자**: _____ | **검토자**: _____
