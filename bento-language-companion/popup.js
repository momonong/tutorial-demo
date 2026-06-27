// Bento Language Companion - Core Application Logic

// Curated Daily Lexemes for Foreign Language Scholars
const DAILY_LEXEMES = [
  {
    word: "Flâneur",
    pos: "noun [French]",
    ipa: "/flɑˈnœʁ/",
    def: "A passionate spectator, amateur detective, and investigator of the city."
  },
  {
    word: "Sehnsucht",
    pos: "noun [German]",
    ipa: "/ˈzeːnˌzuːxt/",
    def: "A deep yearning for an elusive, distant, or indefinable goal; a search for the unattainable."
  },
  {
    word: "Mono no aware",
    pos: "noun phrase [Japanese]",
    ipa: "/mo'no no a'wa.ɾe/",
    def: "The beautiful and melancholic awareness of the impermanence of all things."
  },
  {
    word: "Saudade",
    pos: "noun [Portuguese]",
    ipa: "/sawˈdaðɨ/",
    def: "A deep emotional state of melancholic longing for an absent something or someone that is loved."
  },
  {
    word: "Duende",
    pos: "noun [Spanish]",
    ipa: "/dwen.de/",
    def: "A quality of passion and inspiration, possessing a mysterious, soulful power that moves people."
  },
  {
    word: "Sprezzatura",
    pos: "noun [Italian]",
    ipa: "/sprettsaˈtuːra/",
    def: "A certain nonchalance, so as to conceal all art and make whatever one does or says appear effortless."
  },
  {
    word: "Eunoia",
    pos: "noun [Greek]",
    ipa: "/juːˈnɔɪ.ə/",
    def: "A pure, beautiful, and well-balanced mind; goodwill and sympathy towards others."
  }
];

// State variables
let currentApiKey = "";
let currentVocabResult = null;

// Initializer
document.addEventListener("DOMContentLoaded", async () => {
  initDailyLexeme();
  await loadApiKey();
  await loadLexicon();
  await checkSelectedText();
  setupEventListeners();
});

// 1. Initialize Daily Lexeme
function initDailyLexeme() {
  const index = Math.floor(Math.random() * DAILY_LEXEMES.length);
  const selected = DAILY_LEXEMES[index];
  
  document.getElementById("daily-word").textContent = selected.word;
  document.getElementById("daily-pos").textContent = selected.pos;
  document.getElementById("daily-ipa").textContent = selected.ipa;
  document.getElementById("daily-def").textContent = `"${selected.def}"`;
}

// 2. Load API Key from local storage
async function loadApiKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["geminiApiKey"], (result) => {
      if (result.geminiApiKey) {
        currentApiKey = result.geminiApiKey;
        document.getElementById("api-key-input").value = currentApiKey;
        updateApiStatus(true, "Linked");
      } else {
        updateApiStatus(false, "No API Key");
      }
      resolve();
    });
  });
}

// Update API key status styling
function updateApiStatus(connected, text) {
  const dot = document.getElementById("api-status-dot");
  const textEl = document.getElementById("api-status-text");
  
  if (connected) {
    dot.classList.add("connected");
    textEl.textContent = text;
  } else {
    dot.classList.remove("connected");
    textEl.textContent = text;
  }
}

// 3. Setup event handlers
function setupEventListeners() {
  // API Key operations
  document.getElementById("save-key-btn").addEventListener("click", saveApiKey);
  document.getElementById("toggle-key-visibility").addEventListener("click", toggleKeyVisibility);
  
  // Vocabulary Companion operations
  document.getElementById("vocab-btn").addEventListener("click", handleVocabDeconstruct);
  document.getElementById("vocab-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleVocabDeconstruct();
  });
  document.getElementById("save-to-lexicon").addEventListener("click", saveCurrentToLexicon);
  
  // Polisher operations
  document.getElementById("polish-btn").addEventListener("click", handleProsePolish);
  document.getElementById("copy-polished-btn").addEventListener("click", copyPolishedText);
  
  // Lexicon general operations
  document.getElementById("export-lexicon-btn").addEventListener("click", exportLexicon);
}

// Toggle input field type for API key
function toggleKeyVisibility() {
  const input = document.getElementById("api-key-input");
  if (input.type === "password") {
    input.type = "text";
  } else {
    input.type = "password";
  }
}

// Save API key
function saveApiKey() {
  const inputVal = document.getElementById("api-key-input").value.trim();
  if (!inputVal) {
    chrome.storage.local.remove(["geminiApiKey"], () => {
      currentApiKey = "";
      updateApiStatus(false, "Cleared");
      alert("API Key removed.");
    });
    return;
  }
  
  chrome.storage.local.set({ geminiApiKey: inputVal }, () => {
    currentApiKey = inputVal;
    updateApiStatus(true, "Linked");
    alert("API Key saved successfully!");
  });
}

