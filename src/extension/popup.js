const scanBtn = document.getElementById('scanBtn');
const btnSpinner = document.getElementById('btnSpinner');
const btnText = document.getElementById('btnText');

scanBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab.url.startsWith('chrome://') || tab.url.startsWith('about:')) {
    alert('Cannot scan browser internal pages.');
    return;
  }

  // UI를 로딩 상태로 변경
  scanBtn.disabled = true;
  btnSpinner.style.display = 'block';
  btnText.textContent = 'Scanning...';

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      if (typeof window.ABTQuickScan === 'function') {
        window.ABTQuickScan();
        return { success: true };
      } else {
        return { success: false };
      }
    }
  }, (results) => {
    const result = results[0]?.result;
    
    // 약간의 지연 후 UI 복구 (사용자가 동작을 인지할 수 있도록)
    setTimeout(() => {
      scanBtn.disabled = false;
      btnSpinner.style.display = 'none';
      btnText.textContent = 'Quick Scan';
      
      if (result && !result.success) {
        alert('ABT Engine not loaded. Please refresh the page.');
      } else if (!result) {
        alert('Failed to execute scan. Make sure the page is fully loaded.');
      }
    }, 800);
  });
});
