import { NextRequest, NextResponse } from 'next/server';

const WEBHOOK_URL = 'https://dnjswls12.app.n8n.cloud/webhook/8fc40d24-dd43-4231-a261-5c9b1a27fcdf';

export async function GET() {
  try {
    console.log('웹훅 연결 테스트 시작:', WEBHOOK_URL);

    // 테스트용 작은 이미지 생성 (1x1 투명 PNG)
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg==';

    // URL 파라미터로 테스트 데이터 구성
    const testParams = new URLSearchParams({
      test: 'true',
      message: 'FoodN 앱에서 웹훅 연결 테스트',
      timestamp: new Date().toISOString(),
      filename: 'test.png',
      filesize: '85',
      filetype: 'image/png',
      source: 'FoodN-Test',
      data: testImageData.split(',')[1] // Base64 데이터 부분만
    });

    const testUrlWithParams = `${WEBHOOK_URL}?${testParams.toString()}`;
    console.log('테스트 URL:', testUrlWithParams.substring(0, 100) + '...');

    const response = await fetch(testUrlWithParams, {
      method: 'GET',
      headers: {
        'User-Agent': 'FoodN-App/1.0',
        'Accept': 'application/json',
      },
    });

    console.log('웹훅 테스트 응답 상태:', response.status);

    const responseText = await response.text();
    console.log('웹훅 테스트 응답 본문:', responseText);

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      webhookUrl: WEBHOOK_URL,
      testUrl: testUrlWithParams,
      response: responseText,
      timestamp: new Date().toISOString(),
      paramsSent: Object.fromEntries(testParams.entries())
    });

  } catch (error) {
    console.error('웹훅 테스트 중 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '웹훅 테스트 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error),
        webhookUrl: WEBHOOK_URL,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({
    message: '이 엔드포인트는 GET 메서드로만 접근 가능합니다.',
    usage: 'GET /api/test-webhook'
  });
}
