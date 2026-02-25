/**
 * ABT Processor 131 (Table Structure)
 * 1.3.1 표의 구성 지침 진단 프로세서
 */
class Processor131 {
  constructor() {
    this.id = "1.3.1";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const tables = document.querySelectorAll('table');
    const reports = [];

    for (const table of tables) {
      const role = table.getAttribute('role');
      if (['presentation', 'none'].includes(role)) continue;
      reports.push(this.analyze(table));
    }
    return reports;
  }

  analyze(table) {
    const caption = table.querySelector('caption');
    const ths = table.querySelectorAll('th');
    const hasScope = Array.from(ths).some(th => th.hasAttribute('scope'));
    const summary = table.getAttribute('summary');
    
    // HTML5 여부 판단: Doctype이 없거나 publicId가 비어있으면 HTML5로 간주
    const isHTML5 = document.contentType === "text/html" && (document.doctype?.publicId === "" || !document.doctype);
    
    let status = "적절";
    let message = "표의 구조가 적절하게 구성되었습니다.";
    const rules = [];

    // [단계 A] <caption> 누락 검사
    if (!caption) {
      // HTML5가 아니면서 summary 속성이 있으면 대체 수단으로 인정
      if (!isHTML5 && summary) {
        message = "데이터 표에 <caption>은 없으나, 이전 표준 방식인 summary 속성이 적절히 제공되었습니다.";
      } else {
        status = "오류";
        message = "데이터 표에 제목(<caption>)이 누락되었습니다. 표의 내용을 요약하거나 제목을 제공해야 합니다.";
        rules.push("Rule 1.1 (Missing Caption)");
      }
    }

    // [단계 B] <th>(제목 셀) 존재 여부 검사
    if (ths.length === 0) {
      if (status === "적절") {
        status = "오류";
        message = "데이터 표에 제목 셀(<th>)이 존재하지 않습니다. 행이나 열의 성격을 정의해야 합니다.";
      } else {
        message += " 또한 제목 셀(<th>)도 발견되지 않았습니다.";
      }
      rules.push("Rule 2.1 (Missing Headers)");
    }

    // [단계 C] scope 속성 검사
    if (ths.length > 0 && !hasScope) {
      if (status === "적절") {
        status = "수정 권고";
        message = "제목 셀(<th>)에 scope 속성을 사용하여 행(row) 또는 열(col) 제목임을 명시하는 것이 좋습니다.";
      } else {
        message += " 제목 셀에 scope 속성 추가도 필요합니다.";
      }
      rules.push("Rule 2.2 (Missing Scope)");
    }

    // [단계 D] summary 속성 사용 (HTML5에서만 폐기됨)
    if (summary && isHTML5) {
      if (status === "적절") {
        status = "수정 권고";
        message = "HTML5 표준에서는 summary 속성이 폐기되었습니다. <caption> 요소를 사용하여 표의 제목과 요약을 제공하세요.";
      }
      rules.push("Rule 1.2 (Obsolete Summary)");
    }

    // [단계 E] 복잡한 표의 구조적 연결 검사
    const rowCount = table.querySelectorAll('tr').length;
    const tdElements = table.querySelectorAll('td');
    let maxCols = 0;
    table.querySelectorAll('tr').forEach(tr => {
      maxCols = Math.max(maxCols, tr.children.length);
    });

    if (rowCount > 3 && maxCols > 3 && !hasScope) {
      const hasHeadersId = Array.from(tdElements).some(td => td.hasAttribute('headers'));
      if (!hasHeadersId) {
        if (status === "적절") {
          status = "수정 권고";
          message = "행과 열이 많은 복잡한 표입니다. 제목 셀(<th>)에 scope 속성을 제공하거나 id/headers 속성으로 데이터를 명확히 연결할 것을 권장합니다.";
        }
        rules.push("Rule 2.3 (Complex Table Structure)");
      }
    }

    return this.createReport(table, status, message, rules);
  }

  createReport(el, status, message, rules) {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: el.tagName,
        selector: this.utils.getSelector(el)
      },
      context: {
        smartContext: this.utils.getSmartContext(el, 50),
        hasCaption: !!el.querySelector('caption'),
        headerCount: el.querySelectorAll('th').length
      },
      result: {
        status: status,
        message: message,
        rules: rules
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
  window.ABTCore.registerProcessor("1.3.1", new Processor131());
}
