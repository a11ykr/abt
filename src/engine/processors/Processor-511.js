/**
 * ABT Processor 511 (Non-text Content)
 * KWCAG 2.2 지침 5.1.1 적절한 대체 텍스트 제공 알고리즘
 */
class Processor511 {
  constructor() {
    this.id = "511";
    this.forbiddenWords = ["이미지", "사진", "아이콘", "그림", "스냅샷", "image", "photo", "icon"];
    this.utils = window.ABTUtils;
  }

  async scan() {
    const nonTextElements = document.querySelectorAll('img, area, input[type="image"], svg, [role="img"]');
    const reports = [];

    for (const el of nonTextElements) {
      reports.push(this.analyze(el));
    }
    return reports;
  }

  analyze(el) {
    const tagName = el.tagName.toLowerCase();
    let accessibleName = "";
    let isDecorative = false;

    if (tagName === "svg") {
      const titleEl = el.querySelector("title");
      accessibleName = (el.getAttribute("aria-label") || (titleEl ? titleEl.textContent : "")).trim();
      isDecorative = el.getAttribute("aria-hidden") === "true" || el.getAttribute("focusable") === "false";
    } else if (tagName === "input" && el.type === "image") {
      accessibleName = (el.getAttribute("alt") || el.getAttribute("aria-label") || el.title || "").trim();
    } else {
      const altAttr = el.getAttribute("alt");
      accessibleName = (altAttr || el.getAttribute("aria-label") || "").trim();
      
      if (altAttr === "" || ["presentation", "none"].includes(el.getAttribute("role"))) {
        isDecorative = true;
      }
    }

    const smartContext = this.utils.getSmartContext(el, 50);
    const functionalContext = this.getFunctionalContext(el);
    
    let status = "적절";
    let message = "적절한 대체 텍스트가 제공되었습니다.";
    const rules = [];

    // [단계 A] 누락 오류 판정
    // 장식용이 아닌데 대체 텍스트가 없는 경우
    if (!isDecorative && !accessibleName) {
      status = "오류";
      if (tagName === "input") {
        message = "이미지 버튼(input type='image')에 대체 텍스트(alt 등)가 누락되었습니다.";
      } else if (tagName === "svg") {
        message = "의미 있는 SVG 요소에 <title> 또는 aria-label이 제공되지 않았습니다.";
      } else {
        message = "대체 텍스트 속성(alt 등)이 누락되었습니다. 수정을 요청하세요.";
      }
      rules.push("Rule 1.1 (Missing Alt)");
    }

    // [단계 B] 장식용 + 기능형 검사 (장식용이지만 앵커나 버튼 안에 있을 때)
    if (isDecorative && functionalContext.isFunctional) {
      // 앵커나 버튼에 텍스트가 없는 경우 이미지마저 장식용이면 안됨
      if (!functionalContext.parentText) {
        status = "오류";
        message = "대화형 요소(링크/버튼) 내의 유일한 콘텐츠이나, 대체 텍스트가 비어있습니다(alt=''). 목적을 설명해야 합니다.";
        rules.push("Rule 4.2 (Functional Decorative)");
      }
    }

    // [단계 C] 불필요 단어 포함 여부 (수정 권고)
    const foundForbidden = this.forbiddenWords.find(word => accessibleName.toLowerCase().includes(word));
    if (foundForbidden && status === "적절") {
      status = "수정 권고";
      message = `대체 텍스트에 불필요한 단어('${foundForbidden}')가 포함되어 있습니다. 의미에 맞게 간결하게 수정 권고하세요.`;
      rules.push("Rule 2.1 (Forbidden Words)");
    }

    // [단계 D] 주변 문맥과의 유사도 (부적절 / 검토 필요)
    if (accessibleName && status === "적절" && smartContext) {
      const similarity = this.utils.calculateSimilarity(accessibleName, smartContext);
      if (similarity > 0.9) {
        status = "부적절";
        message = "주변 정보와 동일하게 중복되어 스크린 리더 사용자에게 혼란을 줍니다. 장식용(alt='') 처리를 요청하세요.";
        rules.push("Rule 3.1 (High Similarity)");
      } else if (similarity > 0.6) {
        status = "검토 필요";
        message = "주변 텍스트와 내용이 비슷합니다. 중복 여부를 확인 후 수정을 요청하세요.";
        rules.push("Rule 3.1 (Medium Similarity)");
      }
    }

    // [단계 E] 기능형 이미지 (링크/버튼) 내에 존재하면서 상태가 적절한 경우, 목적 설명 여부 수동 확인 안내
    if (functionalContext.isFunctional && status === "적절" && !isDecorative) {
      status = "검토 필요";
      message = "대화형 요소 내 이미지입니다. 대체 텍스트가 시각적 설명이 아닌 기능/목적(예: '홈으로 이동')을 설명하는지 검토하세요.";
      rules.push("Rule 4.1 (Functional Alt Check)");
    }

    // [단계 F] 장식용 이미지가 적절하게 처리된 경우 명시
    if (isDecorative && status === "적절") {
      message = "장식용 요소로 올바르게 숨김 처리(alt='' 등) 되었습니다.";
    }

    return this.createReport(el, status, message, rules, accessibleName, smartContext, functionalContext, isDecorative);
  }

  getFunctionalContext(el) {
    const parent = el.closest('a, button, [role="button"], [role="link"]');
    return {
      isFunctional: !!parent,
      parentTag: parent ? parent.tagName.toLowerCase() : null,
      parentText: parent ? parent.innerText.replace(/\s+/g, ' ').trim() : ""
    };
  }

  createReport(el, status, message, rules, accessibleName, smartContext, functionalContext, isDecorative) {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: el.tagName,
        src: el.src || "N/A",
        alt: accessibleName,
        selector: this.utils.getSelector(el)
      },
      context: {
        smartContext: smartContext,
        isFunctional: functionalContext.isFunctional,
        parentTag: functionalContext.parentTag,
        parentText: functionalContext.parentText,
        isDecorative: isDecorative
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
  window.ABTCore.registerProcessor("511", new Processor511());
}