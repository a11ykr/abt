/**
 * ABT Processor 732
 * KWCAG 2.2 지침 7.3.2 선택 항목의 강조 (Selection Highlighting)
 */
class Processor732 {
  constructor() {
    this.id = "732";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const reports = [];
    
    // Evaluate custom select/tabs/menus that use aria-selected or aria-current
    const selectableElements = document.querySelectorAll('[aria-selected="true"], [aria-current]:not([aria-current="false"])');
    
    for (const el of selectableElements) {
      if (this.utils.isHidden(el)) continue;
      
      // We can only check if they are programmatically indicated. 
      // Visual highlighting requires manual check.
      reports.push(this.analyze(el));
    }

    if (reports.length === 0) {
      reports.push(this.createReport(
        document.body,
        "검토 필요",
        "현재 선택된 탭, 메뉴, 페이지 등의 항목이 시각적으로 명확히 강조되며, 스크린 리더에도 그 상태(선택됨/현재 위치)가 전달되는지 검토하세요.",
        ["Rule 732 (Manual Review)"]
      ));
    }

    return reports;
  }

  analyze(el) {
    let status = "검토 필요";
    let message = "aria-selected 또는 aria-current 속성으로 선택 상태가 명시되어 있습니다. 시각적으로도 다른 항목과 명확히 구분되게 강조되어 있는지 확인하세요.";
    const rules = ["Rule 732 (Visual Highlight Review)"];

    return this.createReport(el, status, message, rules);
  }

  createReport(el, status, message, rules) {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: el.tagName,
        selector: el !== document.body ? this.utils.getSelector(el) : "body"
      },
      context: { smartContext: el !== document.body ? this.utils.getSmartContext(el) : "선택 항목 상태 명시 검토" },
      result: { status, message, rules },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}

if (window.ABTCore) { window.ABTCore.registerProcessor("732", new Processor732()); }