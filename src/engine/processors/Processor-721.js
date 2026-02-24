/**
 * ABT Processor 721
 * KWCAG 2.2 지침 7.2.1 사용자 인터페이스의 일관성 (UI Consistency)
 */
class Processor721 {
  constructor() {
    this.id = "721";
    this.utils = window.ABTUtils;
  }

  async scan() {
    // UI consistency across pages cannot be fully automated on a single page scan.
    // We will flag major repeated components (header, nav, footer) and ask for manual review.
    const reports = [];
    const landmarks = document.querySelectorAll('header, nav, main, footer, aside, [role="banner"], [role="navigation"], [role="main"], [role="contentinfo"]');

    if (landmarks.length > 0) {
      reports.push(this.analyze(document.body, Array.from(landmarks).map(l => l.tagName.toLowerCase()).join(', ')));
    } else {
      reports.push(this.createReport(
        document.body,
        "수정 권고",
        "웹 페이지에 시맨틱 랜드마크(header, nav, main, footer 등)가 사용되지 않았습니다. 일관된 구조 제공을 위해 랜드마크 사용을 권장합니다.",
        ["Rule 721 (Missing Landmarks)"]
      ));
    }

    return reports;
  }

  analyze(el, landmarkList) {
    const status = "검토 필요";
    const message = "웹 사이트 내에서 반복되는 영역(예: GNB, 푸터, 검색창 등)이 동일한 상대적 위치와 순서로 제공되는지 다른 페이지와 비교하여 검토하세요.";
    const rules = ["Rule 721 (Manual Consistency Review)"];

    return this.createReport(el, status, message, rules, `감지된 랜드마크: ${landmarkList}`);
  }

  createReport(el, status, message, rules, ctx = "UI 일관성 검토") {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: "document",
        selector: "body"
      },
      context: { smartContext: ctx },
      result: { status, message, rules },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}

if (window.ABTCore) { window.ABTCore.registerProcessor("721", new Processor721()); }