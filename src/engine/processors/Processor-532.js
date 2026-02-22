/**
 * ABT Processor 532 (Linear Structure)
 * 5.3.2 콘텐츠의 선형구조 지침 진단 프로세서
 */
class Processor532 {
  constructor() {
    this.id = "532";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const reports = [];
    const allElements = document.querySelectorAll('body *');

    for (const el of allElements) {
      // 스타일 계산이 필요한 검사 (비용이 있으므로 필요한 경우에만 수행)
      const style = window.getComputedStyle(el);
      
      // 1. Flex/Grid order 속성 사용 (시각적 순서 변경)
      if (style.order !== '0' && style.order !== 'initial') {
        reports.push(this.createReport(el, "검토 필요", `CSS 'order' 속성(${style.order})이 사용되었습니다. 시각적 순서와 마크업 순서가 일치하여 논리적 맥락을 유지하는지 확인하세요.`));
      }

      // 2. Flex direction reverse 사용
      if (style.flexDirection === 'row-reverse' || style.flexDirection === 'column-reverse') {
        reports.push(this.createReport(el, "검토 필요", `Flex 방향이 '${style.flexDirection}'로 설정되었습니다. 콘텐츠의 읽기 순서가 논리적인지 검토가 필요합니다.`));
      }

      // 3. Tabindex > 0 (611과 겹치지만 선형구조 측면에서도 중요)
      const tabindex = parseInt(el.getAttribute('tabindex') || '0', 10);
      if (tabindex > 0) {
        reports.push(this.createReport(el, "부적절", `양수 값의 tabindex(${tabindex})가 설정되어 자연스러운 선형 흐름을 방해합니다.`));
      }

      // 4. Aria-flowto 사용 (거의 사용되지 않으나 발견 시 안내)
      if (el.hasAttribute('aria-flowto')) {
        reports.push(this.createReport(el, "검토 필요", "aria-flowto 속성이 사용되었습니다. 보조기술 사용자가 예상한 읽기 순서대로 작동하는지 확인하세요."));
      }
    }

    // 5. Layout Table 내의 구조 (비선형적 데이터 흐름 가능성)
    const layoutTables = document.querySelectorAll('table[role="presentation"], table[role="none"]');
    for (const table of layoutTables) {
        reports.push(this.createReport(table, "검토 필요", "레이아웃용 표가 감지되었습니다. CSS 레이아웃(Flex/Grid)으로 전환을 권장하며, 제거 시에도 선형 구조가 유지되는지 확인하세요."));
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
      context: {
        smartContext: this.utils.getSmartContext(el, 50)
      },
      result: {
        status: status,
        message: message,
        rules: ["Rule 1.1 (Logical Ordering)"]
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
  window.ABTCore.registerProcessor("532", new Processor532());
}
