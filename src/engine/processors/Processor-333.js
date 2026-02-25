/**
 * ABT Processor 733
 * KWCAG 2.2 지침 3.3.3 콘텐츠의 선형 구조 (Linear Order - Redundant)
 * Note: KWCAG 2.2 often groups this. It's essentially 6.4.4 checked from a comprehension perspective.
 */
class Processor333 {
  constructor() {
    this.id = "3.3.3";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const reports = [];
    
    // Check if table layout is used for non-tabular data
    const tables = document.querySelectorAll('table:not([role="presentation"]):not([role="none"])');
    for (const el of tables) {
      if (this.utils.isHidden(el)) continue;

      const ths = el.querySelectorAll('th');
      // If table has no headers, it might be used for layout, which breaks linear comprehension
      if (ths.length === 0) {
        reports.push(this.analyze(el));
      }
    }

    if (reports.length === 0) {
      reports.push(this.createReport(
        document.body,
        "검토 필요",
        "페이지의 제목(Heading) 계층 구조가 논리적인 순서(h1 -> h2 -> h3)로 제공되어 콘텐츠를 순차적으로 이해할 수 있는지 수동으로 검토하세요.",
        ["Rule 733 (Heading Hierarchy Review)"]
      ));
    }

    return reports;
  }

  analyze(el) {
    const status = "검토 필요";
    const message = "제목 셀(<th>)이 없는 표가 감지되었습니다. 화면 배치를 목적으로 <table>을 사용한 경우 스크린 리더에서 읽는 순서가 엉킬 수 있으니 role='presentation'을 추가하거나 CSS 레이아웃으로 변경하세요.";
    const rules = ["Rule 733 (Layout Table Check)"];

    return this.createReport(el, status, message, rules);
  }

  createReport(el, status, message, rules) {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: el.tagName,
        selector: el !== document.body ? this.utils.getSelector(el) : "body"
      },
      context: { smartContext: el !== document.body ? this.utils.getSmartContext(el) : "콘텐츠 이해의 선형성 검토" },
      result: { status, message, rules },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}

if (window.ABTCore) { window.ABTCore.registerProcessor("3.3.3", new Processor333()); }