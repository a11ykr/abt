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
    // KWCAG 2.2 표준 형식(1.1.1 등)이 아닌 이전 형식(613 등)의 등록 시도 차단
    if (!/^[0-9]\.[0-9]\.[0-9]$/.test(id)) {
      console.warn(`ABT: Blocked registration of legacy processor [${id}]. Please update to KWCAG 2.2 notation.`);
      return;
    }
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
   * 특정 요소를 찾아 화면에 표시하고 고해상도 스포트라이트로 강조합니다.
   */
  highlightElement(selector) {
    try {
      if (!selector || selector === 'outline' || selector === 'document' || selector === 'body') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 1. 요소 탐색 (기본 선택자 -> 태그 기반 폴백)
      let el = document.querySelector(selector);
      
      if (!el) {
        console.warn(`ABT: Selector failed: ${selector}. Trying structure fallback...`);
        try {
          const parts = selector.split(' > ');
          const lastPart = parts[parts.length - 1];
          const tagMatch = lastPart.match(/^([a-z0-9]+)/i);
          if (tagMatch) {
            const tagName = tagMatch[1];
            const nthMatch = lastPart.match(/:nth-child\((\d+)\)/) || lastPart.match(/:nth-of-type\((\d+)\)/);
            if (nthMatch) {
              const index = parseInt(nthMatch[1]) - 1;
              const candidates = document.querySelectorAll(tagName);
              el = candidates[index];
            }
          }
        } catch (e) {}
      }

      if (!el) {
        console.error(`ABT: Failed to locate element.`);
        return;
      }

      // 2. 가려짐 방지 정밀 스크롤
      const rect = el.getBoundingClientRect();
      const absoluteTop = rect.top + window.pageYOffset;
      
      // 고정 헤더 감지
      let headerOffset = 0;
      const fixies = Array.from(document.querySelectorAll('*')).filter(n => {
        const s = window.getComputedStyle(n);
        return (s.position === 'fixed' || s.position === 'sticky') && 
               parseInt(s.top) <= 0 && n.offsetHeight > 0 && n.offsetHeight < window.innerHeight / 3;
      });
      if (fixies.length > 0) headerOffset = Math.max(...fixies.map(n => n.offsetHeight));

      window.scrollTo({
        top: Math.max(0, absoluteTop - headerOffset - (window.innerHeight / 4)),
        behavior: 'smooth'
      });

      // 3. SVG 스포트라이트 오버레이
      const containerId = 'abt-spotlight-overlay-v2';
      const removeOld = () => {
        const old = document.getElementById(containerId);
        if (old) old.remove();
      };
      removeOld();

      const container = document.createElement('div');
      container.id = containerId;
      Object.assign(container.style, {
        position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: '2147483647', transition: 'opacity 0.3s'
      });

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      
      const maskId = 'abt-mask-' + Math.random().toString(36).substr(2, 9);
      svg.innerHTML = `
        <defs>
          <mask id="${maskId}">
            <rect width="100%" height="100%" fill="white" />
            <rect id="abt-mask-hole" x="0" y="0" width="0" height="0" rx="4" fill="black" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.7)" mask="url(#${maskId})" />
        <rect id="abt-focus-rect" x="0" y="0" width="0" height="0" rx="4" fill="none" stroke="#ff00ff" stroke-width="4" />
      `;

      container.appendChild(svg);
      document.body.appendChild(container);

      const hole = svg.querySelector('#abt-mask-hole');
      const focusRect = svg.querySelector('#abt-focus-rect');

      // 4. 애니메이션 실시간 위치 추적
      let active = true;
      const update = () => {
        if (!active || !el) return;
        const r = el.getBoundingClientRect();
        const p = 8; // padding
        const attrs = {
          x: r.left - p, y: r.top - p,
          width: r.width + (p * 2), height: r.height + (p * 2)
        };
        
        [hole, focusRect].forEach(target => {
          for (let k in attrs) target.setAttribute(k, attrs[k]);
        });
        requestAnimationFrame(update);
      };
      requestAnimationFrame(update);

      // 5. 클린업
      const cleanup = () => {
        active = false;
        container.style.opacity = '0';
        setTimeout(removeOld, 300);
        document.removeEventListener('mousedown', cleanup);
      };
      document.addEventListener('mousedown', cleanup);
      setTimeout(cleanup, 4000);

    } catch (e) {
      console.error("ABT: Spotlight Error", e);
    }
  }
}

// Global Singleton
window.ABTCore = new ABTCore();

// 기존 QuickScan 함수를 Core 기반으로 업데이트
window.ABTQuickScan = () => window.ABTCore.runFullAudit();
