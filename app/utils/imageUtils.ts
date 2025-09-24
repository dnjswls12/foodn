/**
 * 이미지 파일을 Base64 문자열로 변환
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Base64 변환에 실패했습니다.'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * 이미지 파일 크기 조정
 */
export function resizeImage(file: File, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // 원본 비율 유지하면서 크기 조정
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              reject(new Error('이미지 리사이즈에 실패했습니다.'));
            }
          },
          file.type,
          quality
        );
      } else {
        reject(new Error('Canvas 컨텍스트를 가져올 수 없습니다.'));
      }
    };

    img.onerror = () => reject(new Error('이미지 로드에 실패했습니다.'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 파일 크기를 읽기 쉬운 형태로 변환
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 이미지 파일 유효성 검사
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // 파일 타입 검사
  if (!file.type.startsWith('image/')) {
    return {
      isValid: false,
      error: '이미지 파일만 업로드 가능합니다.'
    };
  }

  // 파일 크기 검사 (10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `파일 크기가 너무 큽니다. (최대 ${formatFileSize(maxSize)})`
    };
  }

  // 지원하는 이미지 형식 검사
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!supportedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'JPG, PNG, GIF, WebP 형식만 지원됩니다.'
    };
  }

  return { isValid: true };
}

/**
 * EXIF 데이터를 제거하고 이미지 방향 수정
 */
export function normalizeImageOrientation(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      if (ctx) {
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const normalizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(normalizedFile);
            } else {
              reject(new Error('이미지 정규화에 실패했습니다.'));
            }
          },
          file.type,
          0.92
        );
      } else {
        reject(new Error('Canvas 컨텍스트를 가져올 수 없습니다.'));
      }
    };

    img.onerror = () => reject(new Error('이미지 로드에 실패했습니다.'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 이미지를 Base64로 변환하여 웹훅으로 전송
 */
export async function sendImageToWebhook(file: File): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    // 파일 유효성 검사
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error || '파일 유효성 검사 실패'
      };
    }

    // 파일 크기 제한 (더 엄격하게)
    if (file.size > 5 * 1024 * 1024) { // 5MB 제한
      return {
        success: false,
        error: '파일 크기가 너무 큽니다. (최대 5MB)'
      };
    }

    // FormData로 파일을 전송
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/webhook', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || '웹훅 전송에 실패했습니다.',
        data: result
      };
    }

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('웹훅 전송 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    };
  }
}
