/**
 * ABT Processor 2.2.2 (Pause, Stop, Hide)
 * 
 * KWCAG 2.2 지침 2.2.2 정지 기능 제공
 * 자동으로 움직이거나 업데이트되는 콘텐츠는 사용자가 이를 일시 정지하거나 멈출 수 있어야 합니다.
 * 
 * [진단 범위]
 * - <video>, <audio> 요소
 * - 캐러셀, 슬라이더, 롤링 배너 (Common classes: .carousel, .slider, etc.)
 * - [role="marquee"], [role="timer"] 등
 * 
 * [주요 로직]
 * - 미디어 속성 체크: autoplay가 설정된 경우 controls 속성 또는 명시적 정지 버튼 유무 확인
 * - 캐러셀 컨트롤 탐지: 하위 요소 중 '정지', 'pause', 'stop' 키워드가 포함된 버튼이 존재하는지 확인
 * - 휴리스틱 검색: Swiper, Slick 등 유명 라이브러리의 공통 클래스명을 기반으로 자동 롤링 요소 식별
 */
class Processor222 {
  constructor() {
    this.id = "2.2.2";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const reports = [];
    
    // Find media elements that might auto-play or loop
    const mediaElements = document.querySelectorAll('video, audio');
    // Find carousels or sliders (heuristic based on common classes/roles)
    const carousels = document.querySelectorAll('[class*="carousel"], [class*="slider"], [class*="swiper"], [role="marquee"], [role="timer"]');

    for (const el of mediaElements) {
      reports.push(this.analyzeMedia(el));
    }

    for (const el of carousels) {
      reports.push(this.analyzeCarousel(el));
    }

    // If nothing found, add a general review note
    if (reports.length === 0) {
      reports.push(this.createReport(
        document.body,
        "검토 필요",
        "자동으로 변경되는 콘텐츠(슬라이더, 롤링 배너 등)가 있다면 정지/이전/다음 컨트롤이 제공되는지 확인하세요.",
        ["Rule 222. (General Manual Review)"]
      ));
    }

    return reports;
  }

  analyzeMedia(el) {
    let status = "적절";
    let message = "미디어 요소가 적절히 제공되었습니다.";
    const rules = [];

    const isAutoplay = el.hasAttribute('autoplay');
    const hasControls = el.hasAttribute('controls');
    const isLoop = el.hasAttribute('loop');

    if (isAutoplay && !hasControls) {
      status = "오류";
      message = "자동 재생되는 미디어에 정지/제어 수단(controls)이 제공되지 않았습니다.";
      rules.push("Rule 222. (Autoplay without Controls)");
    } else if (isAutoplay || isLoop) {
      status = "검토 필요";
      message = "자동 재생되거나 반복되는 미디어가 감지되었습니다. 3초 이상 지속되는 경우 사용자가 정지할 수 있는지 확인하세요.";
      rules.push("Rule 222. (Review Autoplay/Loop)");
    }

    return this.createReport(el, status, message, rules);
  }

  analyzeCarousel(el) {
    // Check if the carousel has pause/play buttons inside it
    const controls = el.querySelectorAll('button, [role="button"], a');
    let hasPauseText = false;
    
    controls.forEach(ctrl => {
      const text = (ctrl.textContent + ' ' + (ctrl.getAttribute('aria-label') || '')).toLowerCase();
      if (text.includes('정지') || text.includes('멈춤') || text.includes('pause') || text.includes('stop')) {
        hasPauseText = true;
      }
    });

    let status = hasPauseText ? "적절" : "검토 필요";
    let message = hasPauseText 
      ? "슬라이더/캐러셀 내에 정지(Pause/Stop) 관련 컨트롤이 감지되었습니다." 
      : "자동으로 갱신되는 슬라이더/캐러셀일 경우, 정지(Pause) 버튼이 제공되는지 수동으로 확인하세요.";
      
    return this.createReport(el, status, message, ["Rule 222. (Carousel Controls)"]);
  }

  createReport(el, status, message, rules) {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: el.tagName,
        selector: el !== document.body ? this.utils.getSelector(el) : "body"
      },
      context: { smartContext: el !== document.body ? this.utils.getSmartContext(el) : "자동 변경 콘텐츠 검토" },
      result: { status, message, rules },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}

if (window.ABTCore) { window.ABTCore.registerProcessor("2.2.2", new Processor222()); }