// 4. Retrieve Webpage selection
async function checkSelectedText() {
  return new Promise((resolve) => {
    // Check if background script staged text from context menus
    chrome.storage.local.get(["tempSelectedText", "tempSelectedTextPolish"], async (stored) => {
      let stagedVocab = stored.tempSelectedText;
      let stagedPolish = stored.tempSelectedTextPolish;

      if (stagedVocab) {
        document.getElementById("vocab-input").value = stagedVocab;
        document.getElementById("vocab-input").focus();
        // Clear it so it doesn't reappear next time
        chrome.storage.local.remove(["tempSelectedText"]);
        resolve();
        return;
      }

      if (stagedPolish) {
        document.getElementById("polish-input").value = stagedPolish;
        document.getElementById("polish-input").focus();
        chrome.storage.local.remove(["tempSelectedTextPolish"]);
        resolve();
        return;
      }

      // Fallback: Query active tab selection directly
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.id || tab.url.startsWith("chrome://") || tab.url.startsWith("edge://") || tab.url.startsWith("about:")) {
          resolve();
          return;
        }

        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => window.getSelection().toString().trim()
        }, (results) => {
          if (results && results[0] && results[0].result) {
            const text = results[0].result;
            if (text.length < 60) {
              document.getElementById("vocab-input").value = text;
              document.getElementById("vocab-input").focus();
            } else {
              document.getElementById("polish-input").value = text;
              document.getElementById("polish-input").focus();
            }
          }
          resolve();
        });
      } catch (err) {
        console.warn("Could not retrieve text selection: ", err);
        resolve();
      }
    });
  });
}

// Helper to query Gemini API
async function callGemini(promptText) {
  if (!currentApiKey) {
    throw new Error("API Key is missing. Please save your Gemini API key in Card 01 first.");
  }
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${currentApiKey}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: promptText }
          ]
        }
      ]
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error?.message || `HTTP ${response.status}`;
    throw new Error(`Gemini API Error: ${message}`);
  }
  
  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error("No response content received from Gemini.");
  }
  
  return cleanJsonString(rawText);
}

// Clean markdown wrappers from JSON response
function cleanJsonString(str) {
  let cleaned = str.trim();
  // Remove markdown code blocks if the model wrapped it
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(json)?/, "");
    cleaned = cleaned.replace(/```$/, "");
  }
  return cleaned.trim();
}

// 5. Handle Vocabulary Deconstruction (Card 4)
async function handleVocabDeconstruct() {
  const term = document.getElementById("vocab-input").value.trim();
  const targetLang = document.getElementById("vocab-lang").value;
  
  if (!term) return;
  
  const placeholder = document.getElementById("vocab-placeholder");
  const resultDiv = document.getElementById("vocab-result");
  const loader = document.getElementById("vocab-loader");
  
  placeholder.classList.add("hidden");
  resultDiv.classList.add("hidden");
  loader.classList.remove("hidden");
  
  const prompt = `You are a sophisticated philologist and lexicographer. Analyze the term: "${term}" with target language for learning translation being "${targetLang}".
Provide a detailed linguistic profile as a valid JSON object. Do not include markdown code block formatting (like \`\`\`json). The output must match this JSON structure:
{
  "word": "the word/phrase in source language",
  "ipa": "IPA pronunciation if available, else empty",
  "pos": "part of speech with language (e.g. noun [French], verb [Japanese])",
  "meaning": "Clear english translation and core definition",
  "etymology": "Brief origin details, root words, or stylistic nuances",
  "example": "A beautiful exemplar quote/sentence in the source language, followed by its English translation in parentheses"
}`;

  try {
    const jsonText = await callGemini(prompt);
    const parsed = JSON.parse(jsonText);
    
    currentVocabResult = parsed;
    
    document.getElementById("res-word").textContent = parsed.word || term;
    document.getElementById("res-ipa").textContent = parsed.ipa || "";
    document.getElementById("res-pos").textContent = parsed.pos || "lexical item";
    document.getElementById("res-meaning").textContent = parsed.meaning || "N/A";
    document.getElementById("res-etymology").textContent = parsed.etymology || "N/A";
    document.getElementById("res-example").textContent = parsed.example || "N/A";
    
    loader.classList.add("hidden");
    resultDiv.classList.remove("hidden");
  } catch (error) {
    loader.classList.add("hidden");
    placeholder.classList.remove("hidden");
    alert(`Linguistic Analysis Failed:\n${error.message}`);
  }
}

// 6. Manage Saved Lexicon (Card 5)
async function loadLexicon() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["lexiconList"], (result) => {
      const listEl = document.getElementById("lexicon-list");
      const emptyEl = document.getElementById("lexicon-empty");
      
      // Clear all items except empty state
      listEl.querySelectorAll(".lexicon-item").forEach(item => item.remove());
      
      const items = result.lexiconList || [];
      if (items.length === 0) {
        emptyEl.classList.remove("hidden");
      } else {
        emptyEl.classList.add("hidden");
        
        // Populate items in reverse order (newest first)
        items.slice().reverse().forEach((item, index) => {
          const li = document.createElement("li");
          li.className = "lexicon-item";
          
          // Store real index from primary array for deleting
          const realIndex = items.length - 1 - index;
          
          li.innerHTML = `
            <div class="lexicon-item-content">
              <span class="lexicon-item-word">${escapeHtml(item.word)}</span>
              <span class="lexicon-item-meta">${escapeHtml(item.pos)}</span>
            </div>
            <button class="btn-delete-item" data-index="${realIndex}" title="Delete entry">
              <svg class="icon" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          `;
          
          // Clicking item body loads details back into search pane
          li.querySelector(".lexicon-item-content").addEventListener("click", () => {
            loadLexiconItemIntoView(item);
          });
          
          // Delete button
          li.querySelector(".btn-delete-item").addEventListener("click", (e) => {
            e.stopPropagation();
            deleteLexiconItem(realIndex);
          });
          
          listEl.appendChild(li);
        });
      }
      resolve();
    });
  });
}

