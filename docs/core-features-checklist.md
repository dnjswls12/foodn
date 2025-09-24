# 🎯 핵심 기능 구현 체크리스트

## 개요
식단 기록, 이미지 업로드, n8n 연동 등 핵심 기능들의 구현 체크리스트입니다.

---

## 📸 이미지 업로드 컴포넌트 (Task 7)

### 파일 선택 인터페이스
- [ ] **7.1.1** 기본 파일 input 커스터마이징
  ```typescript
  // src/components/food/ImageUpload.tsx
  <input
    type="file"
    accept="image/*"
    capture="environment"  // 모바일 카메라 우선
    onChange={handleFileSelect}
    className="hidden"
    ref={fileInputRef}
  />
  ```

- [ ] **7.1.2** 모바일 친화적 버튼 디자인
  - [ ] 카메라 아이콘과 텍스트
  - [ ] 큰 터치 영역 (최소 44px)
  - [ ] 시각적 피드백 (hover, active 상태)

- [ ] **7.1.3** 데스크톱 드래그 앤 드롭 기능
  - [ ] 드래그 오버 시 시각적 표시
  - [ ] 드롭 이벤트 처리
  - [ ] 파일 타입 검증

### 이미지 검증 및 미리보기
- [ ] **7.2.1** 파일 타입 검증
  ```typescript
  const validateFile = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('JPG, PNG, WebP 파일만 업로드 가능합니다')
    }
  }
  ```

- [ ] **7.2.2** 파일 크기 제한 (5MB)
  ```typescript
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('파일 크기는 5MB 이하여야 합니다')
  }
  ```

- [ ] **7.2.3** 이미지 미리보기 컴포넌트
  - [ ] 선택된 이미지 썸네일 표시
  - [ ] 이미지 회전/편집 옵션 (선택사항)
  - [ ] 재선택 버튼

- [ ] **7.2.4** 이미지 압축 (선택사항)
  - [ ] canvas API를 사용한 리사이징
  - [ ] 품질 조절
  - [ ] 최적화된 파일 크기

### Supabase Storage 업로드
- [ ] **7.3.1** uploadImage 함수 구현
  ```typescript
  // src/lib/storage.ts
  export async function uploadFoodImage(file: File, userId: string) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('food-images')
      .upload(fileName, file)
    
    if (error) throw error
    return data.path
  }
  ```

- [ ] **7.3.2** 업로드 진행률 표시
  - [ ] Progress 컴포넌트 사용
  - [ ] 진행률 계산 및 업데이트
  - [ ] 취소 버튼 (선택사항)

- [ ] **7.3.3** 에러 처리 및 재시도
  - [ ] 네트워크 에러 감지
  - [ ] 재시도 로직 (최대 3회)
  - [ ] 사용자 친화적 에러 메시지

---

## 🔗 n8n 웹훅 연동 서비스 (Task 8)

### API 타입 정의
- [ ] **8.1.1** 웹훅 요청 타입
  ```typescript
  // src/types/n8n.ts
  export interface N8nWebhookRequest {
    image: File
    userId: string
  }
  
  export interface N8nWebhookResponse {
    success: boolean
    data?: AIAnalysisResult
    error?: {
      code: string
      message: string
    }
  }
  ```

- [ ] **8.1.2** AI 분석 결과 타입
  ```typescript
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
  ```

- [ ] **8.1.3** 에러 응답 타입
  ```typescript
  export interface N8nError {
    code: 'NO_FOOD_DETECTED' | 'AI_SERVICE_ERROR' | 'TIMEOUT' | 'UNKNOWN_ERROR'
    message: string
  }
  ```

### 웹훅 전송 함수
- [ ] **8.2.1** FormData 구성
  ```typescript
  // src/lib/n8n.ts
  export async function sendToN8nWebhook(imageFile: File, userId: string) {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('userId', userId)
    
    return await fetch(process.env.N8N_WEBHOOK_URL!, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(30000) // 30초 타임아웃
    })
  }
  ```

