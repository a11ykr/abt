/**
 * ABT Processor 544 (Content Identification)
 * 5.4.4 콘텐츠 간의 구분 지침 진단 프로세서
 */
class Processor144 {
  constructor() {
    this.id = "1.4.4";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const reports = [];
    const inputs = document.querySelectorAll('input, select, textarea');

    for (const el of inputs) {
      const style = window.getComputedStyle(el);
      const border = style.borderWidth;
      const borderStyle = style.borderStyle;
      const bgColor = style.backgroundColor;
      const parentBg = window.getComputedStyle(el.parentElement).backgroundColor;

      // 1. 입력 필드 테두리 및 배경색 구분 확인
      const hasVisibleBorder = border !== '0px' && borderStyle !== 'none';
      const hasBgDifference = bgColor !== parentBg && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent';

      if (!hasVisibleBorder && !hasBgDifference) {
        reports.push(this.createReport(el, "수정 권고", "입력 필드가 배경과 시각적으로 잘 구분되지 않습니다. 테두리(border)를 추가하거나 배경색을 달리하여 입력 영역을 명확히 구분하세요."));
      }
    }

    // 2. 인접한 버튼 간의 간격 확인 (너무 붙어있는 경우)
    const buttons = document.querySelectorAll('button');
    for (let i = 0; i < buttons.length - 1; i++) {
        const b1 = buttons[i];
        const b2 = buttons[i+1];
        
        // 부모가 같은 경우에만 인접한 것으로 간주
        if (b1.parentElement === b2.parentElement) {
            const rect1 = b1.getBoundingClientRect();
            const rect2 = b2.getBoundingClientRect();
            
            // 가로 또는 세로 간격이 2px 미만인 경우 (매우 근접)
            const horizontalGap = Math.abs(rect2.left - rect1.right);
            const verticalGap = Math.abs(rect2.top - rect1.bottom);
            
            if (horizontalGap < 2 && verticalGap < 2 && rect1.width > 0 && rect2.width > 0) {
                reports.push(this.createReport(b1, "검토 필요", "인접한 버튼 간의 간격이 매우 좁습니다. 시각적으로 구분선이 있거나 충분한 여백이 있는지 확인하세요."));
            }
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
        message: message,
        rules: ["Rule 1.1 (Visual Distinction)"]
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
  window.ABTCore.registerProcessor("1.4.4", new Processor144());
}
