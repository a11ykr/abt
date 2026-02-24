/**
 * ABT Processor 612 (Focus Order and Visibility)
 * 6.1.2 초점 이동과 표시 지침 진단 프로세서
 */
class Processor612 {
  constructor() {
    this.id = "612";
    this.utils = window.ABTUtils;
    this.focusableSelectors = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), details, summary';
  }

  async scan() {
    const reports = [];
    const focusableElements = document.querySelectorAll(this.focusableSelectors);

    for (const el of focusableElements) {
      // 숨겨진 요소는 건너뜀
      if (el.offsetWidth === 0 || el.offsetHeight === 0 || window.getComputedStyle(el).visibility === 'hidden') {
        continue;
      }

      const report = this.analyze(el);
      if (report) {
        reports.push(report);
      }
    }

    // 초점 이동 순서 (Focus Order) 검사 - 탭인덱스 혼용 여부
    const tabindexedElements = Array.from(document.querySelectorAll('[tabindex]'))
      .filter(el => parseInt(el.getAttribute('tabindex') || '0', 10) > 0);
    
    if (tabindexedElements.length > 0) {
      reports.push(this.createGeneralReport("수정 권고", `페이지 내에 양수 값의 tabindex(${tabindexedElements.length}개)가 존재합니다. 이는 논리적인 초점 이동 순서를 방해할 수 있으므로 마크업 순서 조정을 권장합니다.`));
    }

    return reports;
  }

  analyze(el) {
    const style = window.getComputedStyle(el);
    
    // [케이스 A] outline: none 또는 outline-width: 0 (초점 표시 제거)
    // 브라우저 기본 포커스 링을 강제로 없앤 경우 탐지
    const hasNoOutline = style.outlineStyle === 'none' || parseInt(style.outlineWidth) === 0;
    
    // 만약 outline은 없는데 border 등으로 별도의 포커스 스타일을 제공할 수도 있으므로 '수정 권고' 또는 '검토 필요'
    if (hasNoOutline) {
      // shadow DOM이나 특정 라이브러리에서 사용하는 focus-visible 체크는 어려우므로 속성 기반으로 1차 판단
      return this.createReport(el, "수정 권고", "요소의 outline이 제거되어 키보드 포커스 위치를 파악하기 어렵습니다. 시각적 초점 표시(Focus Indicator)를 제공하세요.");
    }

    return null;
  }

  createReport(el, status, message) {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: el.tagName,
        selector: this.utils.getSelector(el)
      },
      context: {
        smartContext: this.utils.getSmartContext(el, 50),
        tabindex: el.getAttribute('tabindex'),
        outline: window.getComputedStyle(el).outline
      },
      result: {
        status: status,
        message: message,
        rules: ["Rule 2.1 (Focus Visibility)"]
      },
      currentStatus: status,
      history: [{
        timestamp: new Date().toLocaleTimeString(),
        status: "탐지",
        comment: message
      }]
    };
  }

  createGeneralReport(status, message) {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: 'BODY',
        selector: 'document'
      },
      context: {
        smartContext: "페이지 전체 초점 흐름 검사"
      },
      result: {
        status: status,
        message: message,
        rules: ["Rule 1.1 (Focus Order)"]
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
  window.ABTCore.registerProcessor("612", new Processor612());
}
