/**
 * ABT Processor 214 (Character Key Shortcuts)
 * KWCAG 2.2 지침 2.1.4 문자 단축키
 */
class Processor214 {
  constructor() {
    this.id = "2.1.4";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const reports = [];
    
    // 키보드 이벤트 리스너가 걸린 요소를 찾습니다 (주로 document나 window에 걸리지만 인라인도 확인)
    const elementsWithKeys = document.querySelectorAll('[onkeydown], [onkeypress], [onkeyup]');
    
    for (const el of elementsWithKeys) {
      if (this.utils.isHidden(el)) continue;

      const keydown = el.getAttribute('onkeydown') || "";
      const keypress = el.getAttribute('onkeypress') || "";
      const keyup = el.getAttribute('onkeyup') || "";
      
      const allHandlers = (keydown + keypress + keyup).toLowerCase();

      // 핸들러 문자열 내에 특수키 검사 로직(ctrlKey, altKey, metaKey)이 없는 경우 단일 문자 단축키 의심
      const hasModifiers = allHandlers.includes('ctrlkey') || allHandlers.includes('altkey') || allHandlers.includes('metakey');
      
      if (allHandlers && !hasModifiers) {
        reports.push(this.analyze(el));
      }
    }

    // 전역(Global) 이벤트 리스너 감지는 정적 스크립트에서 완벽하지 않으므로 전역 검토 가이드 추가
    reports.push({
      guideline_id: this.id,
      elementInfo: { tagName: "document", selector: "body" },
      context: { smartContext: "전역 단일 문자 단축키 사용 여부 검토" },
      result: { 
        status: "검토 필요", 
        message: "이 페이지에서 Ctrl, Alt 등 특수키 조합 없이 단일 문자(예: 'J', 'K', '?')만으로 작동하는 단축키가 있는지 확인하세요. 만약 있다면, 해당 단축키를 끄거나 재설정할 수 있는 수단을 제공해야 합니다.",
        rules: ["Rule 2.1.4 (Character Key Shortcuts)"]
      },
      currentStatus: "검토 필요",
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: "단일 문자 단축키 수동 검토 필요" }]
    });

    return reports;
  }

  analyze(el) {
    return this.createReport(el, "검토 필요", "해당 요소에 특수키(Ctrl, Alt 등)를 확인하지 않는 키보드 이벤트 핸들러가 있습니다. 단일 문자 단축키로 작동하는 경우 제어 수단(끄기/변경)이 있는지 확인하세요.", ["Rule 2.1.4 (Single Key Shortcut Suspected)"]);
  }

  createReport(el, status, message, rules) {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: el.tagName,
        selector: el !== document.body ? this.utils.getSelector(el) : "body"
      },
      context: { smartContext: el !== document.body ? this.utils.getSmartContext(el) : "전역 스크립트 검토" },
      result: { status, message, rules },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}

if (window.ABTCore) { window.ABTCore.registerProcessor("2.1.4", new Processor214()); }
