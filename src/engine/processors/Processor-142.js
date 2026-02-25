/**
 * ABT Processor 542 (Audio Control)
 * 5.4.2 자동 재생 금지 지침 진단 프로세서
 */
class Processor142 {
  constructor() {
    this.id = "1.4.2";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const reports = [];
    const mediaElements = document.querySelectorAll('video, audio');

    for (const el of mediaElements) {
      const isAutoplay = el.autoplay || el.hasAttribute('autoplay');
      const isMuted = el.muted || el.hasAttribute('muted');
      const tagName = el.tagName.toLowerCase();

      // [케이스 A] 소리가 있는 자동 재생 미디어
      if (isAutoplay && !isMuted) {
        reports.push(this.createReport(el, "오류", `${tagName === 'video' ? '동영상' : '오디오'}가 소리와 함께 자동 재생되도록 설정되어 있습니다. 3초 이상 재생되는 경우 반드시 제어 수단을 제공하거나 자동 재생을 중지해야 합니다.`));
      }
      
      // [케이스 B] 자동 재생되지만 음소거된 비디오 (521과 겹치지만 여기선 자동 재생 관점)
      if (tagName === 'video' && isAutoplay && isMuted) {
        reports.push(this.createReport(el, "적절", "자동 재생되지만 음소거 상태이므로 본 지침을 준수하는 것으로 판단됩니다."));
      }

      // [케이스 C] 자동 재생 속성이 없으나 스크립트로 재생될 가능성 (안내)
      if (!isAutoplay) {
          // 모든 미디어 요소에 대해 제어 수단 제공 여부 확인 권고
          if (!el.hasAttribute('controls')) {
              reports.push(this.createReport(el, "검토 필요", "미디어 요소에 기본 컨트롤(controls)이 없습니다. 사용자가 소리를 조절하거나 정지할 수 있는 수단이 별도로 제공되는지 확인하세요."));
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
        smartContext: this.utils.getSmartContext(el, 50),
        autoplay: el.hasAttribute('autoplay'),
        muted: el.hasAttribute('muted')
      },
      result: {
        status: status,
        message: message,
        rules: ["Rule 1.1 (Audio Control)"]
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
  window.ABTCore.registerProcessor("1.4.2", new Processor142());
}
