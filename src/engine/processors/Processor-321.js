/**
 * ABT Processor 321 (On Focus)
 * KWCAG 2.2 지침 3.2.1 사용자 요구에 따른 실행 (On Focus)
 */
class Processor321 {
  constructor() {
    this.id = "3.2.1";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const reports = [];
    const allElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');

    for (const el of allElements) {
      if (this.utils.isHidden(el)) continue;

      // 1. 인라인 포커스 이벤트 핸들러 확인 (제한적이지만 탐지 가능)
      const hasOnFocus = el.hasAttribute('onfocus');
      const hasOnBlur = el.hasAttribute('onblur');

      if (hasOnFocus || hasOnBlur) {
        reports.push(this.createReport(el, "검토 필요", "요소에 포커스(onfocus/onblur) 관련 이벤트가 감지되었습니다. 사용자가 예측하지 못한 창 열림, 양식 전송, 미디어 재생 등의 컨텍스트 변화가 초점 이동만으로 발생하지 않는지 확인하세요."));
      }

      // 2. target="_blank" 이면서 경고 메시지 없는 링크 (3.2.1의 확장된 검토 사례)
      if (el.tagName.toLowerCase() === 'a' && el.getAttribute('target') === '_blank') {
        const text = el.innerText.trim();
        const hasWarning = text.includes('새 창') || text.includes('new window') || el.hasAttribute('aria-label');
        if (!hasWarning) {
          reports.push(this.createReport(el, "수정 권고", "새 창으로 열리는 링크입니다. 초점을 받았을 때 경고 없이 컨텍스트가 변할 수 있으므로, 링크 텍스트에 '새 창' 등의 안내를 포함할 것을 권장합니다."));
        }
      }
    }

    // 3. 페이지 로드 시 자동 포커스 (Autofocus)
    const autoFocusEl = document.querySelector('[autofocus]');
    if (autoFocusEl) {
      reports.push(this.createReport(autoFocusEl, "검토 필요", "페이지 로드 시 특정 요소에 자동으로 초점(autofocus)이 이동됩니다. 사용자가 원치 않는 컨텍스트 변화가 아닌지 확인하세요."));
    }

    return reports;
  }

  createReport(el, status, message, rules = ["Rule 3.2.1 (On Focus Context Change)"]) {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: el.tagName,
        selector: this.utils.getSelector(el)
      },
      context: {
        smartContext: this.utils.getSmartContext(el, 50)
      },
      result: {
        status: status,
        message: message,
        rules: rules
      },
      currentStatus: status,
      history: [{
        timestamp: new Date().toLocaleTimeString(),
        status: "탐지",
        comment: message
      }]
    };
  }
}

if (window.ABTCore) {
  window.ABTCore.registerProcessor("3.2.1", new Processor321());
}
