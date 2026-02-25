/**
 * ABT Processor 2.1.3
 * KWCAG 2.2 지침 2.1.3 조작 가능 (Touch Target Size)
 */
class Processor213 {
  constructor() {
    this.id = "2.1.3";
    // window.ABTUtils가 정의되어 있는지 확인 (런타임 안정성 강화)
    this.utils = window.ABTUtils || { isHidden: () => false, getSelector: (el) => el.tagName, getSmartContext: () => "" };
  }

  async scan() {
    const interactables = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="link"], [role="menuitem"]');
    const reports = [];

    for (const el of interactables) {
      // Inline links inside text blocks are usually exempt
      if (el.tagName.toLowerCase() === 'a' && window.getComputedStyle(el).display === 'inline') {
        continue;
      }
      
      // utils.isHidden 메서드가 존재하는지 다시 한번 확인
      if (this.utils && typeof this.utils.isHidden === 'function') {
        if (this.utils.isHidden(el)) continue;
      }

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

    // KWCAG 2.2: 최소 24x24px 권장
    if (width > 0 && height > 0 && (width < 24 || height < 24)) {
      status = "검토 필요";
      message = `터치 타겟 크기가 너무 작을 수 있습니다 (${Math.round(width)}x${Math.round(height)}px). 모바일 환경인 경우 약 24px 이상인지 확인하세요.`;
      rules.push("Rule 2.1.3 (Small Target Size)");
    }

    return this.createReport(el, status, message, rules, width, height);
  }

  createReport(el, status, message, rules, width, height) {
    const selector = (this.utils && typeof this.utils.getSelector === 'function') 
      ? this.utils.getSelector(el) 
      : el.tagName;
      
    const smartContext = (this.utils && typeof this.utils.getSmartContext === 'function')
      ? this.utils.getSmartContext(el)
      : "";

    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: el.tagName,
        selector: selector,
      },
      context: { smartContext: `Size: ${Math.round(width)}x${Math.round(height)}px | ${smartContext}` },
      result: { status, message, rules },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}

if (window.ABTCore) { 
  window.ABTCore.registerProcessor("2.1.3", new Processor213()); 
}
