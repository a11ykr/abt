class Processor642 {
  constructor() {
    this.id = "642";
    this.utils = window.ABTUtils;
    this.meaninglessTitles = [
      'untitled', 'document', '새 탭', 'home', 'main', 'index', 'index.html',
      'iframe', 'content', 'empty', '빈 페이지', '제목 없음'
    ];
  }

  async scan() {
    const reports = [];

    const pageTitle = document.title ? document.title.trim() : "";
    if (!pageTitle) {
      reports.push(this.createPageReport("오류", "페이지 제목(<title>)이 누락되었거나 비어있습니다."));
    } else if (this.meaninglessTitles.includes(pageTitle.toLowerCase())) {
      reports.push(this.createPageReport("부적절", `페이지 제목('${pageTitle}')이 구체적이지 않거나 의미 없는 기본값입니다.`));
    }

    const frames = document.querySelectorAll('iframe, frame');
    for (const frame of frames) {
      const title = frame.getAttribute('title') ? frame.getAttribute('title').trim() : "";
      
      if (!title) {
        reports.push(this.createReport(frame, "오류", "프레임(iframe)의 title 속성이 누락되었습니다."));
      } else if (this.meaninglessTitles.includes(title.toLowerCase())) {
        reports.push(this.createReport(frame, "부적절", `프레임 제목('${title}')이 프레임의 용도를 설명하기에 부적절합니다.`));
      }
    }

    const h1 = document.querySelector('h1');
    if (!h1) {
      reports.push(this.createPageReport("수정 권고", "페이지 내에 대주제(<h1>)가 존재하지 않습니다. 구조적 제목 제공을 권장합니다."));
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
        message: message
      },
      currentStatus: status,
      history: [{
        timestamp: new Date().toLocaleTimeString(),
        status: "탐지",
        comment: message
      }]
    };
  }

  createPageReport(status, message) {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: 'HEAD',
        selector: 'title'
      },
      context: {
        smartContext: `현재 페이지 제목: ${document.title || '(없음)'}`
      },
      result: {
        status: status,
        message: message
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
  window.ABTCore.registerProcessor("642", new Processor642());
}
