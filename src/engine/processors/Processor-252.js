/**
 * ABT Processor 252 (Pointer Abort)
 * KWCAG 2.2 지침 2.5.2 포인터 입력 취소 (Pointer Abort)
 */
class Processor252 {
  constructor() {
    this.id = "2.5.2";
    this.utils = window.ABTUtils;
  }

  async scan() {
    // 포인터 입력 취소는 mousedown/touchstart 단계에서만 이벤트가 발생하는지 검사합니다.
    const allElements = document.querySelectorAll('a, button, [role="button"], [onclick]');
    const reports = [];

    for (const el of allElements) {
      if (this.utils.isHidden(el)) continue;
      
      // 인라인 핸들러 검사 (제한적)
      const hasMouseDown = el.hasAttribute('onmousedown');
      const hasMouseUp = el.hasAttribute('onmouseup');
      const hasClick = el.hasAttribute('onclick');

      if (hasMouseDown && !hasMouseUp && !hasClick) {
        reports.push(this.createReport(el, "검토 필요", "mousedown 핸들러만 감지되었습니다. 사용자가 입력을 완료하기 전에 기능이 실행되어 취소가 불가능하지 않은지 확인하세요."));
      }
    }

    return reports;
  }

  createReport(el, status, message) {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: el.tagName,
        selector: this.utils.getSelector(el)
      },
      context: { smartContext: "포인터 다운 이벤트 핸들러가 감지되었습니다." },
      result: {
        status: status,
        message: message,
        rules: ["Rule 2.5.2 (Pointer Abort)"]
      },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}

if (window.ABTCore) { window.ABTCore.registerProcessor("2.5.2", new Processor252()); }
