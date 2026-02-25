/**
 * ABT Processor 532 (Linear Structure)
 * 5.3.2 콘텐츠의 선형구조 지침 진단 프로세서
 */
class Processor132 {
  constructor() {
    this.id = "1.3.2";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const reports = [];
    const allElements = document.querySelectorAll('body *');

    for (const el of allElements) {
      // 스타일 계산이 필요한 검사 (비용이 있으므로 필요한 경우에만 수행)
      const style = window.getComputedStyle(el);
      
      // 1. Flex/Grid order 속성 사용 (시각적 순서 변경)
      if (style.order !== '0' && style.order !== 'initial') {
        reports.push(this.createReport(el, "검토 필요", `CSS 'order' 속성(${style.order})이 사용되었습니다. 시각적 순서와 마크업 순서가 일치하여 논리적 맥락을 유지하는지 확인하세요.`));
      }

      // 2. Flex direction reverse 사용
      if (style.flexDirection === 'row-reverse' || style.flexDirection === 'column-reverse') {
        reports.push(this.createReport(el, "검토 필요", `Flex 방향이 '${style.flexDirection}'로 설정되었습니다. 콘텐츠의 읽기 순서가 논리적인지 검토가 필요합니다.`));
      }


      // 4. Aria-flowto 사용 (거의 사용되지 않으나 발견 시 안내)
      if (el.hasAttribute('aria-flowto')) {
        reports.push(this.createReport(el, "검토 필요", "aria-flowto 속성이 사용되었습니다. 보조기술 사용자가 예상한 읽기 순서대로 작동하는지 확인하세요."));
      }
    }

    // 5. Layout Table 내의 구조 (비선형적 데이터 흐름 가능성)
    const layoutTables = document.querySelectorAll('table[role="presentation"], table[role="none"]');
    for (const table of layoutTables) {
        reports.push(this.createReport(table, "검토 필요", "레이아웃용 표가 감지되었습니다. CSS 레이아웃(Flex/Grid)으로 전환을 권장하며, 제거 시에도 선형 구조가 유지되는지 확인하세요."));
    }

    // [단계 F] 헤딩 아웃라인 수집 (h1~h6) - 문서의 구조적 순서 확인
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length > 0) {
      const outline = Array.from(headings).map(h => ({
        level: parseInt(h.tagName.substring(1)),
        text: h.innerText.trim(),
        selector: this.utils.getSelector(h)
      }));
      
      reports.push({
        guideline_id: this.id,
        elementInfo: { tagName: 'BODY', selector: 'outline' },
        context: { smartContext: "페이지 헤딩 구조(Heading Outline) 분석 결과입니다.", outline: outline },
        result: { status: "적절", message: `페이지 내에 총 ${headings.length}개의 헤딩이 존재합니다.` },
        currentStatus: "적절",
        history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: "헤딩 아웃라인 수집 완료" }]
      });

      // 헤딩 순서 논리성 검사
      let prevLevel = 0;
      for (const h of outline) {
        if (prevLevel > 0 && h.level > prevLevel + 1) {
          reports.push({
            guideline_id: this.id,
            elementInfo: { tagName: `H${h.level}`, selector: h.selector },
            context: { smartContext: `이전 헤딩(H${prevLevel})에서 바로 H${h.level}로 건너뛰었습니다.` },
            result: { status: "수정 권고", message: "헤딩 수준을 순차적으로 사용하는 것을 권장합니다 (예: h1 -> h2 -> h3)." },
            currentStatus: "수정 권고",
            history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: "헤딩 순서 건너뜀 탐지" }]
          });
        }
        prevLevel = h.level;
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
        rules: ["Rule 1.1 (Logical Ordering)"]
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
  window.ABTCore.registerProcessor("1.3.2", new Processor132());
}
