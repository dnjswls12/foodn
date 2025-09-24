import { NextRequest, NextResponse } from 'next/server';

const WEBHOOK_URL = 'https://dnjswls12.app.n8n.cloud/webhook-test/8fc40d24-dd43-4231-a261-5c9b1a27fcdf';

export async function POST(request: NextRequest) {
  try {
    // FormData로 이미지 파일 받기
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: '이미지 파일이 없습니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 체크 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '파일 크기가 너무 큽니다. (최대 10MB)' },
        { status: 400 }
      );
    }

    // 이미지 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '이미지 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    console.log('웹훅 전송 시작:', WEBHOOK_URL);
    console.log('파일 정보:', { name: file.name, size: file.size, type: file.type });

    // 바이너리 데이터를 직접 전송하기 위해 FormData 사용
    const webhookFormData = new FormData();
    webhookFormData.append('image', file);
    webhookFormData.append('filename', file.name);
    webhookFormData.append('filesize', file.size.toString());
    webhookFormData.append('filetype', file.type);
    webhookFormData.append('timestamp', new Date().toISOString());
    webhookFormData.append('source', 'FoodN-App');

    console.log('FormData 전송 크기:', file.size, 'bytes');

    // n8n 웹훅으로 POST 요청 전송 (바이너리 데이터)
    console.log('n8n 웹훅으로 바이너리 데이터 전송:', WEBHOOK_URL);

    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: webhookFormData,
      // Content-Type은 FormData가 자동으로 설정하므로 명시하지 않음
    });

    console.log('웹훅 응답 상태:', webhookResponse.status);

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('웹훅 전송 실패:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        body: errorText
      });
      return NextResponse.json(
        { 
          error: `웹훅 전송에 실패했습니다. (${webhookResponse.status}: ${webhookResponse.statusText})`,
          details: errorText
        },
        { status: 500 }
      );
    }

    const webhookResult = await webhookResponse.text();
    console.log('웹훅 응답:', webhookResult);

    return NextResponse.json({
      success: true,
      message: '이미지가 바이너리로 성공적으로 전송되었습니다.',
      webhookResponse: webhookResult,
      webhookUrl: WEBHOOK_URL,
      transmissionMethod: 'Binary (FormData)',
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('웹훅 전송 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: '웹훅 API 엔드포인트입니다. 이미지를 바이너리로 n8n 웹훅으로 전송합니다.',
    endpoint: '/api/webhook',
    method: 'POST (FormData) -> POST (n8n 웹훅)',
    contentType: 'multipart/form-data -> multipart/form-data',
    description: 'FormData로 받은 이미지 파일을 바이너리로 n8n 웹훅에 POST 요청으로 전송합니다.',
    webhookUrl: 'https://dnjswls12.app.n8n.cloud/webhook-test/8fc40d24-dd43-4231-a261-5c9b1a27fcdf',
    transmissionMethod: 'POST 요청 (FormData - Binary)',
    inputFormat: {
      contentType: 'multipart/form-data',
      fieldName: 'image',
      description: '이미지 파일 (File 객체)'
    },
    outputFormat: {
      contentType: 'multipart/form-data',
      fields: [
        'image: 바이너리 이미지 파일',
        'filename: 파일명 (string)',
        'filesize: 파일 크기 (string)',
        'filetype: MIME 타입 (string)',
        'timestamp: 전송 시간 (string, ISO 형식)',
        'source: 소스 애플리케이션 (string)'
      ]
    },
    example: {
      input: {
        method: 'POST',
        contentType: 'multipart/form-data',
        body: 'FormData with "image" field containing File object'
      },
      output: {
        message: '이미지가 바이너리로 성공적으로 전송되었습니다.',
        transmissionMethod: 'Binary (FormData)',
        fileInfo: {
          name: 'pancake.jpg',
          size: 48893,
          type: 'image/jpeg',
          timestamp: '2024-01-27T12:00:00.000Z'
        }
      },
      note: '이미지 파일이 바이너리 형태로 직접 전송되므로 Base64 변환 없이 원본 데이터가 유지됩니다.'
    }
  });
}
