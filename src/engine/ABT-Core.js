/**
 * ABT Core Engine
 * 지침별 프로세서들을 등록하고 통합 진단을 수행하는 중앙 컨트롤러
 */
class ABTCore {
  constructor() {
    this.processors = new Map();
    this.connector = window.ABTConnector;
  }

  /**
   * 새로운 프로세서를 등록합니다.
   * @param {string} id - 지침 번호 (예: '111')
   * @param {object} processor - scan() 메서드를 가진 프로세서 객체
   */
  registerProcessor(id, processor) {
    this.processors.set(id, processor);
    console.log(`ABT: Processor [${id}] registered.`);
  }

  /**
   * 등록된 모든 프로세서를 실행하여 통합 진단을 수행합니다.
   */
  async runFullAudit() {
    if (!this.connector || !this.connector.isConnected) {
      console.warn("ABT: Desktop 앱과 연결되어 있지 않습니다. 연결을 확인하세요.");
      // return; // 일단 로그만 남기고 진행
    }

    console.log("ABT: Starting Full Audit...");
    let totalIssues = 0;
    
    const pageInfo = {
      url: window.location.href || "Unknown URL",
      pageTitle: document.title || "Untitled Page",
      timestamp: new Date().toISOString(),
      scanId: Date.now()
    };

    console.log("ABT: Captured Page Info:", pageInfo);

    for (const [id, processor] of this.processors) {
      try {
        console.log(`ABT: Running Processor [${id}]...`);
        const reports = await processor.scan();
        
        if (reports && reports.length > 0) {
          reports.forEach(report => {
            if (!report) return;
            // 리포트에 지침 ID 및 페이지 정보 주입
            report.guideline_id = id;
            report.pageInfo = { ...pageInfo }; // 참조 문제 방지를 위해 복사
            this.connector.send(report);
          });
          totalIssues += reports.length;
        }
      } catch (error) {
        console.error(`ABT: Error in Processor [${id}]:`, error);
      }
    }

    console.log(`ABT: Audit Complete. Total ${totalIssues} issues sent.`);
  }


  /**
   * 특정 요소를 찾아 화면에 표시하고 아주 명확한 테두리로 강조합니다.
   */
  highlightElement(selector) {
    try {
      const el = document.querySelector(selector);
      if (!el) {
        console.warn(`ABT: Element not found for selector: ${selector}`);
        return;
      }

      // 1. 화면 중앙으로 부드럽게 스크롤
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // 2. 기존 하이라이트 요소들 제거
      const removeOld = () => {
        const oldOverlay = document.getElementById('abt-highlight-overlay');
        const oldStyle = document.getElementById('abt-highlight-style');
        if (oldOverlay) oldOverlay.remove();
        if (oldStyle) oldStyle.remove();
      };
      removeOld();

      // 3. 하이라이트 오버레이 생성
      const rect = el.getBoundingClientRect();
      const overlay = document.createElement('div');
      overlay.id = 'abt-highlight-overlay';
      
      // 아주 명확한 스타일 설정 (두꺼운 마젠타색 테두리 + 스포트라이트)
      Object.assign(overlay.style, {
        position: 'fixed',
        top: `${rect.top - 8}px`,
        left: `${rect.left - 8}px`,
        width: `${rect.width + 16}px`,
        height: `${rect.height + 16}px`,
        backgroundColor: 'transparent',
        border: '5px solid #ff00ff', // 고대비 마젠타 색상
        borderRadius: '8px',
        zIndex: '2147483647',
        pointerEvents: 'none',
        boxShadow: '0 0 0 4000px rgba(0, 0, 0, 0.7), inset 0 0 20px #ff00ff', // 강한 배경 어둡게 + 안쪽 광채
        transition: 'opacity 0.3s ease'
      });

      // 4. 라벨 추가 (테두리 바로 위에 밀착)
      const label = document.createElement('div');
      label.textContent = 'TARGET ELEMENT';
      Object.assign(label.style, {
        position: 'absolute',
        top: '-35px',
        left: '-5px',
        backgroundColor: '#ff00ff',
        color: 'white',
        padding: '4px 12px',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: '900',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
      });
      overlay.appendChild(label);

      document.body.appendChild(overlay);

      // 5. 사용자가 확인 후 클릭하면 사라지게 하거나 시간 지나면 삭제
      // (일단 5초로 늘림)
      const timer = setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(removeOld, 300);
      }, 5000);

      // 브라우저에서 아무곳이나 클릭하면 즉시 강조 제거 로직 추가 가능
      const clearHandler = () => {
        removeOld();
        clearTimeout(timer);
        document.removeEventListener('mousedown', clearHandler);
      };
      document.addEventListener('mousedown', clearHandler);

      console.log(`ABT: Spotlight focus on: ${selector}`);
    } catch (e) {
      console.error("ABT: Error highlighting element", e);
    }
  }
}

// Global Singleton
window.ABTCore = new ABTCore();

// 기존 QuickScan 함수를 Core 기반으로 업데이트
window.ABTQuickScan = () => window.ABTCore.runFullAudit();
