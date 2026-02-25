/**
 * ABT Processor 253
 * KWCAG 2.2 지침 2.5.3 레이블과 네임 (Label in Name)
 */
class Processor253 {
  constructor() {
    this.id = "2.5.3";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const interactiveElements = document.querySelectorAll('a, button, [role="button"], [role="link"], label');
    const reports = [];

    for (const el of interactiveElements) {
      if (this.utils.isHidden(el)) continue;
      
      const report = this.analyze(el);
      if (report) reports.push(report);
    }
    return reports;
  }

  analyze(el) {
    // 시각적 텍스트 추출 (자식 노드들의 텍스트 합계)
    const visibleText = el.innerText.trim();
    if (!visibleText) return null;

    // 프로그램적 네임(Accessible Name) 추출
    let accName = "";
    if (el.hasAttribute('aria-label')) {
      accName = el.getAttribute('aria-label').trim();
    } else if (el.hasAttribute('aria-labelledby')) {
      const target = document.getElementById(el.getAttribute('aria-labelledby'));
      if (target) accName = target.textContent.trim();
    } else if (el.hasAttribute('title')) {
      accName = el.getAttribute('title').trim();
    } else if (el.tagName.toLowerCase() === 'img') {
      accName = el.getAttribute('alt')?.trim() || "";
    }

    // 프로그램적 네임이 설정되어 있는데, 시각적 텍스트를 포함하지 않는 경우 진단
    if (accName && visibleText && !accName.toLowerCase().includes(visibleText.toLowerCase())) {
      return this.createReport(
        el, 
        "오류", 
        `시각적 레이블("${visibleText}")이 프로그램적 네임("${accName}")에 포함되어 있지 않습니다. 음성 제어 사용자의 혼란을 방지하기 위해 시각적 텍스트를 네임의 시작 부분에 포함하세요.`,
        ["Rule 2.5.3 (Label in Name)"],
        visibleText,
        accName
      );
    }

    return this.createReport(el, "적절", "시각적 레이블과 프로그램적 네임이 일치하거나 포함 관계에 있습니다.", [], visibleText, accName);
  }

  createReport(el, status, message, rules, visibleText, accName) {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: el.tagName,
        selector: this.utils.getSelector(el)
      },
      context: { 
        smartContext: `Visual: "${visibleText}" / AccName: "${accName}"` 
      },
      result: { status, message, rules },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}

if (window.ABTCore) { window.ABTCore.registerProcessor("2.5.3", new Processor253()); }