- [ ] **8.2.2** 환경변수 설정
  ```env
  N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/food-analysis
  ```

- [ ] **8.2.3** 타임아웃 및 AbortController
  - [ ] 30초 타임아웃 설정
  - [ ] 취소 가능한 요청
  - [ ] 메모리 누수 방지

### 응답 처리 및 에러 핸들링
- [ ] **8.3.1** 성공 응답 처리
  ```typescript
  const response = await sendToN8nWebhook(imageFile, userId)
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const result: N8nWebhookResponse = await response.json()
  
  if (!result.success) {
    throw new N8nWebhookError(result.error)
  }
  
  return result.data
  ```

- [ ] **8.3.2** 에러 분류 및 처리
  - [ ] 네트워크 에러 (connectivity)
  - [ ] 타임아웃 에러
  - [ ] HTTP 상태 에러 (4xx, 5xx)
  - [ ] AI 분석 실패 에러

- [ ] **8.3.3** 재시도 로직
  ```typescript
  async function withRetry<T>(
    fn: () => Promise<T>, 
    maxRetries = 3
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        if (i === maxRetries - 1) throw error
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
    throw new Error('Max retries exceeded')
  }
  ```

---

## 🏠 식단 기록 메인 페이지 (Task 9)

### 메인 페이지 UI
- [x] **9.1.1** 중앙 배치 기록 버튼
  ```typescript
  // src/components/food/FoodRecordButton.tsx
  export function FoodRecordButton({ onRecord }: { onRecord: () => void }) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Button
          onClick={onRecord}
          size="lg"
          className="w-48 h-48 rounded-full flex flex-col gap-4"
        >
          <Camera className="w-16 h-16" />
          <span className="text-xl">식단 기록하기</span>
        </Button>
      </div>
    )
  }
  ```

- [x] **9.1.2** 직관적인 아이콘 및 텍스트
  - [x] 카메라 아이콘 (Lucide React)
  - [x] "식단 기록하기" 텍스트
  - [x] 서브 텍스트 ("사진을 찍어주세요")

- [x] **9.1.3** 모바일 친화적 터치 영역
  - [x] 최소 48x48dp 터치 영역
  - [x] 적절한 패딩 및 마진
  - [x] 접근성 라벨 추가

- [x] **9.1.4** 사용법 안내
  - [x] 간단한 가이드 텍스트
  - [x] 첫 사용자를 위한 온보딩 (이용 가이드)

### 원클릭 기록 플로우
- [x] **9.2.1** 통합 플로우 구현 (임시 시뮬레이션)
  ```typescript
  // src/components/food/FoodRecordingFlow.tsx
  const handleRecord = async () => {
    try {
      setStatus('selecting')
      const file = await selectImage()
      
      setStatus('uploading')
      const imageUrl = await uploadImage(file, user.id)
      
      setStatus('analyzing')
      const analysis = await analyzeWithN8n(file, user.id)
      
      setStatus('saving')
      await saveFoodLog({
        userId: user.id,
        imageUrl,
        analysis,
        mealType: determineMealType()
      })
      
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setError(error.message)
    }
  }
  ```

- [x] **9.2.2** 상태 관리
  - [x] 'idle', 'selecting', 'uploading', 'analyzing', 'saving', 'success', 'error'
  - [x] 각 단계별 UI 업데이트
  - [x] 진행률 추적

- [x] **9.2.3** 백그라운드 처리
  - [x] 비동기 작업 처리
  - [x] 사용자 블로킹 최소화
  - [x] 진행 상태 실시간 업데이트

### 로딩 및 피드백 UI
- [x] **9.3.1** 단계별 로딩 표시
  ```typescript
  const LoadingSteps = ({ currentStep }: { currentStep: string }) => {
    const steps = [
      { key: 'uploading', label: '이미지 업로드 중...', icon: Upload },
      { key: 'analyzing', label: 'AI 분석 중...', icon: Brain },
      { key: 'saving', label: '저장 중...', icon: Save },
    ]
    
    return (
      <div className="space-y-4">
        {steps.map(step => (
          <div key={step.key} className="flex items-center gap-3">
            <step.icon className={currentStep === step.key ? 'animate-spin' : ''} />
            <span className={currentStep === step.key ? 'font-bold' : 'text-gray-500'}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    )
  }
  ```

