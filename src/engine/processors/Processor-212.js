/**
 * ABT Processor 212 (Focus Order and Visibility)
 * KWCAG 2.2 지침 2.1.2 초점 이동과 표시
 */
class Processor212 {
  constructor() {
    this.id = "2.1.2";
    this.utils = window.ABTUtils;
    this.focusableSelectors = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), details, summary';
  }

  async scan() {
    const reports = [];
    const focusableElements = document.querySelectorAll(this.focusableSelectors);

    for (const el of focusableElements) {
      if (this.utils.isHidden(el)) continue;

      const report = await this.analyze(el);
      if (report) reports.push(report);
    }

    const tabindexedElements = Array.from(document.querySelectorAll('[tabindex]'))
      .filter(el => parseInt(el.getAttribute('tabindex') || '0', 10) > 0);
    
    const problematicTabindexes = tabindexedElements.filter(el => {
      // 페이지 상단 15% 이내(헤더/GNB 영역 등)에 시각적으로 위치해 있다면 예외 처리
      const rect = el.getBoundingClientRect();
      const isAtTopVisually = rect.top < window.innerHeight * 0.15;
      
      // DOM 트리 구조 상 최상위 그룹에 속하는지 계산 (단순화된 휴리스틱)
      let current = el;
      let isEarlyInDom = true;
      
      while (current && current !== document.body) {
        // 부모의 자식 요소 중 첫 5번째 이내에 들지 못하면 문서 뒤쪽으로 판단
        const index = Array.from(current.parentElement?.children || []).indexOf(current);
        if (index > 5) {
          isEarlyInDom = false;
          break;
        }
        current = current.parentElement;
      }

      // 시각적으로도 상단이 아니고, 마크업 구조로도 초반이 아닐 때만 문제로 간주
      return !(isAtTopVisually || isEarlyInDom);
    });
    
    if (problematicTabindexes.length > 0) {
      reports.push(this.createGeneralReport("수정 권고", `문서 중간/하단에 위치한 요소들에 양수 값의 tabindex(${problematicTabindexes.length}개)가 존재합니다. 이는 논리적인 초점 이동 순서를 방해할 수 있으므로, 가급적 DOM 구조를 통해 순서를 제어할 것을 권장합니다.`));
    }

    return reports;
  }

  async analyze(el) {
    const style = window.getComputedStyle(el);
    const hasNoOutline = style.outlineStyle === 'none' || parseInt(style.outlineWidth) === 0;
    
    if (hasNoOutline) {
      return this.createReport(el, "수정 권고", "요소의 outline이 제거되어 키보드 포커스 위치를 파악하기 어렵습니다. 시각적 초점 표시(Focus Indicator)를 제공하세요.");
    }

    // 초점 표시의 명도 대비 체크 (KWCAG 2.2 신규 기준 반영 시도)
    const outlineColor = style.outlineColor;
    const bgColor = this.utils.getLuminance(window.getComputedStyle(document.body).backgroundColor); // 단순화된 배경색
    const outlineLum = this.utils.getLuminance(outlineColor);
    const contrast = this.utils.getContrastRatio(outlineLum, bgColor);

    if (contrast < 3) {
      return this.createReport(el, "검토 필요", `초점 표시(outline)의 명도 대비가 배경과 낮습니다(약 ${contrast.toFixed(2)}:1). 시각적 확인을 위해 3:1 이상의 대비를 권장합니다.`);
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
      result: { status, message, rules: ["Rule 2.1.2 (Focus Visibility)"] },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }

  createGeneralReport(status, message) {
    return {
      guideline_id: this.id,
      elementInfo: { tagName: 'BODY', selector: 'document' },
      context: { smartContext: "페이지 전체 초점 흐름 검사" },
      result: { status, message, rules: ["Rule 2.1.2 (Focus Order)"] },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}

if (window.ABTCore) { window.ABTCore.registerProcessor("2.1.2", new Processor212()); }
