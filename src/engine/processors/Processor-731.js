/**
 * ABT Processor 731
 * KWCAG 2.2 지침 7.3.1 콘텐츠 간의 구분 (Content Differentiation)
 */
class Processor731 {
  constructor() {
    this.id = "731";
    this.utils = window.ABTUtils;
  }

  async scan() {
    // This is primarily a visual layout check that requires manual review.
    // We flag the document for a manual check of content blocks.
    const reports = [];
    
    reports.push(this.createReport(
      document.body,
      "검토 필요",
      "이웃한 콘텐츠 영역(예: 본문과 사이드바, 헤더와 본문 등)이 시각적으로 명확히 구분되는지 확인하세요. (테두리, 여백, 배경색 등)",
      ["Rule 731 (Manual Visual Review)"]
    ));

    return reports;
  }

  createReport(el, status, message, rules) {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: "document",
        selector: "body"
      },
      context: { smartContext: "레이아웃 및 시각적 디자인 검토" },
      result: { status, message, rules },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}

if (window.ABTCore) { window.ABTCore.registerProcessor("731", new Processor731()); }