- [x] **9.3.2** 프로그레스 바
  - [x] 전체 진행률 표시
  - [x] 부드러운 애니메이션
  - [ ] 예상 시간 표시 (선택사항)

- [x] **9.3.3** 성공/실패 피드백
  - [x] 성공 시 체크 아이콘과 "기록 완료!" 메시지
  - [x] 실패 시 에러 아이콘과 재시도 버튼
  - [ ] 토스트 알림 사용 (현재 인라인 메시지 사용)

---

## 📊 식단 데이터 조회 API (Task 10)

### 데이터 조회 함수
- [ ] **10.1** 날짜별 식단 조회
  ```typescript
  // src/lib/api/food-logs.ts
  export async function getFoodLogsByDate(
    userId: string, 
    date: string
  ): Promise<FoodLog[]> {
    const startDate = `${date}T00:00:00.000Z`
    const endDate = `${date}T23:59:59.999Z`
    
    const { data, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
  ```

- [ ] **10.2** 끼니별 필터링
  ```typescript
  export async function getFoodLogsByMeal(
    userId: string,
    mealType: MealType,
    date?: string
  ): Promise<FoodLog[]> {
    let query = supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('meal_type', mealType)
    
    if (date) {
      query = query
        .gte('created_at', `${date}T00:00:00.000Z`)
        .lte('created_at', `${date}T23:59:59.999Z`)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
  ```

- [ ] **10.3** 페이지네이션 구현
- [ ] **10.4** 영양성분 합계 계산
- [ ] **10.5** React Query 캐싱 설정
- [ ] **10.6** 타입 안전성 보장

---

## 📈 식단 대시보드 페이지 (Task 11)

### 대시보드 레이아웃
- [x] **11.1** 날짜 선택 컴포넌트
- [x] **11.2** 끼니별 탭/섹션
- [x] **11.3** 식단 아이템 카드
- [x] **11.4** 일일 요약 정보
- [ ] **11.5** 무한 스크롤 (현재 단순 목록)
- [x] **11.6** 로딩/에러 상태

### 상세 정보 모달 (Task 12)
- [ ] **12.1** 모달 컴포넌트
- [ ] **12.2** 이미지 확대 보기
- [ ] **12.3** AI 분석 결과 표시
- [ ] **12.4** 영양성분 차트
- [ ] **12.5** 편집/삭제 기능 (선택사항)

---

## ✅ 테스트 체크리스트

### 이미지 업로드 테스트
- [ ] 다양한 이미지 형식 (JPEG, PNG, WebP)
- [ ] 파일 크기 제한 동작
- [ ] 모바일 카메라 접근
- [ ] 업로드 진행률 표시
- [ ] 에러 상황 처리

### n8n 연동 테스트
- [ ] 정상적인 AI 분석 응답
- [ ] 타임아웃 상황 처리
- [ ] 네트워크 에러 처리
- [ ] 재시도 로직 동작

### 전체 플로우 테스트
- [ ] 이미지 선택 → 업로드 → 분석 → 저장
- [ ] 각 단계별 로딩 상태
- [ ] 성공/실패 피드백
- [ ] 사용자 경험 (UX) 검증

---

## 📝 성능 최적화 고려사항

### 이미지 최적화
- [ ] 이미지 압축 및 리사이징
- [ ] WebP 형식 지원
- [ ] 지연 로딩 (Lazy Loading)

### 데이터 캐싱
- [ ] React Query 캐싱 전략
- [ ] 로컬 스토리지 활용
- [ ] 백그라운드 동기화

### 네트워크 최적화
- [ ] 요청 중복 방지
- [ ] 재시도 로직 최적화
- [ ] 오프라인 대응

---

**완료 날짜**: _____ | **담당자**: _____ | **검토자**: _____
