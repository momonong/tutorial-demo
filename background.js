// Bento Language Companion - Background Service Worker

// Create context menu items on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "bento-deconstruct",
    title: 'Deconstruct "%s" in Bento Companion',
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "bento-polish",
    title: 'Polish Style in Bento Companion',
    contexts: ["selection"]
  });
});

// Listen for context menu click events
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selectedText = info.selectionText ? info.selectionText.trim() : "";
  if (!selectedText) return;

  if (info.menuItemId === "bento-deconstruct") {
    // Stage text for vocabulary companion
    chrome.storage.local.set({ tempSelectedText: selectedText }, () => {
      // Optional: trigger popup opening (supported in newer Chrome versions, MV3)
      if (chrome.action.openPopup) {
        chrome.action.openPopup();
      }
    });
  } else if (info.menuItemId === "bento-polish") {
    // Stage text for style polisher
    chrome.storage.local.set({ tempSelectedTextPolish: selectedText }, () => {
      if (chrome.action.openPopup) {
        chrome.action.openPopup();
      }
    });
  }
});
