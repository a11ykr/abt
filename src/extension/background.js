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
  // If message is from Side Panel to Content Script (e.g., locate-element, RUN_AUDIT)
  else if (message.type === 'locate-element' || message.type === 'RUN_AUDIT') {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs[0]) {
        const tabId = tabs[0].id;
        console.log("ABT: Relaying message to tab:", tabId, message.type);
        
        chrome.tabs.sendMessage(tabId, message, (response) => {
          if (chrome.runtime.lastError) {
            console.log("ABT: Content script not ready, injecting engine...");
            // Inject engine and retry message
            chrome.scripting.executeScript({
              target: { tabId: tabId },
              files: ['engine/abt-engine.js']
            }).then(() => {
              setTimeout(() => {
                chrome.tabs.sendMessage(tabId, message);
              }, 100);
            }).catch(err => console.error("ABT: Failed to inject engine", err));
          }
          if (sendResponse) sendResponse(response);
        });
      } else {
        console.warn("ABT: No active tab found to relay message");
      }
    });
    return true; // Keep channel open for async response
  }
});

// Open side panel on action click
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
