/**
 * ABT Processor 3.3.4
 * KWCAG 2.2 지침 3.3.4 자동 이동 금지 (Prevent Auto-Focus/Redirect)
 */
class Processor334 {
  constructor() {
    this.id = "3.3.4";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const reports = [];
    
    // Check for autofocus attribute
    const autofocusElements = document.querySelectorAll('[autofocus]');
    
    for (const el of autofocusElements) {
      if (this.utils.isHidden(el)) continue;
      reports.push(this.analyze(el));
    }

    if (reports.length === 0) {
      reports.push(this.createReport(
        document.body,
        "검토 필요",
        "페이지 진입 시 사용자의 의지와 무관하게 새 창이 열리거나 초점이 이동하는 기능이 있는지 수동으로 확인하세요.",
        ["Rule 334. (Manual Context Change Review)"]
      ));
    }

    return reports;
  }

  analyze(el) {
    let status = "검토 필요";
    let message = "autofocus 속성이 사용되었습니다. 페이지가 로드될 때 사용자의 의지와 상관없이 초점이 이동하여 혼란을 줄 수 있으므로 사용을 지양하세요.";
    const rules = ["Rule 334. (Autofocus Attribute)"];

    return this.createReport(el, status, message, rules);
  }

  createReport(el, status, message, rules) {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: el.tagName,
        selector: el !== document.body ? this.utils.getSelector(el) : "body"
      },
      context: { smartContext: el !== document.body ? this.utils.getSmartContext(el) : "자동 초점/리다이렉트 동작 검토" },
      result: { status, message, rules },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}

if (window.ABTCore) { window.ABTCore.registerProcessor("3.3.4", new Processor334()); }