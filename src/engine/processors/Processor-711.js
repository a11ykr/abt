/**
 * ABT Processor 711
 * KWCAG 2.2 지침 7.1.1 기본 언어 표시 (Default Language)
 */
class Processor711 {
  constructor() {
    this.id = "711";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const html = document.documentElement;
    return [this.analyze(html)];
  }

  analyze(el) {
    const lang = el.getAttribute('lang');
    
    let status = "적절";
    let message = `기본 언어가 적절히 제공되었습니다. (lang="${lang}")`;
    const rules = [];

    if (!lang) {
      status = "오류";
      message = "<html> 요소에 lang 속성이 제공되지 않았습니다.";
      rules.push("Rule 711 (Missing lang)");
    } else if (lang.trim() === "") {
      status = "오류";
      message = "<html> 요소의 lang 속성값이 비어있습니다.";
      rules.push("Rule 711 (Empty lang)");
    } else if (!/^[a-zA-Z]{2,3}(-[a-zA-Z]{2,4})?$/.test(lang.trim())) {
      status = "수정 권고";
      message = `lang 속성값("${lang}")이 표준 언어 코드(예: ko, en) 형식인지 확인하세요.`;
      rules.push("Rule 711 (Invalid lang format)");
    }

    return this.createReport(el, status, message, rules);
  }

  createReport(el, status, message, rules) {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: el.tagName,
        selector: "html"
      },
      context: { smartContext: `lang: ${el.getAttribute('lang') || '없음'}` },
      result: { status, message, rules },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}

if (window.ABTCore) { window.ABTCore.registerProcessor("711", new Processor711()); }