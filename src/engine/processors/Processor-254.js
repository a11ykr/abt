/**
 * ABT Processor 254 (Motion Actuation)
 * KWCAG 2.2 지침 2.5.4 동작기반 작동 (Motion Actuation)
 */
class Processor254 {
  constructor() {
    this.id = "2.5.4";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const reports = [];
    
    // Check for potential motion event usage (difficult to detect listeners directly in content script,
    // so we look for keywords in source or just provide a manual check prompt if the page seems complex)
    const scriptTags = document.querySelectorAll('script');
    let potentialMotion = false;
    for (const script of scriptTags) {
      if (script.textContent.includes('devicemotion') || script.textContent.includes('deviceorientation')) {
        potentialMotion = true;
        break;
      }
    }

    if (potentialMotion) {
      reports.push({
        guideline_id: this.id,
        elementInfo: { tagName: "WINDOW", selector: "window" },
        context: { smartContext: "기기 동작(Motion/Orientation) 관련 스크립트가 탐지되었습니다." },
        result: { 
          status: "검토 필요", 
          message: "흔들기, 기울이기 등 기기의 동작을 통해 기능을 수행하는 경우, 정적인 입력(클릭 등)으로도 해당 기능을 수행할 수 있는 대체 수단이 있는지 확인하세요.",
          rules: ["Rule 2.5.4 (Motion Events Detected)"]
        },
        currentStatus: "검토 필요",
        history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: "동작 기반 이벤트 사용 의심" }]
      });
    } else {
      // General reminder for this AAA-level/2.2 guideline
      reports.push({
        guideline_id: this.id,
        elementInfo: { tagName: "document", selector: "body" },
        context: { smartContext: "기기 동작 센서 사용 여부 검토" },
        result: { 
          status: "적절", 
          message: "페이지 내에서 기기의 흔들기나 기울이기 등 동작에 의존하는 특수 기능이 탐지되지 않았습니다.",
          rules: ["Rule 2.5.4 (No Motion Actuation)"]
        },
        currentStatus: "적절",
        history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: "특이 사항 없음" }]
      });
    }

    return reports;
  }
}

if (window.ABTCore) { window.ABTCore.registerProcessor("2.5.4", new Processor254()); }
