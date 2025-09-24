# 🖼️ 이미지 웹훅 전송 기능

FoodN 앱에 웹훅을 통한 이미지 전송 기능이 추가되었습니다.

## 📋 기능 개요

사용자가 업로드한 이미지 파일을 지정된 n8n 웹훅 URL로 자동 전송하는 기능입니다.

### 🎯 웹훅 URL
```
https://dnjswls12.app.n8n.cloud/webhook-test/8fc40d24-dd43-4231-a261-5c9b1a27fcdf
```

## 🚀 사용 방법

### 1. 대시보드 접속
```bash
npm run dev
```
브라우저에서 `http://localhost:3000/dashboard` 접속

### 2. 이미지 업로드
- **드래그 앤 드롭**: 이미지 파일을 업로드 영역에 드래그
- **파일 선택**: "파일 선택" 버튼 클릭하여 파일 탐색기에서 선택
- **카메라**: 모바일에서 "카메라" 버튼으로 직접 촬영

### 3. 웹훅 전송
- 이미지 선택 후 "웹훅으로 전송" 버튼 클릭
- 전송 진행 상황 실시간 확인
- 전송 완료 후 결과 확인

### 4. 웹훅 연결 테스트
- 사용법 안내 영역의 "연결 테스트" 버튼 클릭
- 웹훅 엔드포인트 연결 상태 확인

## 🛠️ 구현된 기능들

### 📁 파일 구조
```
app/
├── components/
│   └── ImageUpload.client.tsx     # 이미지 업로드 컴포넌트
├── api/
│   ├── webhook/
│   │   └── route.ts               # 웹훅 전송 API
│   └── test-webhook/
│       └── route.ts               # 웹훅 연결 테스트 API
├── utils/
│   └── imageUtils.ts              # 이미지 처리 유틸리티
└── dashboard/
    └── page.tsx                   # 대시보드 UI 통합
```

### 🔧 주요 기능

#### 1. 이미지 업로드 컴포넌트 (`ImageUpload.client.tsx`)
- ✅ 드래그 앤 드롭 인터페이스
- ✅ 파일 선택 버튼
- ✅ 카메라 접근 (모바일)
- ✅ 이미지 미리보기
- ✅ 파일 정보 표시
- ✅ 실시간 전송 상태

#### 2. 웹훅 API (`/api/webhook`)
- ✅ 파일 크기 검증 (최대 10MB)
- ✅ 이미지 타입 검증
- ✅ 메타데이터 포함 전송
- ✅ 오류 처리 및 로깅
- ✅ 상세한 응답 정보

#### 3. 이미지 처리 유틸리티 (`imageUtils.ts`)
- ✅ 파일 유효성 검사
- ✅ Base64 변환
- ✅ 이미지 리사이즈
- ✅ EXIF 데이터 제거
- ✅ 파일 크기 형식화

#### 4. 웹훅 테스트 API (`/api/test-webhook`)
- ✅ 연결 상태 확인
- ✅ 테스트 데이터 전송
- ✅ 응답 시간 측정
- ✅ 오류 진단

## 📤 전송 데이터 형식

### 최종 구현: URL 파라미터 방식 (GET 요청)

웹훅으로 전송되는 데이터:

```javascript
GET /webhook/8fc40d24-dd43-4231-a261-5c9b1a27fcdf?filename=pancake.jpg&filesize=48893&filetype=image%2Fjpeg&timestamp=2024-01-27T12%3A00%3A00.000Z&source=FoodN-App&data=BASE64_ENCODED_IMAGE_DATA
```

### 🔄 변경 사유 및 해결 과정
1. **초기 문제**: n8n 웹훅이 POST 요청의 multipart/form-data를 지원하지 않음
2. **해결 시도**: JSON 형태의 POST 요청으로 변경
3. **최종 해결**: Base64 데이터를 URL 파라미터로 전송하는 GET 방식 채택
   - n8n 웹훅이 GET 요청만 허용하는 것으로 확인
   - URL 파라미터로 메타데이터 전송
   - Base64 이미지 데이터는 `data` 파라미터로 전송

### 📊 전송 파라미터
- `filename`: 파일명
- `filesize`: 파일 크기 (bytes)
- `filetype`: MIME 타입 (URL 인코딩됨)
- `timestamp`: 전송 시간 (ISO 형식, URL 인코딩됨)
- `source`: 소스 애플리케이션
- `data`: Base64 인코딩된 이미지 데이터

### 🔒 보안 및 제한사항
- **파일 크기**: 5MB (Base64로 변환하면 약 6.7MB)
- **URL 길이 제한**: 브라우저와 서버에 따라 다름

## 🔒 보안 및 제한사항

### 파일 제한
- **최대 크기**: 5MB
- **지원 형식**: JPG, PNG, GIF, WebP
- **타입 검증**: MIME 타입 확인

### 보안 기능
- ✅ 파일 타입 검증
- ✅ 파일 크기 제한
- ✅ EXIF 데이터 제거 옵션
- ✅ 에러 로깅

## 🧪 테스트 방법

### 1. 웹훅 연결 테스트
```bash
curl http://localhost:3000/api/test-webhook
```

### 2. 이미지 전송 테스트
```bash
curl -X POST http://localhost:3000/api/webhook \
  -F "image=@test-image.jpg"
```

## 📊 응답 예시

### 성공 응답
```json
{
  "success": true,
  "message": "이미지가 성공적으로 전송되었습니다.",
  "webhookResponse": "Workflow was started",
  "fileInfo": {
    "name": "image.jpg",
    "size": 1048576,
    "type": "image/jpeg",
    "timestamp": "2024-01-27T12:00:00.000Z"
  }
}
```

### 오류 응답
```json
{
  "error": "파일 크기가 너무 큽니다. (최대 10MB)",
  "details": "File size exceeds limit"
}
```

## 🎨 UI/UX 특징

- **반응형 디자인**: 모바일과 데스크톱 지원
- **실시간 피드백**: 업로드 진행률 표시
- **직관적 인터페이스**: 드래그 앤 드롭 지원
- **상태 표시**: 로딩, 성공, 오류 상태 시각화
- **접근성**: 키보드 네비게이션 지원

## 🔧 개발자 정보

### API 엔드포인트
- `POST /api/webhook` - 이미지 웹훅 전송
- `GET /api/test-webhook` - 웹훅 연결 테스트

### 환경 변수
현재 웹훅 URL은 코드에 하드코딩되어 있으며, 필요시 환경 변수로 변경 가능:

```env
WEBHOOK_URL=https://dnjswls12.app.n8n.cloud/webhook/8fc40d24-dd43-4231-a261-5c9b1a27fcdf
```

## 📝 추가 개발 아이디어

- [ ] 다중 파일 업로드 지원
- [ ] 이미지 압축 옵션
- [ ] 웹훅 URL 설정 UI
- [ ] 전송 기록 저장
- [ ] 진행률 애니메이션 개선
- [ ] 이미지 편집 기능
- [ ] 클라우드 스토리지 연동

---

✨ **FoodN 앱에 이미지 웹훅 전송 기능이 성공적으로 구현되었습니다!**
