/**
 * ABT Processor 652
 * KWCAG 2.2 지침 6.5.2 표의 구성 (Table Structure)
 */
class Processor652 {
  constructor() {
    this.id = "652";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const tables = document.querySelectorAll('table');
    const reports = [];

    for (const el of tables) {
      if (this.utils.isHidden(el)) continue;
      
      const role = el.getAttribute('role');
      if (role === 'presentation' || role === 'none') {
        continue; // Layout tables are exempt from data table structure rules
      }

      reports.push(this.analyze(el));
    }
    return reports;
  }

  analyze(el) {
    const thElements = el.querySelectorAll('th');
    const tdElements = el.querySelectorAll('td');
    
    let status = "적절";
    let message = "데이터 표의 구조가 적절하게 구성되었습니다.";
    const rules = [];

    // Rule 1: Data table must have at least one <th>
    if (thElements.length === 0 && tdElements.length > 0) {
      status = "오류";
      message = "데이터 표에 제목 셀(<th>)이 제공되지 않았습니다.";
      rules.push("Rule 652 (Missing TH)");
    } 
    // Rule 2: Complex tables should use scope or headers/id
    else if (thElements.length > 0) {
      const hasScope = Array.from(thElements).some(th => th.hasAttribute('scope'));
      const hasHeadersId = Array.from(tdElements).some(td => td.hasAttribute('headers')) && 
                           Array.from(thElements).some(th => th.hasAttribute('id'));
      
      // Heuristic: If table is large/complex (>3 rows and >3 cols), it needs explicit association
      const rowCount = el.querySelectorAll('tr').length;
      let maxCols = 0;
      el.querySelectorAll('tr').forEach(tr => {
        maxCols = Math.max(maxCols, tr.children.length);
      });

      if (rowCount > 3 && maxCols > 3 && !hasScope && !hasHeadersId) {
        status = "수정 권고";
        message = "복잡한 표 구조입니다. 제목 셀(<th>)에 scope 속성을 제공하거나 id/headers 속성으로 데이터를 연결할 것을 권장합니다.";
        rules.push("Rule 652 (Complex Table Association)");
      }
    }

    return this.createReport(el, status, message, rules);
  }

  createReport(el, status, message, rules) {
    const thCount = el.querySelectorAll('th').length;
    const tdCount = el.querySelectorAll('td').length;
    
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: el.tagName,
        selector: this.utils.getSelector(el)
      },
      context: { smartContext: `표 구조: <th> ${thCount}개, <td> ${tdCount}개` },
      result: { status, message, rules },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}

if (window.ABTCore) { window.ABTCore.registerProcessor("652", new Processor652()); }