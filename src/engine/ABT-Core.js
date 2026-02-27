/**
 * ABT Core Engine
 * 지침별 프로세서들을 등록하고 통합 진단을 수행하는 중앙 컨트롤러
 */
class ABTCore {
  constructor() {
    this.processors = new Map();
    this.connector = window.ABTConnector;
    this.standards = null;
  }

  /**
   * 진단 기준 데이터를 로드합니다.
   */
  async loadStandards() {
    try {
      // 확장 프로그램 내 리소스 경로에서 로드 (Vite/Manifest 환경 고려)
      const response = await fetch(chrome.runtime.getURL('src/engine/kwcag-standards.json'));
      this.standards = await response.json();
      console.log("ABT: KWCAG Standards loaded.", this.standards.version);
    } catch (error) {
      console.error("ABT: Failed to load standards JSON. Falling back to basic info.", error);
    }
  }

  /**
   * 새로운 프로세서를 등록합니다.
   * @param {string} id - 지침 번호 (예: '1.1.1')
   * @param {object} processor - scan() 메서드를 가진 프로세서 객체
   */
  registerProcessor(id, processor) {
    if (!/^[0-9]\.[0-9]\.[0-9]$/.test(id)) {
      console.warn(`ABT: Blocked registration of legacy processor [${id}].`);
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
      console.warn("ABT: Desktop 앱과 연결되어 있지 않습니다.");
    }

    console.log("ABT: Starting Full Audit...");
    let totalIssues = 0;
    
    const pageInfo = {
      url: window.location.href || "Unknown URL",
      pageTitle: document.title.trim() || window.location.hostname || "Untitled Page",
      timestamp: new Date().toISOString(),
      scanId: Date.now()
    };

    for (const [id, processor] of this.processors) {
      try {
        // 현재 진행 중인 지침 정보 전송
        this.connector.send({
          type: 'SCAN_PROGRESS',
          guideline_id: id
        });
        
        console.log(`ABT: Running Processor [${id}]...`);
        const reports = await processor.scan();
        console.log(`ABT: Processor [${id}] scanned, found ${reports?.length || 0} items.`);
        
        if (reports && reports.length > 0) {
          const batch = reports
            .filter(report => !!report)
            .map(report => {
              report.guideline_id = id;
              report.pageInfo = { ...pageInfo };
              
              // [매핑 로직 추가] 표준 데이터 결합
              if (this.standards && this.standards.items[id]) {
                const item = this.standards.items[id];
                report.guideline_info = {
                  name: item.name,
                  principle: this.standards.principles ? this.standards.principles[item.principle_id] : item.principle_id,
                  compliance_criteria: item.compliance_criteria,
                  detailed_descriptions: item.detailed_descriptions
                };

                // 오류 코드 매핑 (예: Rule 1.1 -> 1-1)
                if (report.result.rules && report.result.rules.length > 0) {
                  report.result.detailed_errors = report.result.rules.map(rule => {
                    const match = rule.match(/Rule\s+(\d+\.\d+)/i);
                    if (match) {
                      const errorCode = match[1].replace('.', '-');
                      return {
                        code: errorCode,
                        description: item.error_types[errorCode] || "상세 설명 없음"
                      };
                    }
                    return { code: rule, description: "규칙 설명 없음" };
                  });
                }
              }

              return report;
            });
          
          if (batch.length > 0) {
            this.connector.sendBatch(batch);
            totalIssues += batch.length;
          }
        }
      } catch (error) {
        console.error(`ABT: Error in Processor [${id}]:`, error);
      }
    }
    // 모든 지침 진단 완료 신호 전송
    this.connector.send({
      type: 'SCAN_FINISHED',
      scanId: pageInfo.scanId,
      totalIssues: totalIssues
    });

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

      // 1. 요소 탐색 (기본 선택자 -> 정밀 구조 폴백)
      let el = document.querySelector(selector);
      
      if (!el) {
        console.warn(`ABT: Selector failed: ${selector}. Trying structure fallback...`);
        try {
          const parts = selector.split(' > ');
          const lastPart = parts[parts.length - 1];
          const tagMatch = lastPart.match(/^([a-z0-9]+)/i);
          if (tagMatch) {
            const tagName = tagMatch[1];
            const nthMatch = lastPart.match(/:nth-of-type\((\d+)\)/) || lastPart.match(/:nth-child\((\d+)\)/);
            if (nthMatch) {
              const index = parseInt(nthMatch[1]) - 1;
              const candidates = Array.from(document.querySelectorAll(tagName)).filter(c => !window.ABTUtils.isHidden(c));
              el = candidates[index];
            }
          }
        } catch (e) {}
      }

      if (!el) {
        console.error(`ABT: Failed to locate element: ${selector}`);
        return;
      }

      // 2. 가려짐 방지 정밀 스크롤
      const rect = el.getBoundingClientRect();
      const absoluteTop = rect.top + window.pageYOffset;
      
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
  /**
   * 이미지를 숨기고 대체 텍스트(alt)를 그 자리에 오버레이하여 시각적으로 표시합니다. (1.1.1 지침 검수용)
   * @param {boolean} enable - true면 이미지 끄기 및 alt 텍스트 표시, false면 복구
   */
  toggleImageAltView(enable) {
    try {
      const OVERLAY_CLASS = 'abt-alt-overlay-element';
      
      if (enable) {
        // 1. 기존 오버레이가 있다면 제거 (중복 방지)
        document.querySelectorAll(`.${OVERLAY_CLASS}`).forEach(el => el.remove());
        
        // 2. 모든 이미지 관련 요소 수집
        const imgElements = document.querySelectorAll('img, [role="img"], svg');
        
        imgElements.forEach(img => {
          // 이미지 원본 투명처리
          if (!img.dataset.originalOpacity) {
            img.dataset.originalOpacity = img.style.opacity || '1';
          }
          img.style.opacity = '0.1'; // 완전히 가리지 않고 형태만 어렴풋이 남김
          img.style.filter = 'grayscale(100%)';
          
          // 대체 텍스트 추출
          let altText = img.getAttribute('alt') || img.getAttribute('aria-label') || img.getAttribute('title') || '';
          if (img.tagName.toLowerCase() === 'svg') {
            const titleEl = img.querySelector('title');
            if (titleEl) altText = titleEl.textContent;
          }

          // 오버레이 생성
          const overlay = document.createElement('div');
          overlay.className = OVERLAY_CLASS;
          overlay.textContent = altText ? `[ALT: ${altText}]` : `[ALT 없음]`;
          
          // 스타일링
          Object.assign(overlay.style, {
            position: 'absolute',
            backgroundColor: altText ? 'rgba(22, 163, 74, 0.9)' : 'rgba(220, 38, 38, 0.9)', // 녹색(있음) vs 빨간색(없음)
            color: 'white',
            padding: '4px 8px',
            fontSize: '12px',
            fontWeight: 'bold',
            borderRadius: '4px',
            zIndex: '2147483646',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
          });

          // 위치 지정 (이미지 바로 위에)
          const rect = img.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            overlay.style.top = `${rect.top + window.scrollY}px`;
            overlay.style.left = `${rect.left + window.scrollX}px`;
            document.body.appendChild(overlay);
          }
        });
      } else {
        // 복구 모드
        document.querySelectorAll(`.${OVERLAY_CLASS}`).forEach(el => el.remove());
        document.querySelectorAll('img, [role="img"], svg').forEach(img => {
          if (img.dataset.originalOpacity !== undefined) {
            img.style.opacity = img.dataset.originalOpacity;
            img.style.filter = '';
            delete img.dataset.originalOpacity;
          }
        });
      }
      console.log(`ABT: Image Alt View ${enable ? 'Enabled' : 'Disabled'}`);
    } catch (e) {
      console.error("ABT: Failed to toggle image alt view", e);
    }
  }

  /**
   * 모든 CSS 스타일시트를 비활성화하거나 활성화하여 선형 구조를 확인합니다. (1.3.2 지침 검수용)
   * @param {boolean} enable - true면 선형화(CSS 끔), false면 복구(CSS 켬)
   */
  toggleLinearView(enable) {
    try {
      Array.from(document.styleSheets).forEach(ss => {
        try {
          ss.disabled = !!enable;
        } catch (e) {}
      });
      console.log(`ABT: Linear View ${enable ? 'Enabled' : 'Disabled'}`);
    } catch (e) {
      console.error("ABT: Failed to toggle linear view", e);
    }
  }
}

// Global Singleton
window.ABTCore = new ABTCore();

// 기존 QuickScan 함수를 Core 기반으로 업데이트
window.ABTQuickScan = async () => {
  if (!window.ABTCore.standards) {
    await window.ABTCore.loadStandards();
  }
  return window.ABTCore.runFullAudit();
};
