/**
 * ABT-Connector: Browser to Desktop Bridge
 */
class ABTConnector {
  constructor(url = 'ws://localhost:8888') {
    this.url = url;
    this.socket = null;
    this.isConnected = false;
    this.connect();
  }

  connect() {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      this.isConnected = true;
    };

    this.socket.onclose = () => {
      this.isConnected = false;
      // 5초 후 재연결 시도
      setTimeout(() => this.connect(), 5000);
    };

    this.socket.onerror = () => {
      this.isConnected = false;
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'locate-element' && window.ABTCore) {
          window.ABTCore.highlightElement(data.selector);
        }
      } catch (e) {
        console.warn("ABT: Failed to parse message from desktop", e);
      }
    };
  }

  /**
   * 진단 데이터를 데스크탑 앱으로 전송합니다.
   */
  send(data) {
    if (this.isConnected) {
      this.socket.send(JSON.stringify(data));
      return true;
    }
    return false;
  }
}

// Global Export 및 초기화
window.ABTConnector = new ABTConnector();

// 엔진의 scan 결과를 자동으로 전송하는 래퍼 함수 (브라우저 콘솔에서 실행 가능)
window.ABTQuickScan = async () => {
  if (!window.ABTCore) return console.error('ABTCore not found');
  window.ABTCore.runFullAudit();
};
