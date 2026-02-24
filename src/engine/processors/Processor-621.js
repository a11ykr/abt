/**
 * ABT Processor 621
 * KWCAG 2.2 지침 6.2.1 응답 시간 조절 (Adjustable Timing)
 */
class Processor621 {
  constructor() {
    this.id = "621";
    this.utils = window.ABTUtils;
  }

  async scan() {
    // This is primarily a manual check. 
    // We can look for meta refresh as an antipattern for forced timing.
    const reports = [];
    const metaRefresh = document.querySelector('meta[http-equiv="refresh"]');

    if (metaRefresh) {
      reports.push(this.analyze(metaRefresh, "meta_refresh"));
    } else {
      reports.push(this.analyze(document.body, "manual"));
    }

    return reports;
  }

  analyze(el, type) {
    let status = "검토 필요";
    let message = "시간 제한이 있는 콘텐츠(세션 만료, 자동 슬라이더 등)가 있는 경우, 사용자가 시간을 연장하거나 정지할 수 있는 수단이 제공되는지 확인하세요.";
    const rules = ["Rule 621 (Manual Review)"];

    if (type === "meta_refresh") {
      const content = el.getAttribute('content');
      // If refresh is less than 20 hours (72000s) and not 0, it might be an issue
      const timeMatch = content ? content.match(/^\d+/) : null;
      if (timeMatch && parseInt(timeMatch[0], 10) > 0) {
        status = "오류";
        message = `<meta http-equiv="refresh"> 태그를 사용한 자동 새로고침/리다이렉트가 감지되었습니다. 사용자가 이를 제어할 수 없습니다.`;
        rules.push("Rule 621 (Meta Refresh)");
      }
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
      context: { smartContext: el !== document.body ? this.utils.getSmartContext(el) : "타이머/시간 제한 검토" },
      result: { status, message, rules },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}

if (window.ABTCore) { window.ABTCore.registerProcessor("621", new Processor621()); }