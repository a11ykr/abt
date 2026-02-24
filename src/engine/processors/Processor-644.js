/**
 * ABT Processor 644
 * KWCAG 2.2 지침 6.4.4 콘텐츠 선형 구조 (Linear Order)
 */
class Processor644 {
  constructor() {
    this.id = "644";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const reports = [];
    
    // Check for elements that severely break linear visual vs DOM order
    // Absolute/fixed positioning, flex/grid with order manipulation, or high positive tabindex
    const checkElements = document.querySelectorAll('*');
    
    let badTabindexCount = 0;
    const tabIndexElements = [];

    for (const el of checkElements) {
      if (this.utils.isHidden(el)) continue;

      // 1. Check for tabindex > 0 (breaks natural order)
      const tabIndex = el.getAttribute('tabindex');
      if (tabIndex && parseInt(tabIndex, 10) > 0) {
        badTabindexCount++;
        if (badTabindexCount <= 3) {
          tabIndexElements.push(el);
        }
      }

      // 2. Check for CSS order property in flex/grid
      const styles = window.getComputedStyle(el);
      if (styles.order && styles.order !== '0' && styles.order !== 'auto') {
        reports.push(this.analyzeOrder(el));
      }
    }

    if (badTabindexCount > 0) {
      for (const el of tabIndexElements) {
        reports.push(this.analyzeTabindex(el));
      }
      if (badTabindexCount > 3) {
        reports.push(this.createReport(
          document.body,
          "검토 필요",
          `양수 tabindex(>0)를 가진 요소가 ${badTabindexCount}개 있습니다. 스크린 리더 및 키보드 탐색 순서가 논리적인지 검토하세요.`,
          ["Rule 644 (Excessive TabIndex)"]
        ));
      }
    }

    // If no specific structural issues found, still require a general review
    if (reports.length === 0) {
      reports.push(this.createReport(
        document.body,
        "검토 필요",
        "CSS로 시각적 배치를 변경한 경우(float, absolute, flex/grid 등), 소스코드(DOM)의 논리적 순서와 일치하는지 수동 검토하세요.",
        ["Rule 644 (General Order Review)"]
      ));
    }

    return reports;
  }

  analyzeOrder(el) {
    const status = "수정 권고";
    const message = "CSS 'order' 속성을 사용하여 시각적 순서를 변경했습니다. 스크린 리더가 읽는 순서(DOM)와 불일치할 수 있으므로 주의하세요.";
    return this.createReport(el, status, message, ["Rule 644 (CSS Order property)"]);
  }

  analyzeTabindex(el) {
    const status = "수정 권고";
    const message = `양수 tabindex(${el.getAttribute('tabindex')})가 사용되었습니다. 이는 논리적인 초점 이동 순서를 방해할 수 있으므로 가급적 DOM 구조를 통해 순서를 제어하세요.`;
    return this.createReport(el, status, message, ["Rule 644 (Positive TabIndex)"]);
  }

  createReport(el, status, message, rules) {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: el.tagName,
        selector: el !== document.body ? this.utils.getSelector(el) : "body"
      },
      context: { smartContext: el !== document.body ? this.utils.getSmartContext(el) : "문서 논리 구조 검토" },
      result: { status, message, rules },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}

if (window.ABTCore) { window.ABTCore.registerProcessor("644", new Processor644()); }