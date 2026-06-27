// Bento Language Companion - Content Script
console.log("Bento Language Companion active on page.");

// We can listen for messages if needed in the future
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelectedText") {
    const selectedText = window.getSelection().toString().trim();
    sendResponse({ text: selectedText });
  }
  return true;
});
