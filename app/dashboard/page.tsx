'use client';

import { useState } from 'react';
import { 
  Camera, 
  Clock, 
  Calendar, 
  TrendingUp, 
  User, 
  Settings,
  Upload,
  Brain,
  Save,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Plus,
  BarChart3
} from 'lucide-react';
import ImageUpload from '../components/ImageUpload.client';
import { sendImageToWebhook, validateImageFile } from '../utils/imageUtils';

// 임시 타입 정의
interface FoodItem {
  id: string;
  foodName: string;
  calories: number;
  quantity: string;
  imageUrl: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: string;
}

// 임시 데이터
const mockFoodLogs: FoodItem[] = [
  {
    id: '1',
    foodName: '현미밥, 김치찌개, 계란말이',
    calories: 1040,
    quantity: '1인분',
    imageUrl: '/placeholder-food.jpg',
    mealType: 'lunch',
    timestamp: '2024-01-27T12:30:00Z'
  },
  {
    id: '2',
    foodName: '샐러드, 닭가슴살',
    calories: 520,
    quantity: '1접시',
    imageUrl: '/placeholder-food.jpg',
    mealType: 'breakfast',
    timestamp: '2024-01-27T08:00:00Z'
  }
];

type RecordingStatus = 'idle' | 'selecting' | 'uploading' | 'analyzing' | 'saving' | 'success' | 'error';

