/**
 * ABT Processor 631
 * KWCAG 2.2 지침 6.3.1 번쩍임 제한 (Flashing Limit)
 */
class Processor631 {
  constructor() {
    this.id = "631";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const reports = [];
    const elements = document.querySelectorAll('marquee, blink, video, [class*="anim"], [class*="flash"]');
    
    if (elements.length > 0) {
      for (const el of elements) {
        reports.push(this.analyze(el));
      }
    } else {
      reports.push(this.analyze(document.body, true));
    }
    return reports;
  }

  analyze(el, isDocumentLevel = false) {
    let status = "검토 필요";
    let message = "초당 3~50회의 주기로 번쩍이는 콘텐츠가 있는지 수동으로 검토하세요. (광과민성 발작 주의)";
    const rules = ["Rule 631 (Manual Review)"];
    
    if (!isDocumentLevel && ["marquee", "blink"].includes(el.tagName.toLowerCase())) {
      status = "오류";
      message = `<${el.tagName.toLowerCase()}> 태그가 사용되었습니다. 번쩍이거나 스크롤되는 콘텐츠를 제어할 수 있어야 합니다.`;
      rules.push("Rule 631 (Deprecated Tags)");
    } else if (!isDocumentLevel) {
      message = `애니메이션/비디오 관련 요소가 감지되었습니다. 3회 이상 번쩍임이 있는지 수동 검토가 필요합니다.`;
    }

    return this.createReport(el, status, message, rules);
  }

  createReport(el, status, message, rules) {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: el.tagName,
        selector: isNaN(el) && el !== document.body ? this.utils.getSelector(el) : "body"
      },
      context: { smartContext: el !== document.body ? this.utils.getSmartContext(el) : "문서 전체 검토" },
      result: { status, message, rules },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}

if (window.ABTCore) { window.ABTCore.registerProcessor("631", new Processor631()); }