const BACKEND = "https://weblab-ide-api.onrender.com";

const tabContent = {
  html: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello from WebLab IDE</h1>\n  <p>Start editing to see magic ✨</p>\n</body>\n</html>`,
  css:  `body {\n  font-family: Arial, sans-serif;\n  background: #f0f4ff;\n  display: flex;\n  justify-content: center;\n  padding: 40px;\n}\n\nh1 {\n  color: #7c6af7;\n}\n\np {\n  color: #555;\n}`,
  js:   `// JavaScript runs in the preview\nconsole.log('Hello from WebLab IDE ⚡');\n\ndocument.addEventListener('DOMContentLoaded', () => {\n  console.log('DOM ready');\n});`
};

let editor;
let currentLanguage = "html";
let activeTab = "html";
let ignoreChange = false;

require.config({ paths: { vs: "https://unpkg.com/monaco-editor@0.44.0/min/vs" } });

require(["vs/editor/editor.main"], function () {

  // Enable full HTML/CSS/JS language features
  monaco.languages.html.htmlDefaults.setOptions({
    format: { tabSize: 2, insertSpaces: true },
    suggest: { html5: true },
    autoClosingTags: true
  });

  monaco.languages.css.cssDefaults.setOptions({ validate: true });
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({ noSemanticValidation: false });

  editor = monaco.editor.create(document.getElementById("editor"), {
    value: tabContent.html,
    language: "html",
    theme: "vs-dark",
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    fontLigatures: true,
    minimap: { enabled: false },
    automaticLayout: true,
    tabSize: 2,
    wordWrap: "on",
    // Auto-closing & brackets
    autoClosingBrackets: "always",
    autoClosingQuotes: "always",
    autoClosingTags: true,
    autoIndent: "full",
    // Suggestions
    quickSuggestions: { other: true, comments: false, strings: true },
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: "on",
    snippetSuggestions: "top",
    // Formatting
    formatOnType: true,
    formatOnPaste: true,
    // Visuals
    cursorBlinking: "smooth",
    cursorSmoothCaretAnimation: "on",
    smoothScrolling: true,
    renderLineHighlight: "gutter",
    bracketPairColorization: { enabled: true },
    guides: { bracketPairs: true, indentation: true },
    padding: { top: 10 },
    scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 }
  });

  editor.onDidChangeModelContent(() => {
    if (ignoreChange) return;
    if (currentLanguage === "html") {
      tabContent[activeTab] = editor.getValue();
      if (document.getElementById("autoRun").checked) updatePreview();
    }
  });

  // Initial preview
  updatePreview();
});

function switchTab(tab) {
  if (currentLanguage !== "html") return;

  tabContent[activeTab] = editor.getValue();
  activeTab = tab;

  document.querySelectorAll(".tab").forEach(t =>
    t.classList.toggle("active", t.dataset.tab === tab)
  );

  const langMap = { html: "html", css: "css", js: "javascript" };
  const fileMap  = { html: "index.html", css: "style.css", js: "script.js" };

  ignoreChange = true;
  monaco.editor.setModelLanguage(editor.getModel(), langMap[tab]);
  editor.setValue(tabContent[tab]);
  ignoreChange = false;

  document.getElementById("filename-display").textContent = fileMap[tab];
}

function setLanguage(lang) {
  currentLanguage = lang;

  document.querySelectorAll(".sidebar button[id^='btn-']").forEach(b => b.classList.remove("active"));
  document.getElementById("btn-" + lang).classList.add("active");
  document.getElementById("tabs").classList.toggle("hidden", lang !== "html");
  document.getElementById("lang-badge").textContent = lang.toUpperCase();

  if (lang === "html") {
    activeTab = "html";
    ignoreChange = true;
    monaco.editor.setModelLanguage(editor.getModel(), "html");
    editor.setValue(tabContent.html);
    ignoreChange = false;
    document.getElementById("filename-display").textContent = "index.html";
    updatePreview();
  } else {
    ignoreChange = true;
    monaco.editor.setModelLanguage(editor.getModel(), "python");
    editor.setValue("# Python\nprint('Hello from WebLab IDE 🐍')\n\nfor i in range(5):\n    print(f'Line {i + 1}')");
    ignoreChange = false;
    document.getElementById("filename-display").textContent = "main.py";
    document.getElementById("preview").srcdoc = `
      <html><body style="background:#0f0f13;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
        <p style="color:#6e7681;font-family:monospace;font-size:13px">▶ Run Python to see output in terminal</p>
      </body></html>`;
  }
}

function updatePreview() {
  if (currentLanguage === "html") tabContent[activeTab] = editor.getValue();

  const combined = `<!DOCTYPE html><html><head><style>${tabContent.css}</style></head><body>${tabContent.html}<script>${tabContent.js}<\/script></body></html>`;
  document.getElementById("preview").srcdoc = combined;
}

async function runCode() {
  if (currentLanguage === "html") {
    updatePreview();
    log("✓ Preview updated.", "info");
    return;
  }

  const code = editor.getValue();
  log("⚡ Running Python...", "info");

  try {
    const res = await fetch(`${BACKEND}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: "python", code })
    });

    const data = await res.json();

    if (data.error) {
      log(data.error, "error");
    } else {
      log(data.output || "(no output)");
    }
  } catch (err) {
    log("✗ Failed to reach backend: " + err.message, "error");
  }
}

function log(msg, type = "normal") {
  const terminal = document.getElementById("terminal");
  const line = document.createElement("div");

  if (type === "error") {
    line.innerHTML = `<span class="prompt">~/weblab $</span> <span class="error">${msg}</span>`;
  } else if (type === "info") {
    line.innerHTML = `<span class="prompt">~/weblab $</span> <span class="info">${msg}</span>`;
  } else {
    line.innerHTML = `<span class="prompt">~/weblab $</span> ${msg}`;
  }

  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}

function clearTerminal() {
  document.getElementById("terminal").innerHTML = `<span class="prompt">~/weblab $</span> Terminal cleared.`;
}
