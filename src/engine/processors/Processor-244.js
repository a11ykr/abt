/**
 * ABT Processor 244 (Focus Not Obscured)
 * KWCAG 2.2 지침 2.4.4 고정된 참조 위치 정보 (Focus Not Obscured)
 */
class Processor244 {
  constructor() {
    this.id = "2.4.4";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const reports = [];
    const focusable = document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const stickyElements = Array.from(document.querySelectorAll('*')).filter(el => {
      const style = window.getComputedStyle(el);
      return style.position === 'fixed' || style.position === 'sticky';
    });

    if (stickyElements.length === 0) return [];

    for (const el of focusable) {
      if (this.utils.isHidden(el)) continue;
      
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;

      for (const sticky of stickyElements) {
        if (sticky.contains(el)) continue; // Focused element is part of the sticky container
        if (this.utils.isHidden(sticky)) continue;

        const sRect = sticky.getBoundingClientRect();
        
        // Check if sticky element overlaps with the focused element
        const isOverlapping = !(
          rect.right < sRect.left || 
          rect.left > sRect.right || 
          rect.bottom < sRect.top || 
          rect.top > sRect.bottom
        );

        if (isOverlapping) {
          const style = window.getComputedStyle(sticky);
          if (parseFloat(style.opacity) > 0.5 && style.visibility !== 'hidden') {
            reports.push(this.createReport(el, "검토 필요", `포커스된 요소가 고정 영역(selector: ${this.utils.getSelector(sticky)})에 의해 가려질 가능성이 있습니다. 키보드 접근 시 해당 요소가 시각적으로 노출되는지 확인하세요.`, sticky));
          }
        }
      }
    }

    return reports;
  }

  createReport(el, status, message, stickyEl) {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: el.tagName,
        selector: this.utils.getSelector(el)
      },
      context: { 
        smartContext: `Obscuring element: ${stickyEl ? this.utils.getSelector(stickyEl) : "unknown"}` 
      },
      result: { 
        status: status, 
        message: message,
        rules: ["Rule 2.4.4 (Focus Obscured)"]
      },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}

if (window.ABTCore) { window.ABTCore.registerProcessor("2.4.4", new Processor244()); }
