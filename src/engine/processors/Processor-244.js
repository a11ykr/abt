/**
 * ABT Processor 2.4.4 (Fixed Reference Location Information)
 * 
 * KWCAG 2.2 지침 2.4.4 고정된 참조 위치 정보
 * 웹 페이지가 종이 문서나 PDF 등 고정된 페이지 번호가 있는 매체와 병행 제공되는 경우, 해당 매체와 일치하는 위치 정보를 제공해야 합니다.
 * 
 * [진단 범위]
 * - 페이지 번호 관련 클래스/레이블 (.page-number, [aria-label*="페이지"] 등)
 * - 문서 전체 (Body 레벨)
 * 
 * [주요 로직]
 * - 휴리스틱 탐지: 페이지 번호 표시로 추정되는 요소를 찾아 원본 매체와의 일관성 검토 유도
 * - 수동 가이드 자동 생성: 기계적으로 매체 일관성을 100% 확인할 수 없으므로 모든 페이지에 기본 검토 안내 발행
 */

class Processor244 {
  constructor() {
    this.id = "2.4.4";
    this.utils = window.ABTUtils;
  }

  /**
   * 원본 매체와 웹 페이지 간의 참조 위치 일관성을 진단합니다.
   * @returns {Promise<Array>} 진단 결과 리포트 배열
   */
  async scan() {
    const reports = [];
    
    // 이 지침은 오프라인 매체(인쇄물 등)와 온라인 문서 간의 페이지 번호 일관성을 묻는 항목입니다.
    // 기계적으로는 '페이지 번호'로 추정되는 텍스트나 내비게이션 요소가 있는지 탐지합니다.
    const pageNumberElements = document.querySelectorAll('.page-number, .pg-num, [aria-label*="페이지"], [aria-label*="page"]');

    if (pageNumberElements.length > 0) {
      for (const el of pageNumberElements) {
        reports.push(this.createReport(el, "검토 필요", `페이지 번호 참조용으로 추정되는 요소('${el.innerText.trim()}')가 탐지되었습니다. 페이지가 고정된 원본 매체(인쇄물, PDF 등)와 동일한 위치 정보를 제공하고 있는지 확인하세요.`));
      }
    } else {
      // 기본적으로 모든 페이지에 대해 수동 검토 가이드 제공
      reports.push({
        guideline_id: this.id,
        elementInfo: { tagName: "document", selector: "body" },
        context: { smartContext: "원본 매체와의 참조 위치 일관성 검토" },
        result: { 
          status: "검토 필요", 
          message: "페이지 번호가 있는 원본 매체(인쇄물, PDF 등)가 함께 제공되는 경우, 해당 매체의 고정된 참조 위치 정보를 온라인에서도 동일하게 제공하고 있는지 확인하세요.",
          rules: ["Rule 2.4.4 (Fixed Reference Location)"]
        },
        currentStatus: "검토 필요",
        history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: "수동 검토 가이드 생성" }]
      });
    }

    return reports;
  }

  createReport(el, status, message, rules = ["Rule 2.4.4 (Page Reference Detection)"]) {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: el.tagName,
        selector: this.utils.getSelector(el)
      },
      context: { smartContext: `Detected text: "${el.innerText.trim()}"` },
      result: { status, message, rules },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}

if (window.ABTCore) { window.ABTCore.registerProcessor("2.4.4", new Processor244()); }
