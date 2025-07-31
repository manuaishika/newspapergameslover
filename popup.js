document.addEventListener('DOMContentLoaded', function() {
  const statusDiv = document.getElementById('status');
  const statusText = document.getElementById('status-text');
  const scanBtn = document.getElementById('scanBtn');
  const toggleBtn = document.getElementById('toggleBtn');

  let isActive = false;

  checkCurrentTab();

  scanBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'scanPuzzles'}, function(response) {
        if (response && response.success) {
          statusText.textContent = `Found ${response.count} puzzles!`;
          statusDiv.className = 'status active';
        } else {
          statusText.textContent = 'No puzzles found on this page';
          statusDiv.className = 'status inactive';
        }
      });
    });
  });

  toggleBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleHints'}, function(response) {
        if (response && response.success) {
          isActive = !isActive;
          if (isActive) {
            toggleBtn.textContent = '🔇 Hide Hints';
            statusText.textContent = 'Hints are now visible';
            statusDiv.className = 'status active';
          } else {
            toggleBtn.textContent = '⚡ Show Hints';
            statusText.textContent = 'Hints are hidden';
            statusDiv.className = 'status inactive';
          }
        }
      });
    });
  });

  function checkCurrentTab() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentUrl = tabs[0].url;
      
      if (currentUrl.includes('indianexpress.com')) {
        statusText.textContent = 'Ready to help with puzzles!';
        statusDiv.className = 'status active';
        
        chrome.tabs.sendMessage(tabs[0].id, {action: 'getStatus'}, function(response) {
          if (response && response.puzzlesFound > 0) {
            statusText.textContent = `${response.puzzlesFound} puzzles detected`;
          }
        });
      } else {
        statusText.textContent = 'Please visit The Indian Express website';
        statusDiv.className = 'status inactive';
      }
    });
  }

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateStatus') {
      statusText.textContent = request.message;
      statusDiv.className = request.active ? 'status active' : 'status inactive';
    }
  });
}); 