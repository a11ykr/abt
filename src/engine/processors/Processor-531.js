/**
 * ABT Processor 531 (Table Structure)
 * 5.3.1 표의 구성 지침 진단 프로세서
 */
class Processor531 {
  constructor() {
    this.id = "531";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const tables = document.querySelectorAll('table');
    const reports = [];

    for (const table of tables) {
      // 레이아웃용 표인 경우 (role="presentation" 등) 건너뜀
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
    
    let status = "적절";
    let message = "표의 구조가 적절하게 구성되었습니다.";
    const rules = [];

    // [단계 A] <caption> 누락 검사
    if (!caption) {
      status = "오류";
      message = "데이터 표에 제목(<caption>)이 누락되었습니다. 표의 내용을 요약하거나 제목을 제공해야 합니다.";
      rules.push("Rule 1.1 (Missing Caption)");
    }

    // [단계 B] <th>(제목 셀) 존재 여부 검사
    if (ths.length === 0) {
      // 만약 <caption>은 있는데 <th>가 없는 경우
      if (status === "적절") {
        status = "오류";
        message = "데이터 표에 제목 셀(<th>)이 존재하지 않습니다. 행이나 열의 성격을 정의해야 합니다.";
      } else {
        message += " 또한 제목 셀(<th>)도 발견되지 않았습니다.";
      }
      rules.push("Rule 2.1 (Missing Headers)");
    }

    // [단계 C] scope 속성 검사 (기본 데이터 표)
    if (ths.length > 0 && !hasScope) {
      if (status === "적절") {
        status = "수정 권고";
        message = "제목 셀(<th>)에 scope 속성을 사용하여 행(row) 또는 열(col) 제목임을 명시하는 것이 좋습니다.";
      } else {
        message += " 제목 셀에 scope 속성 추가도 필요합니다.";
      }
      rules.push("Rule 2.2 (Missing Scope)");
    }

    // [단계 D] summary 속성 사용 (수정 권고 - HTML5에서 폐기됨)
    if (summary) {
      if (status === "적절") {
        status = "수정 권고";
        message = "폐기된 summary 속성 대신 <caption> 요소를 사용하여 표의 제목과 요약을 제공하세요.";
      }
      rules.push("Rule 1.2 (Obsolete Summary)");
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
  window.ABTCore.registerProcessor("531", new Processor531());
}
