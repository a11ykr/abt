/**
 * ABT Processor 613
 * KWCAG 2.2 지침 6.1.3 조작 가능 (Touch Target Size)
 */
class Processor613 {
  constructor() {
    this.id = "613";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const interactables = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="link"], [role="menuitem"]');
    const reports = [];

    for (const el of interactables) {
      // Ignore hidden or small inline links
      if (el.tagName.toLowerCase() === 'a' && getComputedStyle(el).display === 'inline') {
        continue; // Inline links are usually exempt if inside text block
      }
      if (this.utils.isHidden(el)) continue;

      reports.push(this.analyze(el));
    }
    return reports;
  }

  analyze(el) {
    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    let status = "적절";
    let message = `터치 타겟 크기가 충분합니다. (${Math.round(width)}x${Math.round(height)}px)`;
    const rules = [];

    // KWCAG 2.2 usually requires diagonal 6.0mm (approx 24px) minimum for mobile.
    if (width > 0 && height > 0 && (width < 24 || height < 24)) {
      status = "검토 필요";
      message = `터치 타겟 크기가 너무 작을 수 있습니다 (${Math.round(width)}x${Math.round(height)}px). 모바일 환경인 경우 대각선 6.0mm (약 24px) 이상인지 확인하세요.`;
      rules.push("Rule 613 (Small Target Size)");
    }

    return this.createReport(el, status, message, rules, width, height);
  }

  createReport(el, status, message, rules, width, height) {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: el.tagName,
        selector: this.utils.getSelector(el),
      },
      context: { smartContext: `Size: ${Math.round(width)}x${Math.round(height)}px | ${this.utils.getSmartContext(el)}` },
      result: { status, message, rules },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}

if (window.ABTCore) { window.ABTCore.registerProcessor("613", new Processor613()); }