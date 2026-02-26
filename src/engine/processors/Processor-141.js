/**
 * ABT Processor 1.4.1 (Use of Color)
 * 5.4.1 색에 무관한 콘텐츠 인식 지침 진단 프로세서
 */
class Processor141 {
  constructor() {
    this.id = "1.4.1";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const reports = [];
    const links = document.querySelectorAll('a');

    for (const link of links) {
      const style = window.getComputedStyle(link);
      const parentStyle = window.getComputedStyle(link.parentElement);

      // 1. 링크 밑줄 여부 확인
      const hasUnderline = style.textDecorationLine.includes('underline') || 
                           style.borderBottomStyle !== 'none' ||
                           style.textDecoration.includes('underline');

      if (!hasUnderline && link.innerText.trim().length > 0) {
        // 부모와 색상이 다른지 확인
        if (style.color !== parentStyle.color) {
          reports.push(this.createReport(link, "검토 필요", "링크가 밑줄 없이 색상으로만 구분되고 있습니다. 텍스트와 배경의 명도 대비가 충분하더라도, 색을 인지하지 못하는 사용자를 위해 밑줄 등 추가적인 시각적 구분이 권장됩니다."));
        }
      }
    }

    // 2. 배경색만 있고 텍스트가 없는 요소 (아이콘 버튼 등)
    const elementsWithBg = document.querySelectorAll('div, span, i, b');
    for (const el of elementsWithBg) {
        const style = window.getComputedStyle(el);
        const hasBgColor = style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent';
        const hasNoText = el.innerText.trim().length === 0;
        const hasNoAria = !el.getAttribute('aria-label') && !el.getAttribute('title');

        if (hasBgColor && hasNoText && hasNoAria && (parseInt(style.width) > 0 || parseInt(style.height) > 0)) {
            // 이 경우는 대체 텍스트(511)와도 겹치지만, 색상만으로 정보를 전달하는지 확인이 필요함
            reports.push(this.createReport(el, "검토 필요", "요소에 배경색은 있으나 텍스트나 레이블이 없습니다. 색상만으로 정보를 전달하고 있다면 패턴이나 텍스트를 추가하세요."));
        }
    }

    // 3. 그래프/차트 콘텐츠 탐지 (Canvas, SVG, Chart-related containers)
    const potentialCharts = document.querySelectorAll('canvas, svg:not([role="img"]), .chart, [id*="chart"], .graph, [id*="graph"]');
    const processedCharts = new Set();

    for (const el of potentialCharts) {
      if (this.utils.isHidden(el)) continue;
      
      // 이미 분석된 요소나 부모가 차트 컨테이너인 경우 중복 방지
      let parent = el.parentElement;
      let isNested = false;
      while (parent) {
        if (processedCharts.has(parent)) {
          isNested = true;
          break;
        }
        parent = parent.parentElement;
      }
      if (isNested) continue;

      const style = window.getComputedStyle(el);
      const width = parseInt(style.width);
      const height = parseInt(style.height);

      // 너무 작은 요소(아이콘 등)는 제외
      if (width > 50 && height > 50) {
        processedCharts.add(el);
        reports.push(this.createReport(el, "검토 필요", "그래프나 차트 등 시각적 정보를 담은 콘텐츠가 탐지되었습니다. 데이터의 계열이나 값을 구분할 때 색상뿐만 아니라 패턴, 모양, 레이블 등 색에 무관하게 인식할 수 있는 수단이 함께 제공되는지 검토하세요."));
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
        rules: ["Rule 1.1 (Color Independence)"]
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
  window.ABTCore.registerProcessor("1.4.1", new Processor141());
}