export default function DashboardPage() {
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'record' | 'history'>('record');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [webhookResult, setWebhookResult] = useState<any>(null);
  const [webhookTestResult, setWebhookTestResult] = useState<any>(null);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  // 이미지 선택 핸들러
  const handleImageSelect = (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }
    setSelectedImage(file);
    setWebhookResult(null);
  };

  // 웹훅 전송 핸들러
  const handleWebhookSend = async (file: File) => {
    setIsProcessing(true);
    setRecordingStatus('uploading');
    
    try {
      const result = await sendImageToWebhook(file);
      
      if (result.success) {
        setWebhookResult(result.data);
        setRecordingStatus('success');
        
        // 3초 후 초기화
        setTimeout(() => {
          setRecordingStatus('idle');
          setSelectedImage(null);
          setWebhookResult(null);
        }, 5000);
      } else {
        setRecordingStatus('error');
        alert(result.error || '웹훅 전송에 실패했습니다.');
        
        setTimeout(() => {
          setRecordingStatus('idle');
        }, 3000);
      }
    } catch (error) {
      console.error('웹훅 전송 오류:', error);
      setRecordingStatus('error');
      alert('네트워크 오류가 발생했습니다.');
      
      setTimeout(() => {
        setRecordingStatus('idle');
      }, 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  // 웹훅 연결 테스트 핸들러
  const handleWebhookTest = async () => {
    setIsTestingWebhook(true);
    try {
      const response = await fetch('/api/test-webhook');
      const result = await response.json();
      setWebhookTestResult(result);
    } catch (error) {
      console.error('웹훅 테스트 오류:', error);
      setWebhookTestResult({
        success: false,
        error: '웹훅 테스트 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  // 기존 식단 기록 플로우 시뮬레이션 (데모용)
  const handleRecord = async () => {
    try {
      setRecordingStatus('selecting');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRecordingStatus('uploading');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setRecordingStatus('analyzing');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setRecordingStatus('saving');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRecordingStatus('success');
      
      // 3초 후 초기화
      setTimeout(() => {
        setRecordingStatus('idle');
      }, 3000);
    } catch (error) {
      setRecordingStatus('error');
      setTimeout(() => {
        setRecordingStatus('idle');
      }, 3000);
    }
  };

  // 일일 칼로리 합계 계산
  const dailyCalories = mockFoodLogs
    .filter(log => log.timestamp.startsWith(selectedDate))
    .reduce((total, log) => total + log.calories, 0);

  // 끼니별 분류
  const getMealTypeLabel = (mealType: string) => {
    const labels = {
      breakfast: '아침',
      lunch: '점심',
      dinner: '저녁',
      snack: '간식'
    };
    return labels[mealType as keyof typeof labels] || '기타';
  };

  // 로딩 단계 컴포넌트
  const LoadingSteps = ({ currentStep }: { currentStep: RecordingStatus }) => {
    const steps = [
      { key: 'uploading', label: '이미지 업로드 중...', icon: Upload },
      { key: 'analyzing', label: 'AI 분석 중...', icon: Brain },
      { key: 'saving', label: '저장 중...', icon: Save },
    ];
    
    return (
      <div className="space-y-4">
        {steps.map(step => {
          const isActive = currentStep === step.key;
          const isCompleted = steps.findIndex(s => s.key === currentStep) > steps.findIndex(s => s.key === step.key);
          
          return (
            <div key={step.key} className="flex items-center gap-3">
              <step.icon 
                className={`w-5 h-5 ${
                  isActive ? 'animate-spin text-emerald-500' : 
                  isCompleted ? 'text-emerald-500' :
                  'text-gray-400'
                }`} 
              />
              <span className={`${
                isActive ? 'font-bold text-emerald-700' : 
                isCompleted ? 'text-emerald-600' :
                'text-gray-500'
              }`}>
                {step.label}
              </span>
              {isCompleted && <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto" />}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">FoodN</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <User className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('record')}
            className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'record'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Camera className="w-4 h-4 inline mr-2" />
            식단 기록
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            식단 내역
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-8">
        {activeTab === 'record' ? (
          /* 식단 기록 탭 */
          <div className="space-y-6">
            {/* 일일 요약 카드 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">오늘의 식단</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date().toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-8 h-8 text-emerald-600" />
                    <div>
                      <p className="text-sm text-emerald-700 font-medium">총 칼로리</p>
                      <p className="text-2xl font-bold text-emerald-800">{dailyCalories}</p>
                      <p className="text-xs text-emerald-600">kcal</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-700 font-medium">기록 횟수</p>
                      <p className="text-2xl font-bold text-blue-800">{mockFoodLogs.length}</p>
                      <p className="text-xs text-blue-600">번</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 이미지 업로드 컴포넌트 */}
            <ImageUpload
              onImageSelect={handleImageSelect}
              onWebhookSend={handleWebhookSend}
              isProcessing={isProcessing}
            />

            {/* 웹훅 전송 결과 표시 */}
            {webhookResult && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-emerald-700 mb-4">✅ 전송 완료!</h3>
                <div className="bg-emerald-50 rounded-lg p-4">
                  <p className="text-sm text-emerald-700 mb-2">
                    <strong>메시지:</strong> {webhookResult.message}
                  </p>
                  <p className="text-sm text-emerald-700 mb-2">
                    <strong>파일명:</strong> {webhookResult.fileInfo?.name}
                  </p>
                  <p className="text-sm text-emerald-700 mb-2">
                    <strong>파일 크기:</strong> {(webhookResult.fileInfo?.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-sm text-emerald-700">
                    <strong>전송 시간:</strong> {new Date(webhookResult.fileInfo?.timestamp).toLocaleString('ko-KR')}
                  </p>
                  {webhookResult.webhookResponse && (
                    <details className="mt-3">
                      <summary className="text-sm text-emerald-600 cursor-pointer hover:text-emerald-800">
                        웹훅 응답 보기
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                        {webhookResult.webhookResponse}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}

            {/* 메인 기록 버튼 (데모용) */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {recordingStatus === 'idle' ? (
                <div className="text-center">
                  <div className="mb-6">
                    <button
                      onClick={handleRecord}
                      className="w-48 h-48 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full flex flex-col items-center justify-center text-white transition-all duration-300 transform hover:scale-105 shadow-2xl"
                    >
                      <Brain className="w-16 h-16 mb-4" />
                      <span className="text-xl font-bold">데모 시뮬레이션</span>
                    </button>
                  </div>
                  <p className="text-gray-600 text-lg">
                    AI 분석 플로우를 시뮬레이션 해보세요
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    실제 기능은 위의 이미지 업로드를 사용하세요
                  </p>
                </div>
              ) : recordingStatus === 'success' ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-emerald-700 mb-2">기록 완료!</h3>
                  <p className="text-gray-600">
                    식단이 성공적으로 기록되었습니다.
                  </p>
                </div>
              ) : recordingStatus === 'error' ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-red-700 mb-2">기록 실패</h3>
                  <p className="text-gray-600 mb-4">
                    다시 시도해주세요.
                  </p>
                  <button
                    onClick={handleRecord}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    다시 시도
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-10 h-10 text-white animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      AI가 열심히 분석 중입니다...
                    </h3>
                  </div>
                  <LoadingSteps currentStep={recordingStatus} />
                  <div className="mt-6">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: recordingStatus === 'uploading' ? '25%' :
                                 recordingStatus === 'analyzing' ? '70%' :
                                 recordingStatus === 'saving' ? '95%' : '0%'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 웹훅 테스트 결과 표시 */}
            {webhookTestResult && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className={`text-lg font-bold mb-4 ${webhookTestResult.success ? 'text-emerald-700' : 'text-red-700'}`}>
                  🔗 웹훅 연결 테스트 결과
                </h3>
                <div className={`rounded-lg p-4 ${webhookTestResult.success ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  <div className="space-y-2">
                    <p className={`text-sm ${webhookTestResult.success ? 'text-emerald-700' : 'text-red-700'}`}>
                      <strong>상태:</strong> {webhookTestResult.success ? '✅ 연결 성공' : '❌ 연결 실패'}
                    </p>
                    {webhookTestResult.status && (
                      <p className={`text-sm ${webhookTestResult.success ? 'text-emerald-700' : 'text-red-700'}`}>
                        <strong>HTTP 상태:</strong> {webhookTestResult.status} {webhookTestResult.statusText}
                      </p>
                    )}
                    <p className={`text-sm ${webhookTestResult.success ? 'text-emerald-700' : 'text-red-700'}`}>
                      <strong>웹훅 URL:</strong> {webhookTestResult.webhookUrl}
                    </p>
                    <p className={`text-sm ${webhookTestResult.success ? 'text-emerald-700' : 'text-red-700'}`}>
                      <strong>테스트 시간:</strong> {new Date(webhookTestResult.timestamp).toLocaleString('ko-KR')}
                    </p>
                    {webhookTestResult.response && (
                      <details className="mt-3">
                        <summary className={`text-sm cursor-pointer hover:underline ${webhookTestResult.success ? 'text-emerald-600' : 'text-red-600'}`}>
                          서버 응답 보기
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                          {webhookTestResult.response}
                        </pre>
                      </details>
                    )}
                    {webhookTestResult.error && (
                      <p className="text-sm text-red-700">
                        <strong>오류:</strong> {webhookTestResult.error}
                      </p>
                    )}
                    {webhookTestResult.details && (
                      <p className="text-xs text-red-600">
                        <strong>세부사항:</strong> {webhookTestResult.details}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setWebhookTestResult(null)}
                    className="mt-3 px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded transition-colors"
                  >
                    결과 닫기
                  </button>
                </div>
              </div>
            )}

            {/* 사용법 안내 */}
            <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-6">
              <h3 className="font-bold text-gray-800 mb-4">💡 이용 가이드</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-xs">1</div>
                  <p className="text-gray-700">이미지를 드래그하거나 파일 선택 버튼을 눌러 음식 사진을 업로드하세요</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs">2</div>
                  <p className="text-gray-700">선택한 이미지를 확인하고 "웹훅으로 전송" 버튼을 클릭하세요</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-xs">3</div>
                  <p className="text-gray-700">웹훅으로 이미지가 전송되고 처리 결과를 확인할 수 있습니다</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-yellow-800">
                    <strong>웹훅 URL:</strong> https://dnjswls12.app.n8n.cloud/webhook/8fc40d24-dd43-4231-a261-5c9b1a27fcdf
                  </p>
                  <button
                    onClick={handleWebhookTest}
                    disabled={isTestingWebhook}
                    className="px-3 py-1 bg-yellow-200 hover:bg-yellow-300 text-yellow-800 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTestingWebhook ? '테스트 중...' : '연결 테스트'}
                  </button>
                </div>
                <p className="text-xs text-yellow-700">
                  이미지 파일이 이 URL로 자동 전송됩니다 (n8n 워크플로우)
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* 식단 내역 탭 */
          <div className="space-y-6">
            {/* 날짜 선택 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">식단 내역</h2>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              
              <div className="text-center py-4">
                <p className="text-2xl font-bold text-emerald-600">{dailyCalories} kcal</p>
                <p className="text-sm text-gray-600">일일 총 칼로리</p>
              </div>
            </div>

            {/* 식단 목록 */}
            <div className="space-y-4">
              {mockFoodLogs.length > 0 ? (
                mockFoodLogs
                  .filter(log => log.timestamp.startsWith(selectedDate))
                  .map((log) => (
                    <div key={log.id} className="bg-white rounded-2xl shadow-lg p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl flex items-center justify-center">
                          <Camera className="w-8 h-8 text-orange-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">
                              {getMealTypeLabel(log.mealType)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(log.timestamp).toLocaleTimeString('ko-KR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-900 mb-1">{log.foodName}</h3>
                          <p className="text-sm text-gray-600 mb-2">{log.quantity}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">칼로리</span>
                            <span className="font-bold text-emerald-600">{log.calories} kcal</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">아직 기록된 식단이 없습니다</h3>
                  <p className="text-gray-600 mb-6">첫 번째 식단을 기록해보세요!</p>
                  <button
                    onClick={() => setActiveTab('record')}
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>식단 기록하기</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
