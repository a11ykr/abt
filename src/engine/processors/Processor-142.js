/**
 * ABT Processor 142 (Audio Control)
 * KWCAG 2.2 지침 1.4.2 자동 재생 금지 지침 진단 프로세서
 */
class Processor142 {
  constructor() {
    this.id = "1.4.2";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const reports = [];
    const mediaElements = document.querySelectorAll('video, audio, iframe[src*="youtube.com"], iframe[src*="vimeo.com"]');

    for (const el of mediaElements) {
      // 자동화 도구의 한계를 고려하여, 미디어 요소 발견 시 무조건 검토 필요로 분류합니다.
      reports.push(this.createReport(el, "검토 필요", "미디어 요소가 감지되었습니다. 페이지 로드 시 소리가 자동으로 재생되는지, 그리고 이를 제어할 수 있는 수단이 있는지 수동으로 확인하세요."));
    }

    return reports;
  }

  createReport(el, status, message, rules = ["Rule 1.4.2 (Manual Audio Review)"]) {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: el.tagName,
        selector: this.utils.getSelector(el)
      },
      context: {
        smartContext: this.utils.getSmartContext(el, 50)
      },
      result: {
        status: status,
        message: message,
        rules: rules
      },
      currentStatus: status,
      history: [{
        timestamp: new Date().toLocaleTimeString(),
        status: "탐지",
        comment: message
      }]
    };
  }
}

if (window.ABTCore) {
  window.ABTCore.registerProcessor("1.4.2", new Processor142());
}
