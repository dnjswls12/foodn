'use client';

import { Camera, Sparkles, Clock, Brain, ArrowRight, Smartphone, Zap } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Navigation */}
        <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">FoodN</span>
          </div>
          <Link 
            href="/login"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors inline-block"
          >
            임시 로그인
          </Link>
        </nav>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-2" />
              원클릭으로 완성되는 식단 기록
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              사진 한 장으로
              <br />
              <span className="bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
                똑똑한 식단 관리
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              복잡한 입력은 이제 그만. AI가 음식을 자동으로 분석하고 
              시간에 따라 끼니를 분류해드립니다.
            </p>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button 
                className="group bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Camera className={`w-6 h-6 transition-transform duration-300 ${isHovered ? 'rotate-12' : ''}`} />
                <span>식단 기록 시작하기</span>
                <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
              </button>
              
              <button className="text-gray-600 hover:text-gray-900 font-medium flex items-center space-x-2 transition-colors">
                <span>서비스 살펴보기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Demo Preview */}
            <div className="relative max-w-sm mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="aspect-square bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl mb-4 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-orange-400" />
                </div>
                <div className="text-left">
                  <div className="h-3 bg-gray-100 rounded mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-3/4 mb-2"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">총 칼로리</span>
                    <span className="font-bold text-emerald-500">1,240kcal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              왜 FoodN인가요?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              기존 식단 앱의 복잡함은 버리고, 정말 필요한 핵심만 남겼습니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">원클릭 기록</h3>
              <p className="text-gray-600 leading-relaxed">
                사진을 선택하는 순간 모든 것이 자동으로 처리됩니다. 
                끼니 선택, 음식 입력 등 번거로운 과정은 없습니다.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI 자동 분석</h3>
              <p className="text-gray-600 leading-relaxed">
                최신 AI 기술로 음식의 종류와 양을 정확하게 분석하고, 
                칼로리와 영양성분을 자동으로 계산합니다.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">스마트 분류</h3>
              <p className="text-gray-600 leading-relaxed">
                기록 시간을 기반으로 아침, 점심, 저녁, 간식을 
                자동으로 분류하여 체계적인 관리가 가능합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              어떻게 작동하나요?
            </h2>
            <p className="text-xl text-gray-600">
              단 3단계로 완성되는 식단 기록
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-lg">
                  1
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <Camera className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">사진 촬영</h3>
                  <p className="text-gray-600">
                    음식 사진을 찍거나 갤러리에서 선택하세요
                  </p>
                </div>
              </div>
              <div className="hidden md:block absolute top-12 right-0 transform translate-x-1/2">
                <ArrowRight className="w-6 h-6 text-gray-400" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-lg">
                  2
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <Brain className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">AI 분석</h3>
                  <p className="text-gray-600">
                    AI가 음식을 인식하고 영양정보를 계산합니다
                  </p>
                </div>
              </div>
              <div className="hidden md:block absolute top-12 right-0 transform translate-x-1/2">
                <ArrowRight className="w-6 h-6 text-gray-400" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-lg">
                3
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">자동 기록</h3>
                <p className="text-gray-600">
                  끼니별로 분류되어 자동으로 저장 완료!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Optimized Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                모바일에 최적화된
                <br />
                <span className="text-emerald-500">직관적인 경험</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                언제 어디서나 간편하게 사용할 수 있도록 
                모바일 환경에 완벽하게 최적화되었습니다.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-gray-700">터치 친화적 인터페이스</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Zap className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-gray-700">빠른 로딩 속도</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Camera className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-gray-700">카메라 바로 연결</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-r from-emerald-100 to-blue-100 rounded-2xl p-8 text-center">
                <Smartphone className="w-24 h-24 text-emerald-500 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  스마트폰으로 더욱 편리하게
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-emerald-500 to-blue-500">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            지금 바로 시작해보세요
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            복잡한 식단 관리는 이제 그만. 사진 한 장으로 시작하는 스마트한 건강 관리를 경험해보세요.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
              <Camera className="w-6 h-6" />
              <span>무료로 시작하기</span>
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-emerald-600 transition-colors">
              더 알아보기
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">FoodN</span>
            </div>
            
            <div className="text-gray-400 text-center">
              <p>&copy; 2024 FoodN. 원클릭으로 시작하는 스마트한 식단 관리.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
