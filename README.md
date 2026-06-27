# Bento Language Companion 📖✨

> "To have another language is to possess a second soul." — Charlemagne

Welcome to the **Bento Language Companion**, a premium, minimalist Chrome Extension designed specifically for literature, linguistics, and foreign language scholars. Whether you are translating classical texts, analyzing grammatical nuances, polishing essays, or building your personal lexicon, this companion streamlines your workflow using the power of Google's Gemini AI.

Structured in a beautiful, Swiss-design inspired **Bento Grid** layout, it combines spacious typography, high-contrast layouts, and elegant serif headings to provide a sophisticated environment for digital reading and writing.

---

## 🚀 Getting Started

Getting your Bento Language Companion up and running is simple. Follow these three steps:

### Step 1: Download the Extension
To install the extension, you first need to download the source files to your computer:
1. Scroll to the top of this GitHub repository page.
2. Click the green **Code** button on the right.
3. Select **Download ZIP** from the dropdown menu.
4. Locate the downloaded file (`tutorial-demo-main.zip`) on your computer and extract (unzip) it to a folder of your choice (e.g., your Desktop or Documents folder).

### Step 2: Get Your Google AI Studio API Key
The extension communicates directly with Google's Gemini model. To enable this, you need a free API key:
1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click the **Get API Key** button (usually at the top left of the dashboard).
4. Click **Create API Key**. You can choose to associate it with a new project or an existing one.
5. Copy the generated API key (it will look like a long string of letters and numbers). Keep it secure and private!

### Step 3: Load the Extension into Google Chrome
Now, let's add the extension to your browser:
1. Open Google Chrome.
2. In the address bar, type `chrome://extensions/` and press **Enter** (or click the three dots at the top right of Chrome -> **Extensions** -> **Manage Extensions**).
3. In the top right corner of the Extensions page, toggle the switch for **Developer mode** to the **On** position.
4. In the top left corner, click the **Load unpacked** button.
5. Browse your files, select the folder where you extracted the ZIP archive (the folder containing `manifest.json`), and click **Select Folder** (or **Open**).
6. The *Bento Language Companion* will now appear in your list of extensions! Click the puzzle piece icon in your Chrome toolbar and pin it for easy access.

---

## 🎨 Bento Grid Features

Our Swiss-inspired Bento Grid layout splits your workspaces into dedicated zones:
- 🔑 **API Key Center**: Securely saves your Gemini API key inside Chrome's local storage.
- 🗣️ **Vocabulary Companion**: Type or select any foreign word/phrase to receive context-rich translations, pronunciation guides (IPA), and grammar analyses.
- 🖋️ **The Polisher**: Input your essays or draft translations to receive stylistic improvements tailored for Academic, Casual, or Literary registers.
- 📜 **Daily Lexeme**: Displays curated quotes or expressions to inspire your language acquisition journey.
- 🗃️ **Your Lexicon**: Automatically stores your looked-up words and polished notes for future review.

---

## 🛠️ Customizing the Aesthetics
This interface has been styled using a high-contrast, bright, and spacious light mode featuring custom serif typography (**Playfair Display** & **Lora**) and clean CSS grid lines. It is designed to be easily modified:
* The codebase uses native **CSS Variables** (`popup.css`) mapping colors, borders, and margins.
* A dark-mode transition can be implemented by toggling a single class (e.g., `.dark`) on the `<body>` element.

Happy learning! 🌟