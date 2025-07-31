chrome.runtime.onInstalled.addListener(function() {
  console.log('Puzzle Helper extension installed!');
});

chrome.action.onClicked.addListener(function(tab) {
  if (tab.url.includes('indianexpress.com')) {
    chrome.tabs.sendMessage(tab.id, {action: 'quickScan'});
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'logPuzzleFound') {
    console.log('Puzzle detected:', request.puzzleType);
  }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url.includes('indianexpress.com')) {
    chrome.tabs.sendMessage(tabId, {action: 'pageLoaded'});
  }
}); 