/**
 * ABT Processor 614
 * KWCAG 2.2 지침 6.1.4 입력 장치 접근성 (Input Device Accessibility)
 */
class Processor614 {
  constructor() {
    this.id = "614";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const reports = [];
    
    // Check for global touch/pointer event handlers that might disable scroll/zoom
    // This is hard to detect perfectly statically, so we check common antipatterns
    const touchElements = document.querySelectorAll('*');
    let foundPreventDefault = false;

    // Check inline handlers for preventDefault on touch events
    for (const el of touchElements) {
      const touchstart = el.getAttribute('ontouchstart');
      const touchmove = el.getAttribute('ontouchmove');
      
      if ((touchstart && touchstart.includes('preventDefault')) || 
          (touchmove && touchmove.includes('preventDefault'))) {
        reports.push(this.analyze(el, "inline"));
        foundPreventDefault = true;
      }
    }

    // Check CSS touch-action
    const styles = window.getComputedStyle(document.body);
    if (styles.touchAction === 'none') {
      reports.push(this.analyze(document.body, "css"));
    } else if (!foundPreventDefault) {
      // General manual review reminder for custom gestures
      reports.push(this.analyze(document.body, "general"));
    }

    return reports;
  }

  analyze(el, type) {
    let status = "검토 필요";
    let message = "다양한 입력 장치(마우스, 키보드, 터치)로 모든 기능이 작동하는지 수동 검토하세요.";
    const rules = ["Rule 614 (Manual Review)"];

    if (type === "inline") {
      status = "오류";
      message = "인라인 터치 이벤트에서 기본 동작(preventDefault)을 막고 있습니다. 스크롤이나 확대가 불가능해질 수 있습니다.";
      rules.push("Rule 614 (Prevent Default)");
    } else if (type === "css") {
      status = "오류";
      message = "body 요소의 CSS touch-action 속성이 'none'입니다. 모바일 기기에서 핀치 줌 등이 막힙니다.";
      rules.push("Rule 614 (Touch Action None)");
    } else {
      message = "드래그 앤 드롭, 스와이프 등 복잡한 제스처가 필요한 기능이 있다면 단일 포인터(클릭/탭)로도 조작 가능한 대체 수단이 있는지 확인하세요.";
    }

    return this.createReport(el, status, message, rules);
  }

  createReport(el, status, message, rules) {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: el.tagName,
        selector: el !== document.body ? this.utils.getSelector(el) : "body"
      },
      context: { smartContext: "입력 장치 제어 및 제스처 검토" },
      result: { status, message, rules },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}

if (window.ABTCore) { window.ABTCore.registerProcessor("614", new Processor614()); }