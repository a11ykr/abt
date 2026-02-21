/**
 * ABT-111-Processor: Non-text Content Engine
 * WCAG/KWCAG 1.1.1 지침 정성 평가 알고리즘 구현체 (Prototype v1.0)
 */

class A11YNonTextEngine {
  constructor() {
    this.forbiddenWords = ["이미지", "사진", "아이콘", "그림", "스냅샷", "image", "photo", "icon"];
  }

  /**
   * 페이지 내 모든 이미지 요소를 스캔하여 분석 보고서를 생성합니다.
   */
  async scan() {
    const images = document.querySelectorAll('img, [role="img"]');
    const reports = [];

    for (const img of images) {
      const analysis = this.analyzeElement(img);
      reports.push(analysis);
    }

    return reports;
  }

  /**
   * 개별 요소를 알고리즘에 따라 분석합니다.
   */
  analyzeElement(el) {
    const alt = (el.getAttribute('alt') || el.getAttribute('aria-label') || "").trim();
    const smartContext = this.getSmartContext(el);
    const functionalContext = this.getFunctionalContext(el);
    
    let status = "PASS";
    let message = "적절한 대체 텍스트가 제공되었습니다.";
    const rules = [];

    // [단계 A] 기술적 결함 검사
    if (!el.hasAttribute('alt') && !el.hasAttribute('aria-label')) {
      status = "DEFECT";
      message = "대체 텍스트 속성(alt 등)이 누락되었습니다.";
      rules.push("Rule 1.1");
    }

    // [단계 B] 금지어 검사
    const foundForbidden = this.forbiddenWords.find(word => alt.includes(word));
    if (foundForbidden && status !== "DEFECT") {
      status = "WARNING";
      message = `대체 텍스트에 불필요한 단어('${foundForbidden}')가 포함되어 있습니다.`;
      rules.push("Rule 2.1");
    }

    // [단계 C] 맥락적 중복 검사 (유사도 체크)
    const similarity = this.calculateSimilarity(alt, smartContext);
    if (similarity > 0.8 && status === "PASS") {
      status = "WARNING";
      message = "주변 텍스트와 내용이 중복됩니다. alt=\"\" 처리를 권장합니다.";
      rules.push("Rule 3.1");
    } else if (similarity > 0.4 && status === "PASS") {
      status = "NEEDS REVIEW";
      message = "주변 텍스트와 내용이 비슷합니다. 중복 여부를 확인하세요.";
      rules.push("Rule 3.1");
    }

    // [단계 D] 기능적 적절성 검사
    if (functionalContext.isFunctional) {
      status = "NEEDS REVIEW";
      message = "대화형 요소(링크/버튼) 내 이미지입니다. 목적(기능) 설명 여부 및 중복을 확인하세요.";
      rules.push("Rule 4.1");
    }

    return {
      elementInfo: {
        tagName: el.tagName,
        src: el.src || "N/A",
        alt: alt,
        selector: this.getSelector(el)
      },
      context: {
        smartContext: smartContext,
        isFunctional: functionalContext.isFunctional,
        parentTag: functionalContext.parentTag,
        parentText: functionalContext.parentText
      },
      result: {
        status: status,
        message: message,
        rules: rules,
        similarity: similarity
      }
    };
  }

  /**
   * 요소 주변의 텍스트 맥락을 추출합니다 (앞뒤 50자).
   */
  getSmartContext(el) {
    const parent = el.closest('div, section, article, li, a, button') || el.parentElement;
    if (!parent) return "";
    
    const text = parent.innerText.replace(/\s+/g, ' ').trim();
    const alt = el.getAttribute('alt') || "";
    
    // 이미지 위치를 찾아 앞뒤 50자 추출 (단순 구현)
    const index = text.indexOf(alt);
    if (index === -1) return text.substring(0, 100);
    
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + alt.length + 50);
    return text.substring(start, end);
  }

  /**
   * 기능형 이미지 여부를 확인합니다.
   */
  getFunctionalContext(el) {
    const parent = el.closest('a, button, [role="button"], [role="link"]');
    return {
      isFunctional: !!parent,
      parentTag: parent ? parent.tagName.toLowerCase() : null,
      parentText: parent ? parent.innerText.replace(/\s+/g, ' ').trim() : ""
    };
  }

  /**
   * 간단한 문자열 유사도를 계산합니다 (단어 매칭 방식).
   */
  calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    const words1 = new Set(str1.split(/\s+/));
    const words2 = str2.split(/\s+/);
    const intersection = words2.filter(word => words1.has(word));
    return intersection.length / Math.max(words1.size, 1);
  }

  /**
   * 요소의 CSS 셀렉터를 생성합니다.
   */
  getSelector(el) {
    if (el.id) return `#${el.id}`;
    if (el.className) return `.${el.className.split(' ').join('.')}`;
    return el.tagName.toLowerCase();
  }
}

// Global Export
window.ABT111Processor = new A11YNonTextEngine();