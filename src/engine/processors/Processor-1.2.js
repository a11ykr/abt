/**
 * ABT Processor 1.2 (Multimedia - Video/Audio)
 * 1.2.1, 1.2.2 지침 통합 진단 프로세서 (Trigger-based)
 */
class Processor12 {
  constructor() {
    this.id = "1.2";
    this.utils = window.ABTUtils;
    this.keywords = ["대본", "원고", "자막", "transcript", "caption", "script"];
  }

  async scan() {
    const mediaElements = document.querySelectorAll('video, audio, iframe[src*="youtube"], iframe[src*="vimeo"]');
    const reports = [];

    for (const el of mediaElements) {
      reports.push(this.analyze(el));
    }
    return reports;
  }

  analyze(el) {
    const tagName = el.tagName.toLowerCase();
    const hasTrack = el.querySelector('track[kind="captions"], track[kind="subtitles"]') !== null;
    const smartContext = this.utils.getSmartContext(el, 100);
    
    // 주변에 대본/원고 키워드가 있는지 확인
    const foundKeywords = this.keywords.filter(k => smartContext.toLowerCase().includes(k));
    
    let status = "검토 필요";
    let message = "";
    const rules = [];

    if (tagName === 'video' || tagName === 'audio') {
      if (!hasTrack) {
        message = "미디어 콘텐츠 내부에 자막 트랙(<track>)이 발견되지 않았습니다. 자막 또는 원고 제공 여부를 확인 후 수정을 요청하세요.";
        rules.push("Rule 2.2 (Missing Track)");
      } else {
        message = "미디어 콘텐츠가 감지되었습니다. 자막의 정확성과 싱크가 맞는지 수동 검토 후 판정을 완료하세요.";
        rules.push("Rule 2.1 (Media Detected)");
      }
    } else if (tagName === 'iframe') {
      message = "외부 플랫폼(YouTube/Vimeo) 영상이 감지되었습니다. 플레이어 내 자막 기능 제공 여부 및 페이지 내 원고 포함 여부를 확인하세요.";
      rules.push("Rule 2.1 (External Player)");
    }

    if (foundKeywords.length > 0) {
      message += ` (주변 맥락에서 관련 키워드 발견: ${foundKeywords.join(', ')})`;
    }

    return {
      elementInfo: {
        tagName: el.tagName,
        src: el.src || "Source Injected/Custom Player",
        selector: this.utils.getSelector(el)
      },
      context: {
        smartContext: smartContext,
        hasTrack: hasTrack,
        foundKeywords: foundKeywords
      },
      result: {
        status: status,
        message: message,
        rules: rules
      }
    };
  }
}

// Core에 등록
if (window.ABTCore) {
  window.ABTCore.registerProcessor("1.2", new Processor12());
}
