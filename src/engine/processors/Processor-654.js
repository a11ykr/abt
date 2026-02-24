/**
 * ABT Processor 654
 * KWCAG 2.2 지침 6.5.4 오류 정정 (Error Correction)
 */
class Processor654 {
  constructor() {
    this.id = "654";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const reports = [];
    
    // Check forms that might require error correction (has required inputs)
    const forms = document.querySelectorAll('form');
    
    for (const form of forms) {
      if (this.utils.isHidden(form)) continue;
      
      const requiredInputs = form.querySelectorAll('input[required], select[required], textarea[required], [aria-required="true"]');
      if (requiredInputs.length > 0) {
        reports.push(this.analyze(form, requiredInputs.length));
      }
    }

    // If no forms found, we still add a manual review for custom input widgets
    if (reports.length === 0) {
      reports.push(this.createReport(
        document.body,
        "검토 필요",
        "서식(form) 요소는 없으나 입력 위젯이 있다면, 입력 오류 발생 시 그 원인과 정정 방법을 사용자에게 명확히 알려주는지 수동으로 검토하세요.",
        ["Rule 654 (Manual Review)"],
        "없음"
      ));
    }

    return reports;
  }

  analyze(el, reqCount) {
    let status = "검토 필요";
    let message = `필수 입력 항목이 포함된 서식(form)입니다. (필수 항목 ${reqCount}개). 폼 제출 시 오류가 발생하면, 오류의 위치와 원인을 텍스트로 명확히 안내하는지 수동 검토가 필요합니다.`;
    const rules = ["Rule 654 (Form Error Correction)"];

    // Check for aria-invalid on inputs to see if they use ARIA error handling
    const invalidInputs = el.querySelectorAll('[aria-invalid="true"]');
    if (invalidInputs.length > 0) {
      let hasErrorDesc = true;
      invalidInputs.forEach(input => {
        if (!input.hasAttribute('aria-describedby') && !input.hasAttribute('aria-errormessage')) {
          hasErrorDesc = false;
        }
      });

      if (!hasErrorDesc) {
        status = "오류";
        message = "aria-invalid='true'로 오류 상태가 표시된 항목 중, 구체적인 오류 메시지(aria-errormessage 등)가 연결되지 않은 항목이 있습니다.";
        rules.push("Rule 654 (Missing Error Message)");
      } else {
        status = "적절"; // Or mostly acceptable
        message = "오류 상태(aria-invalid)와 오류 메시지가 적절하게 ARIA 속성으로 연결되어 있습니다.";
      }
    }

    return this.createReport(el, status, message, rules, `Required inputs: ${reqCount}`);
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

if (window.ABTCore) { window.ABTCore.registerProcessor("654", new Processor654()); }