/**
 * ABT Processor 811
 * KWCAG 2.2 지침 8.1.1 마크업 오류 방지 (Markup Error Prevention)
 */
class Processor811 {
  constructor() {
    this.id = "811";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const reports = [];
    
    // Check for duplicate IDs which is a common markup error affecting a11y
    const allElementsWithId = document.querySelectorAll('[id]');
    const idMap = new Map();
    const duplicateIds = new Set();

    for (const el of allElementsWithId) {
      const id = el.id;
      if (idMap.has(id)) {
        duplicateIds.add(id);
      } else {
        idMap.set(id, el);
      }
    }

    if (duplicateIds.size > 0) {
      for (const id of duplicateIds) {
        // Find all elements with this duplicate ID
        const duplicates = document.querySelectorAll(`[id="${id}"]`);
        // Just report the first one as representative
        reports.push(this.analyze(duplicates[0], id));
      }
    }

    if (reports.length === 0) {
      reports.push(this.createReport(
        document.body,
        "검토 필요",
        "중복된 ID 속성은 발견되지 않았습니다. W3C Nu HTML Checker 등 외부 도구를 이용해 여닫는 태그, 속성 중복 등의 마크업 오류를 확인하세요.",
        ["Rule 811 (Manual Markup Review)"]
      ));
    }

    return reports;
  }

  analyze(el, duplicateId) {
    const status = "오류";
    const message = `문서 내에 중복된 ID 속성값("${duplicateId}")이 존재합니다. ID는 문서 내에서 유일해야 스크린 리더와 폼 제어 기능이 정상 작동합니다.`;
    const rules = ["Rule 811 (Duplicate ID)"];

    return this.createReport(el, status, message, rules);
  }

  createReport(el, status, message, rules) {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: el.tagName,
        selector: el !== document.body ? this.utils.getSelector(el) : "body"
      },
      context: { smartContext: el !== document.body ? this.utils.getSmartContext(el) : "마크업 유효성 검사" },
      result: { status, message, rules },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}

if (window.ABTCore) { window.ABTCore.registerProcessor("811", new Processor811()); }