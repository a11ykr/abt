/**
 * ABT Processor 821
 * KWCAG 2.2 지침 8.2.1 웹 애플리케이션 접근성 (Web App Accessibility - ARIA)
 */
class Processor821 {
  constructor() {
    this.id = "821";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const reports = [];
    
    // Find custom widgets that use ARIA roles but might lack required attributes or keyboard support
    // (A very basic heuristic check for ARIA misuse)
    const customWidgets = document.querySelectorAll('[role="button"], [role="link"], [role="checkbox"], [role="switch"], [role="tab"], [role="dialog"], [role="menuitem"]');
    
    for (const el of customWidgets) {
      if (this.utils.isHidden(el)) continue;
      reports.push(this.analyze(el));
    }

    if (reports.length === 0) {
      reports.push(this.createReport(
        document.body,
        "검토 필요",
        "동적으로 변하는 콘텐츠나 커스텀 위젯이 있는 경우, ARIA 속성이 올바르게 사용되었는지 수동으로 검토하세요.",
        ["Rule 821 (Manual ARIA Review)"],
        "없음"
      ));
    }

    return reports;
  }

  analyze(el) {
    let status = "검토 필요";
    let message = `역할(role="${el.getAttribute('role')}")이 부여된 커스텀 위젯입니다. 상태 변화(예: aria-expanded, aria-checked)가 스크린 리더에 잘 전달되고 키보드로 조작 가능한지 확인하세요.`;
    const rules = ["Rule 821 (Custom Widget Review)"];
    
    const role = el.getAttribute('role');

    // Basic heuristic: Custom interactive widgets should generally have a tabindex to be focusable
    if (['button', 'link', 'checkbox', 'switch', 'tab', 'menuitem'].includes(role) && !el.hasAttribute('tabindex') && !['A', 'BUTTON', 'INPUT'].includes(el.tagName)) {
      status = "수정 권고";
      message = `역할(role="${role}")이 부여되었으나 초점을 받을 수 없습니다(tabindex 누락). 키보드 접근성을 확인하세요.`;
      rules.push("Rule 821 (Missing Tabindex on Widget)");
    }

    return this.createReport(el, status, message, rules, `Role: ${role}`);
  }

  createReport(el, status, message, rules, ctxInfo) {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: el.tagName,
        selector: el !== document.body ? this.utils.getSelector(el) : "body"
      },
      context: { smartContext: ctxInfo },
      result: { status, message, rules },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}

if (window.ABTCore) { window.ABTCore.registerProcessor("821", new Processor821()); }