/**
 * ABT Background Service Worker (Stable & Detached Popup Mode)
 * 사이드 패널 대신 독립 팝업 창을 기본으로 사용합니다.
 */

const abtPorts = new Set();

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'abt-sidepanel') {
    abtPorts.add(port);
    port.onDisconnect.addListener(() => {
      abtPorts.delete(port);
    });
  }
});

// Relay messages from Engine to UI
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.tab) {
    if (message.type === 'UPDATE_ABT_LIST') {
      // 1. Relay to ports
      if (abtPorts.size > 0) {
        abtPorts.forEach(port => {
          try { port.postMessage(message); } catch (e) { abtPorts.delete(port); }
        });
      }
      // 2. Broadcast
      chrome.runtime.sendMessage(message);
    }
  } 
  // Relay commands from UI to Engine
  else if (message.type === 'locate-element' || message.type === 'RUN_AUDIT') {
    const targetWinId = message.windowId;
    
    const findAndSend = (queryOptions) => {
      chrome.tabs.query(queryOptions, (tabs) => {
        // Filter out extension pages
        const targetTab = tabs.find(t => t.url && !t.url.startsWith('chrome-extension://'));
        
        if (targetTab) {
          chrome.tabs.sendMessage(targetTab.id, message, (response) => {
            if (chrome.runtime.lastError) {
              chrome.scripting.executeScript({
                target: { tabId: targetTab.id },
                files: ['engine/abt-engine.js']
              }).then(() => {
                setTimeout(() => chrome.tabs.sendMessage(targetTab.id, message), 200);
              });
            }
            if (sendResponse) sendResponse(response);
          });
        } else if (queryOptions.windowId) {
          // Fallback to global active tab if window-specific query failed
          findAndSend({ active: true });
        }
      });
    };

    const options = targetWinId 
      ? { active: true, windowId: targetWinId }
      : { active: true, lastFocusedWindow: true };
    
    findAndSend(options);
    return true; 
  }
});

// [기본 진입점] 아이콘 클릭 시 전용 팝업 창 열기
chrome.action.onClicked.addListener((tab) => {
  chrome.windows.getCurrent((currentWin) => {
    chrome.windows.create({
      url: chrome.runtime.getURL(`sidepanel.html?mode=popup&windowId=${currentWin.id}`),
      type: 'popup',
      width: 800,
      height: 950
    });
  });
});
