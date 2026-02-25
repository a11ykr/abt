/**
 * ABT Processor 133 (Providing Instructions)
 * KWCAG 2.2 지침 1.3.3 명확한 지시사항 제공 지침 진단 프로세서
 */
class Processor133 {
  constructor() {
    this.id = "1.3.3";
    this.utils = window.ABTUtils;
    // 시각적/감각적 지시사항과 관련된 키워드들
    this.sensoryKeywords = [
      "동그란", "네모난", "원형", "사각형", "둥근", "모양",
      "왼쪽", "오른쪽", "상단", "하단", "위", "아래", "옆", "측면",
      "빨간", "파란", "노란", "초록", "검정", "흰색", "색상",
      "큰", "작은", "대형", "소형", "사이즈",
      "소리", "신호음", "비프", "벨", "음성"
    ];
    // 지시사항(명령/안내)과 관련된 키워드들
    this.instructionKeywords = [
      "버튼", "링크", "아이콘", "메뉴", "항목", "탭",
      "클릭", "누르", "선택", "참조", "확인", "사용"
    ];
  }

  async scan() {
    const reports = [];
    // 텍스트가 포함된 모든 요소를 탐색 (p, span, div, li, label 등)
    const textElements = document.querySelectorAll('p, span, div, li, label, h1, h2, h3, h4, h5, h6');

    for (const el of textElements) {
      // 직접 텍스트 노드만 추출하여 키워드 매칭
      const directText = Array.from(el.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent.trim())
        .join(' ');

      if (!directText) continue;

      // 정교한 키워드 매칭 (단순 포함이 아닌 독립적 의미 확인)
      const foundKeywords = this.sensoryKeywords.filter(k => {
        // 1글자 키워드(위, 옆 등)는 앞뒤에 공백이나 문장 부호가 있을 때만 매칭하여 false positive 방지
        if (k.length === 1) {
          const regex = new RegExp(`(^|\\s|[.,!?;:])[${k}]($|\\s|[.,!?;:])`);
          return regex.test(directText);
        }
        // 2글자 이상은 그대로 포함 여부 확인
        return directText.includes(k);
      });

      if (foundKeywords.length > 0) {
        // 지시사항 관련 키워드가 함께 존재하는지 확인 (단순 단어 포함 여부보다 안내 문구로서의 성격 강화)
        const hasInstruction = this.instructionKeywords.some(k => directText.includes(k));
        
        if (hasInstruction) {
          reports.push(this.createReport(el, "검토 필요", `지시사항에 시각적/감각적 표현('${foundKeywords.join(', ')}')이 안내 키워드와 함께 포함되어 있습니다. 특정 감각에만 의존하지 않는지 확인하세요.`));
        }
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
        rules: ["Rule 1.1 (Sensory Characteristics)"]
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
  window.ABTCore.registerProcessor("1.3.3", new Processor133());
}
