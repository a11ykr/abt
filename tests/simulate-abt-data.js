const WebSocket = require('ws');

const SOCKET_URL = 'ws://localhost:8888';
const ws = new WebSocket(SOCKET_URL);

// 테스트용 모크 데이터 셋
const mockScenarios = [
  {
    guideline_id: "1.1",
    elementInfo: { tagName: "IMG", src: "https://via.placeholder.com/200", alt: "", selector: ".header > .logo" },
    context: { smartContext: "로고 영역입니다." },
    result: { status: "오류", message: "대체 텍스트(alt) 속성이 비어있습니다." }
  },
  {
    guideline_id: "1.1",
    elementInfo: { tagName: "IMG", src: "https://via.placeholder.com/300", alt: "메인 배너 이미지", selector: "#banner_01" },
    context: { smartContext: "신규 회원 가입 시 10,000원 쿠폰 증정" },
    result: { status: "검토 필요", message: "이미지 설명에 불필요한 단어('이미지')가 포함되어 있습니다." }
  },
  {
    guideline_id: "1.2",
    elementInfo: { tagName: "VIDEO", src: "https://example.com/promo.mp4", selector: ".hero-video" },
    context: { smartContext: "회사 홍보 영상입니다. [재생 버튼]" },
    result: { status: "검토 필요", message: "영상 콘텐츠의 자막 트랙(<track>)이 누락되었습니다." }
  },
  {
    guideline_id: "1.1",
    elementInfo: { tagName: "IMG", src: "https://via.placeholder.com/100", alt: "돋보기", selector: "button > img" },
    context: { smartContext: "검색하기" },
    result: { status: "검토 필요", message: "기능형 버튼 내부 이미지입니다. 동작 설명을 확인하세요." }
  }
];

ws.on('open', () => {
  console.log('✅ ABT Simulator connected to Desktop App');
  
  let count = 0;
  const interval = setInterval(() => {
    if (count >= mockScenarios.length) {
      console.log('✨ All test scenarios sent.');
      clearInterval(interval);
      ws.close();
      return;
    }

    const data = mockScenarios[count];
    ws.send(JSON.stringify(data));
    console.log(`🚀 Sent data for Guideline ${data.guideline_id} (${data.elementInfo.tagName})`);
    
    count++;
  }, 1000); // 1초 간격으로 전송
});

ws.on('error', (err) => {
  console.error('❌ Connection failed. Is ABT Desktop running?');
  process.exit(1);
});
