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

    for (const [id, processor] of this.processors) {
      try {
        console.log(`ABT: Running Processor [${id}]...`);
        const reports = await processor.scan();
        
        if (reports && reports.length > 0) {
          reports.forEach(report => {
            // 리포트에 지침 ID 강제 주입 (추적용)
            report.guideline_id = id;
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
}

// Global Singleton
window.ABTCore = new ABTCore();

// 기존 QuickScan 함수를 Core 기반으로 업데이트
window.ABTQuickScan = () => window.ABTCore.runFullAudit();
