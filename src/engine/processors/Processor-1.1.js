/**
 * ABT Processor 1.1 (Alternative Text)
 */
class Processor11 {
  constructor() {
    this.id = "1.1";
    this.forbiddenWords = ["이미지", "사진", "아이콘", "그림", "스냅샷", "image", "photo", "icon"];
    this.utils = window.ABTUtils;
  }

  async scan() {
    const images = document.querySelectorAll('img, [role="img"]');
    const reports = [];

    for (const img of images) {
      reports.push(this.analyze(img));
    }
    return reports;
  }

  analyze(el) {
    const alt = (el.getAttribute('alt') || el.getAttribute('aria-label') || "").trim();
    const smartContext = this.utils.getSmartContext(el, 50);
    const functionalContext = this.getFunctionalContext(el);
    
    let status = "적절";
    let message = "적절한 대체 텍스트가 제공되었습니다.";
    const rules = [];

    // [단계 A] 오류 판정 (누락)
    if (!el.hasAttribute('alt') && !el.hasAttribute('aria-label')) {
      status = "오류";
      message = "대체 텍스트 속성(alt 등)이 누락되었습니다. 수정을 요청하세요.";
      rules.push("Rule 1.1");
    }

    // [단계 B] 수정 권고 (불필요 단어)
    const foundForbidden = this.forbiddenWords.find(word => alt.includes(word));
    if (foundForbidden && status === "적절") {
      status = "수정 권고";
      message = `대체 텍스트에 불필요한 단어('${foundForbidden}') 삭제를 수정 권고(요청)하세요.`;
      rules.push("Rule 2.1");
    }

    // [단계 C] 부적절 / 검토 필요 (유사도)
    const similarity = this.utils.calculateSimilarity(alt, smartContext);
    if (similarity > 0.9 && status === "적절") {
      status = "부적절";
      message = "주변 정보와 중복되어 사용자에게 혼란을 줄 수 있습니다. 장식용(alt=\"\") 처리를 요청하세요.";
      rules.push("Rule 3.1");
    } else if (similarity > 0.5 && status === "적절") {
      status = "검토 필요";
      message = "주변 텍스트와 내용이 비슷합니다. 중복 여부를 확인 후 수정을 요청하세요.";
      rules.push("Rule 3.1");
    }

    // [단계 D] 기능형 이미지 검토 필요
    if (functionalContext.isFunctional && status === "적절") {
      status = "검토 필요";
      message = "대화형 요소 내 이미지입니다. 목적(기능) 설명 여부 및 중복을 확인 후 적절한 수정을 요청하세요.";
      rules.push("Rule 4.1");
    }

    return {
      elementInfo: {
        tagName: el.tagName,
        src: el.src || "N/A",
        alt: alt,
        selector: this.utils.getSelector(el)
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

  getFunctionalContext(el) {
    const parent = el.closest('a, button, [role="button"], [role="link"]');
    return {
      isFunctional: !!parent,
      parentTag: parent ? parent.tagName.toLowerCase() : null,
      parentText: parent ? parent.innerText.replace(/\s+/g, ' ').trim() : ""
    };
  }
}

// Core에 등록
if (window.ABTCore) {
  window.ABTCore.registerProcessor("1.1", new Processor11());
}
