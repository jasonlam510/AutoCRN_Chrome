// Background service worker for Manifest V3
chrome.runtime.onInstalled.addListener(() => {
  console.log('AutoCRN extension installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This will be handled by the popup, but we can add additional logic here if needed
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "ac_show_msg") {
    // Handle message display logic if needed
    console.log('Message from content script:', request.message);
    sendResponse({success: true, received: true});
  }
  return false; // No need to keep message channel open for sync operations
});
