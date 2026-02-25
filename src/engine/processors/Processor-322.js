/**
 * ABT Processor 722
 * KWCAG 2.2 지침 3.2.2 데이터 입력 순서 (Data Input Order)
 */
class Processor322 {
  constructor() {
    this.id = "3.2.2";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const reports = [];
    
    // Evaluate tabindex attributes
    const tabIndexedElements = document.querySelectorAll('[tabindex]');
    let foundPositiveTabindex = false;

    for (const el of tabIndexedElements) {
      if (this.utils.isHidden(el)) continue;
      
      const tabIndex = parseInt(el.getAttribute('tabindex'), 10);
      if (tabIndex > 0) {
        foundPositiveTabindex = true;
        reports.push(this.analyze(el, "positive_tabindex"));
      }
    }

    if (!foundPositiveTabindex) {
      reports.push(this.analyze(document.body, "general"));
    }

    return reports;
  }

  analyze(el, type) {
    let status = "검토 필요";
    let message = "키보드 초점(Tab 키) 이동 순서가 논리적인지 수동으로 검토하세요.";
    const rules = ["Rule 722 (Manual Tab Order Review)"];

    if (type === "positive_tabindex") {
      status = "수정 권고";
      message = `양수 tabindex(${el.getAttribute('tabindex')})가 사용되었습니다. 이는 화면의 시각적 순서와 초점 이동 순서를 불일치하게 만들어 혼란을 줄 수 있습니다.`;
      rules.push("Rule 722 (Avoid Positive Tabindex)");
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
      context: { smartContext: el !== document.body ? this.utils.getSmartContext(el) : "키보드 탐색(Tab) 논리성 검토" },
      result: { status, message, rules },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}

if (window.ABTCore) { window.ABTCore.registerProcessor("3.2.2", new Processor322()); }