'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onWebhookSend: (file: File) => Promise<void>;
  isProcessing: boolean;
}

export default function ImageUpload({ onImageSelect, onWebhookSend, isProcessing }: ImageUploadProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onImageSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleSendToWebhook = async () => {
    if (selectedImage) {
      await onWebhookSend(selectedImage);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">이미지 업로드</h3>
      
      {!selectedImage ? (
        <>
          {/* 드래그 앤 드롭 영역 */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              isDragging 
                ? 'border-emerald-500 bg-emerald-50' 
                : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              이미지를 드래그하거나 클릭하여 선택하세요
            </p>
            <p className="text-sm text-gray-500 mb-4">
              JPG, PNG, GIF 파일을 지원합니다
            </p>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>파일 선택</span>
              </button>
              
              <button
                onClick={() => {
                  // 카메라 기능은 모바일에서만 작동
                  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    fileInputRef.current?.click();
                  } else {
                    alert('카메라 기능을 사용할 수 없습니다.');
                  }
                }}
                className="border border-emerald-500 text-emerald-600 px-6 py-3 rounded-lg font-medium hover:bg-emerald-50 transition-all duration-200 flex items-center space-x-2"
              >
                <Camera className="w-5 h-5" />
                <span>카메라</span>
              </button>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment" // 후면 카메라 우선
            onChange={handleFileInputChange}
            className="hidden"
          />
        </>
      ) : (
        <>
          {/* 선택된 이미지 미리보기 */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={previewUrl}
                alt="선택된 이미지"
                className="w-full max-h-64 object-contain rounded-lg bg-gray-50"
              />
              <button
                onClick={handleReset}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">파일 정보</h4>
              <p className="text-sm text-gray-600">이름: {selectedImage.name}</p>
              <p className="text-sm text-gray-600">크기: {(selectedImage.size / 1024 / 1024).toFixed(2)} MB</p>
              <p className="text-sm text-gray-600">타입: {selectedImage.type}</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleSendToWebhook}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>전송 중...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>웹훅으로 전송</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleReset}
                disabled={isProcessing}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다시 선택
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
