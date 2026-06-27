// Bento Demo Debugger - Core Script (Intentionally Broken)

// API Key is intentionally left empty/uninitialized for the live-code debugging demo
const API_KEY = ""; 

document.getElementById("deconstruct-btn").addEventListener("click", async () => {
  const term = document.getElementById("term-input").value.trim();
  const consoleBox = document.getElementById("error-console");
  
  if (!term) {
    consoleBox.textContent = "Error: Input is empty.";
    return;
  }
  
  consoleBox.textContent = "Initiating fetch to Gemini API...";
  console.log("Calling Gemini API with key: '" + API_KEY + "'");

  try {
    // Attempting API call using the empty API_KEY
    // The missing key will trigger a network error (HTTP 400 Bad Request or HTTP 401 Unauthorized)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Analyze the term: "${term}"` }]
        }]
      })
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const errMsg = errorJson.error?.message || `HTTP Status ${response.status}`;
      throw new Error(`API Connection Failed: ${errMsg}`);
    }

    const data = await response.json();
    consoleBox.style.color = "#16a34a"; // Green for success
    consoleBox.textContent = JSON.stringify(data, null, 2);

  } catch (error) {
    // Print warning log to console (which will render as red text in Chrome DevTools)
    console.error("%c[Bento Debugger Error]", "color: red; font-weight: bold;", error);
    
    // Render error in the extension's UI console block
    consoleBox.style.color = "#f87171"; // Red for errors
    consoleBox.textContent = `CRITICAL: ${error.message}\n\n[DevTip: Inspect chrome://extensions/ background page or popup console (right click popup -> Inspect) to view raw network trace]`;
  }
});