function escapeHtml(text) {
  if (!text) return "";
  return text
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function loadLexiconItemIntoView(item) {
  document.getElementById("vocab-placeholder").classList.add("hidden");
  const resultDiv = document.getElementById("vocab-result");
  
  document.getElementById("res-word").textContent = item.word;
  document.getElementById("res-ipa").textContent = item.ipa || "";
  document.getElementById("res-pos").textContent = item.pos || "";
  document.getElementById("res-meaning").textContent = item.meaning || "";
  document.getElementById("res-etymology").textContent = item.etymology || "";
  document.getElementById("res-example").textContent = item.example || "";
  
  resultDiv.classList.remove("hidden");
  
  // Also sync the vocab input search bar
  document.getElementById("vocab-input").value = item.word;
}

function saveCurrentToLexicon() {
  if (!currentVocabResult) return;
  
  chrome.storage.local.get(["lexiconList"], (result) => {
    const list = result.lexiconList || [];
    
    // Avoid exact duplicate words
    const duplicate = list.some(item => item.word.toLowerCase() === currentVocabResult.word.toLowerCase());
    if (duplicate) {
      alert("This entry is already in your lexicon.");
      return;
    }
    
    list.push(currentVocabResult);
    chrome.storage.local.set({ lexiconList: list }, async () => {
      await loadLexicon();
      // Visual feedback: brief color change of button or alert
      alert(`"${currentVocabResult.word}" saved to your lexicon!`);
    });
  });
}

function deleteLexiconItem(index) {
  chrome.storage.local.get(["lexiconList"], (result) => {
    const list = result.lexiconList || [];
    list.splice(index, 1);
    chrome.storage.local.set({ lexiconList: list }, async () => {
      await loadLexicon();
    });
  });
}

function exportLexicon() {
  chrome.storage.local.get(["lexiconList"], (result) => {
    const list = result.lexiconList || [];
    if (list.length === 0) {
      alert("Lexicon is currently empty.");
      return;
    }
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(list, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "bento-lexicon.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });
}

// 7. Handle Style Polisher (Card 6)
async function handleProsePolish() {
  const text = document.getElementById("polish-input").value.trim();
  const register = document.getElementById("polish-register").value;
  
  if (!text) return;
  
  const placeholder = document.getElementById("polish-placeholder");
  const resultBox = document.getElementById("polish-result-box");
  const loader = document.getElementById("polish-loader");
  
  placeholder.classList.add("hidden");
  resultBox.classList.add("hidden");
  loader.classList.remove("hidden");
  
  const prompt = `You are an elite prose editor and stylist. Polishing the text below targeting the "${register}" register.
Provide your response strictly as a JSON object with no markdown syntax. The output format must match:
{
  "polished": "The refined and polished version of the prose",
  "explanation": "A concise (1-2 sentences) rhetorical breakdown of the improvements (e.g. style choice, clarity, flow)"
}

Text to polish:
"${text}"`;

  try {
    const jsonText = await callGemini(prompt);
    const parsed = JSON.parse(jsonText);
    
    document.getElementById("polished-text-out").textContent = parsed.polished || text;
    document.getElementById("polished-explanation-out").textContent = parsed.explanation || "";
    
    loader.classList.add("hidden");
    resultBox.classList.remove("hidden");
  } catch (error) {
    loader.classList.add("hidden");
    placeholder.classList.remove("hidden");
    alert(`Stylistic Polishing Failed:\n${error.message}`);
  }
}

// Copy refined text to clipboard
function copyPolishedText() {
  const textVal = document.getElementById("polished-text-out").textContent;
  if (!textVal) return;
  
  navigator.clipboard.writeText(textVal).then(() => {
    alert("Polished text copied to clipboard!");
  }).catch(err => {
    console.error("Failed to copy text: ", err);
  });
}
