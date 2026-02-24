/**
 * ABT Background Service Worker
 * Handles message relay between Content Scripts and Side Panel
 */

// Track open side panels (if needed for specific targeting)
let sidePanelPort = null;

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'abt-sidepanel') {
    sidePanelPort = port;
    port.onDisconnect.addListener(() => {
      sidePanelPort = null;
    });
  }
});

// Relay messages from Content Scripts to Side Panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // If message is from content script (has sender.tab)
  if (sender.tab) {
    if (sidePanelPort) {
      sidePanelPort.postMessage({
        ...message,
        tabId: sender.tab.id
      });
    } else {
      // Fallback to broadcast if port is not used
      chrome.runtime.sendMessage({
        ...message,
        tabId: sender.tab.id
      });
    }
  } 
  // If message is from Side Panel to Content Script (e.g., locate-element)
  else if (message.type === 'locate-element' && message.tabId) {
    chrome.tabs.sendMessage(message.tabId, message, (response) => {
      sendResponse(response);
    });
    return true; // Keep channel open for async response
  }
});

// Open side panel on action click
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
