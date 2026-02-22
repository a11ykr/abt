/**
 * ABT Processor 543 (Contrast Minimum)
 * 5.4.3 텍스트 콘텐츠의 명도 대비 지침 진단 프로세서
 */
class Processor543 {
  constructor() {
    this.id = "543";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const reports = [];
    // 모든 텍스트가 포함된 요소 탐색
    const elements = document.querySelectorAll('body *');

    for (const el of elements) {
      // 텍스트 노드가 없는 요소는 건너뜀 (이미지 등은 별도 처리 필요하지만 여기선 텍스트 위주)
      const hasText = Array.from(el.childNodes).some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0);
      if (!hasText) continue;

      const style = window.getComputedStyle(el);
      const color = style.color;
      const bgColor = this.getRecursiveBackgroundColor(el);

      const l1 = this.utils.getLuminance(color);
      const l2 = this.utils.getLuminance(bgColor);
      const contrast = this.utils.getContrastRatio(l1, l2);

      // 폰트 크기 및 두께에 따른 기준 설정
      const fontSize = parseFloat(style.fontSize);
      const fontWeight = style.fontWeight;
      const isLargeText = fontSize >= 24 || (fontSize >= 18.66 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));

      const threshold = isLargeText ? 3.0 : 4.5;

      if (contrast < threshold) {
        reports.push(this.createReport(el, "수정 권고", `텍스트와 배경의 명도 대비가 ${contrast.toFixed(2)}:1로, 기준치(${threshold}:1)보다 낮습니다. (폰트: ${fontSize}px, ${fontWeight})`));
      }
    }

    return reports;
  }

  /**
   * 요소의 배경색을 부모 요소를 거슬러 올라가며 찾습니다 (투명한 경우 대비)
   */
  getRecursiveBackgroundColor(el) {
    let current = el;
    while (current) {
      const style = window.getComputedStyle(current);
      const bg = style.backgroundColor;
      if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        return bg;
      }
      current = current.parentElement;
    }
    return 'rgb(255, 255, 255)'; // 기본값 흰색
  }

  createReport(el, status, message) {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: el.tagName,
        selector: this.utils.getSelector(el)
      },
      context: {
        smartContext: this.utils.getSmartContext(el, 50),
        color: window.getComputedStyle(el).color,
        backgroundColor: this.getRecursiveBackgroundColor(el)
      },
      result: {
        status: status,
        message: message,
        rules: ["Rule 1.1 (Contrast Ratio)"]
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
  window.ABTCore.registerProcessor("543", new Processor543());
}
