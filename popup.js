const scanBtn = document.getElementById('scanBtn');
const status  = document.getElementById('status');

scanBtn.addEventListener('click', async () => {
  scanBtn.disabled = true;
  scanBtn.textContent = '⏳ Scanning…';
  status.textContent = '';
  status.className = 'status';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Block Chrome internal pages
  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
    status.textContent = 'Cannot scan Chrome internal pages.';
    status.className = 'status error';
    scanBtn.disabled = false;
    scanBtn.textContent = '⚡ Scan This Page';
    return;
  }

  try {
    // Always inject fresh — content.js has a guard to avoid double-scanning
    await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ['content.css'] });
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });

    // Small delay to let the script initialise, then trigger scan
    setTimeout(() => {
      chrome.tabs.sendMessage(tab.id, { type: 'SCAN_PAGE' });
    }, 150);

    status.textContent = 'Scanning headlines… hover badges for details.';
  } catch (err) {
    status.textContent = 'Error: ' + err.message;
    status.className = 'status error';
  }

  scanBtn.disabled = false;
  scanBtn.textContent = '⚡ Scan This Page';
});
