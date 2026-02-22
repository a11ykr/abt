/**
 * ABT Processor 611 (Keyboard Accessibility)
 * 6.1.1 키보드 사용 보장 지침 진단 프로세서
 */
class Processor611 {
  constructor() {
    this.id = "611";
    this.utils = window.ABTUtils;
    // 포커스가 가야 하는 대화형 태그 목록
    this.interactiveTags = ['a', 'button', 'input', 'select', 'textarea', 'details', 'summary'];
  }

  async scan() {
    const reports = [];
    
    // 1. 모든 요소 탐색 (이벤트 리스너가 있는 비표준 요소 찾기 위해)
    const allElements = document.querySelectorAll('*');
    
    for (const el of allElements) {
      const report = this.analyze(el);
      if (report) {
        reports.push(report);
      }
    }
    
    return reports;
  }

  analyze(el) {
    const tagName = el.tagName.toLowerCase();
    const hasClick = el.onclick || el.getAttribute('onclick');
    const hasTabindex = el.hasAttribute('tabindex');
    const tabindex = parseInt(el.getAttribute('tabindex') || '0', 10);
    const role = el.getAttribute('role');
    const isInteractiveTag = this.interactiveTags.includes(tagName);

    // [케이스 A] 비표준 대화형 요소 (div, span 등에 클릭 이벤트가 있으나 키보드 접근 불가)
    if (!isInteractiveTag && hasClick && !hasTabindex && !['presentation', 'none'].includes(role)) {
      return this.createReport(el, "오류", "요소에 클릭 이벤트가 있으나 키보드 포커스(tabindex)가 제공되지 않았습니다. 키보드 사용자가 접근할 수 없습니다.");
    }

    // [케이스 B] 대화형 요소인데 tabindex="-1"로 포커스가 차단된 경우
    if (isInteractiveTag && hasTabindex && tabindex < 0) {
      // 의도적인 숨김(aria-hidden 등)이 아닌 경우만 체크
      if (el.getAttribute('aria-hidden') !== 'true' && el.offsetParent !== null) {
        return this.createReport(el, "수정 권고", "대화형 요소에 tabindex='-1'이 설정되어 키보드 포커스가 차단되었습니다. 의도적인 처리가 아니라면 수정을 권고합니다.");
      }
    }

    // [케이스 C] tabindex가 0보다 큰 경우 (탭 순서 왜곡)
    if (hasTabindex && tabindex > 0) {
      return this.createReport(el, "수정 권고", "tabindex가 0보다 크게 설정되어 자연스러운 탭 순서를 방해합니다. tabindex='0' 또는 마크업 순서 조정을 권장합니다.");
    }

    // [케이스 D] 대화형 요소인데 키보드 이벤트 누락 (추정)
    // 실제로는 JS 핸들러를 완벽히 파악하기 어렵지만, 클릭만 있고 keydown/keypress가 없는 경우를 안내
    if (hasClick && !el.onkeydown && !el.onkeypress && !isInteractiveTag) {
        // 이 부분은 브라우저에서 동적으로 등록된 리스너를 찾기 어려우므로 '검토 필요'로 분류
        return this.createReport(el, "검토 필요", "클릭 핸들러는 있으나 키보드 이벤트(keydown 등) 핸들러가 감지되지 않았습니다. Enter/Space 키로 작동하는지 확인하세요.");
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
        role: el.getAttribute('role')
      },
      result: {
        status: status,
        message: message,
        rules: ["Rule 1.1 (Keyboard Interaction)"]
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
  window.ABTCore.registerProcessor("611", new Processor611());
}
