class Processor643 {
  constructor() {
    this.id = "643";
    this.utils = window.ABTUtils;
    this.vagueWords = ['여기', '클릭', '더 보기', '자세히', 'go', 'link', 'more', 'click', 'here'];
  }

  async scan() {
    const reports = [];
    const links = document.querySelectorAll('a, [role="link"]');

    for (const el of links) {
      const text = el.innerText ? el.innerText.trim() : "";
      const ariaLabel = el.getAttribute('aria-label');
      const title = el.getAttribute('title');
      const alt = el.querySelector('img') ? el.querySelector('img').getAttribute('alt') : null;
      
      const accessibleName = (text || ariaLabel || title || alt || "").trim();

      if (!accessibleName) {
        reports.push(this.createReport(el, "오류", "링크의 목적을 알 수 있는 텍스트(성명)가 제공되지 않았습니다."));
      } else if (this.vagueWords.includes(accessibleName.toLowerCase())) {
        reports.push(this.createReport(el, "부적절", `링크 텍스트('${accessibleName}')가 너무 모호하여 맥락 없이는 목적을 파악하기 어렵습니다.`));
      } else if (/^https?:\/\//i.test(accessibleName)) {
        reports.push(this.createReport(el, "수정 권고", "링크 텍스트로 기계적인 URL이 노출되고 있습니다. 서술적인 문구로 대체를 권장합니다."));
      }
    }

    return reports;
  }

  createReport(el, status, message) {
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
        message: message
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
  window.ABTCore.registerProcessor("643", new Processor643());
}
