class Processor242 {
constructor() {
this.id = "2.4.2";
this.utils = window.ABTUtils;
    this.meaninglessTitles = [
      'untitled', 'document', '새 탭', 'home', 'main', 'index', 'index.html',
      'iframe', 'content', 'empty', '빈 페이지', '제목 없음'
    ];
  }

  async scan() {
    const reports = [];

    const titleEl = document.head.querySelector('title');
    const pageTitle = titleEl ? titleEl.textContent.trim() : "";
    if (!titleEl || !pageTitle) {
      reports.push(this.createPageReport("오류", "페이지 제목(<title>)이 <head> 내에 존재하지 않거나 비어있습니다.", "title"));
    } else if (this.meaninglessTitles.includes(pageTitle.toLowerCase())) {
      reports.push(this.createPageReport("부적절", `페이지 제목('${pageTitle}')이 구체적이지 않거나 의미 없는 기본값입니다.`, "title"));
    } else {
      reports.push(this.createPageReport("검토 필요", `페이지 제목('${pageTitle}')이 존재합니다. 해당 문구가 페이지의 내용을 핵심적으로 설명하고 있는지 검토하세요.`, "title"));
    }

    const frames = document.querySelectorAll('iframe, frame');
    for (const frame of frames) {
      const title = frame.getAttribute('title') ? frame.getAttribute('title').trim() : "";
      
      if (!title) {
        reports.push(this.createReport(frame, "오류", "프레임(iframe)의 title 속성이 누락되었습니다."));
      } else if (this.meaninglessTitles.includes(title.toLowerCase())) {
        reports.push(this.createReport(frame, "부적절", `프레임 제목('${title}')이 프레임의 용도를 설명하기에 부적절합니다.`));
      } else {
        reports.push(this.createReport(frame, "검토 필요", `프레임 제목('${title}')이 프레임의 용도나 목적을 적절히 설명하고 있는지 검토하세요.`));
      }
    }

    const h1 = document.querySelector('h1');
    if (!h1) {
      reports.push(this.createPageReport("검토 필요", "페이지 내에 대주제(<h1>)가 존재하지 않습니다. 문서의 핵심 주제가 적절하게 식별되는지 검토하세요.", "h1"));
    } else {
      reports.push(this.createPageReport("적절", "페이지 내에 구조적 대주제(<h1>)가 존재합니다.", "h1"));
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

  createPageReport(status, message, type = "title") {
    return {
      guideline_id: this.id,
      elementInfo: {
        tagName: type === "title" ? 'HEAD' : 'BODY',
        selector: type
      },
      context: {
        smartContext: type === "title" ? `현재 페이지 제목: ${document.title || '(없음)'}` : "페이지 내 <h1> 존재 여부 검사"
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
  window.ABTCore.registerProcessor("2.4.2", new Processor242());
}
