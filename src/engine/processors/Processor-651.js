/**
 * ABT Processor 651
 * KWCAG 2.2 지침 6.5.1 표 표제 제공 (Table Caption)
 */
class Processor651 {
  constructor() {
    this.id = "651";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const tables = document.querySelectorAll('table');
    const reports = [];

    for (const el of tables) {
      reports.push(this.analyze(el));
    }
    return reports;
  }

  analyze(el) {
    const caption = el.querySelector('caption');
    const summary = el.getAttribute('summary');
    const ariaLabel = el.getAttribute('aria-label');
    const ariaDescribedBy = el.getAttribute('aria-describedby');
    
    let status = "적절";
    let message = "데이터 표에 적절한 제목(caption, summary 등)이 제공되었습니다.";
    const rules = [];

    if (!caption && !summary && !ariaLabel && !ariaDescribedBy) {
      // Check if it's strictly a layout table
      const role = el.getAttribute('role');
      if (role === 'presentation' || role === 'none') {
        status = "적절";
        message = "레이아웃용 표로 선언되었습니다 (role='presentation').";
      } else {
        status = "오류";
        message = "데이터 표에 <caption>, summary 또는 aria-label이 제공되지 않았습니다.";
        rules.push("Rule 651 (Missing Caption)");
      }
    } else if (caption && !caption.textContent.trim()) {
      status = "오류";
      message = "<caption> 요소가 존재하지만 내용이 비어있습니다.";
      rules.push("Rule 651 (Empty Caption)");
    } else if (summary && summary.trim() === "") {
      status = "오류";
      message = "summary 속성이 존재하지만 내용이 비어있습니다.";
      rules.push("Rule 651 (Empty Summary)");
    } else {
      status = "검토 필요";
      message = "표의 제목이 표의 내용과 구조를 명확히 설명하는지 검토하세요.";
      rules.push("Rule 651 (Manual Review)");
    }

    return this.createReport(el, status, message, rules, caption, summary);
  }

  createReport(el, status, message, rules, caption, summary) {
    let captionText = "없음";
    if (caption) captionText = `caption: ${caption.textContent.trim()}`;
    else if (summary) captionText = `summary: ${summary}`;

    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: el.tagName,
        selector: this.utils.getSelector(el)
      },
      context: { smartContext: `표 제목: ${captionText}` },
      result: { status, message, rules },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}

if (window.ABTCore) { window.ABTCore.registerProcessor("651", new Processor651()); }