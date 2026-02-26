/**
 * ABT-Connector: Browser to Extension Bridge
 */
class ABTConnector {
  constructor() {
    this.isConnected = true; // Chrome runtime is always available in content script
    this.setupListeners();
  }

  setupListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      try {
        if (message.type === 'locate-element' && window.ABTCore) {
          window.ABTCore.highlightElement(message.selector);
          sendResponse({ status: 'success' });
        } else if (message.type === 'RUN_AUDIT' && window.ABTQuickScan) {
          console.log("ABT: Audit triggered via Extension UI");
          window.ABTQuickScan();
          sendResponse({ status: 'started' });
        }
      } catch (e) {
        console.warn("ABT: Failed to handle message from extension", e);
        sendResponse({ status: 'error', message: e.message });
      }
      return true; // Keep channel open for async response if needed
    });
  }

  /**
   * 진단 데이터를 확장 프로그램(Background/Sidepanel)으로 전송합니다.
   */
  send(data) {
    try {
      chrome.runtime.sendMessage({
        type: 'UPDATE_ABT_LIST',
        data: data
      });
      return true;
    } catch (e) {
      console.error("ABT: Failed to send message to extension", e);
      return false;
    }
  }
  /**
   * 진단 데이터를 배치(Batch) 단위로 확장 프로그램으로 전송합니다.
   */
  sendBatch(items) {
    if (!items || items.length === 0) return true;
    try {
      chrome.runtime.sendMessage({
        type: 'UPDATE_ABT_LIST_BATCH',
        items: items
      });
      return true;
    } catch (e) {
      console.error("ABT: Failed to send batch to extension", e);
      return false;
    }
  }

}

// Global Export 및 초기화
window.ABTConnector = new ABTConnector();

// 엔진의 scan 결과를 자동으로 전송하는 래퍼 함수 (브라우저 콘솔에서 실행 가능)
window.ABTQuickScan = async () => {
  if (!window.ABTCore) return console.error('ABTCore not found');
  window.ABTCore.runFullAudit();
};
