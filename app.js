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

  // Activate Emmet (emmet-monaco-es loaded as module)
  function tryActivateEmmet() {
    if (window.__emmetMonaco) {
      window.__emmetMonaco.emmetHTML(monaco, ["html"]);
      window.__emmetMonaco.emmetCSS(monaco, ["css"]);
    } else {
      setTimeout(tryActivateEmmet, 100);
    }
  }
  tryActivateEmmet();

  // Register Emmet snippets manually as fallback for HTML
  registerEmmetSnippets();

  // Initial preview
  updatePreview();
});

function registerEmmetSnippets() {
  // HTML snippets
  monaco.languages.registerCompletionItemProvider("html", {
    triggerCharacters: ["!", ".", "#", ">", "+", "*"],
    provideCompletionItems(model, position) {
      const line = model.getLineContent(position.lineNumber);
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: position.column
      };

      const snippets = [
        {
          label: "!",
          detail: "HTML5 Boilerplate",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: `<!DOCTYPE html>\n<html lang="\${1:en}">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>\${2:Document}</title>\n</head>\n<body>\n  \$0\n</body>\n</html>`,
          documentation: "HTML5 boilerplate",
          range
        },
        { label: "a",       detail: "<a href>",          kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: '<a href="${1:#}">${2:link}</a>', range },
        { label: "div",     detail: "<div>",             kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: "<div>\n  $0\n</div>", range },
        { label: "p",       detail: "<p>",               kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: "<p>$0</p>", range },
        { label: "h1",      detail: "<h1>",              kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: "<h1>$0</h1>", range },
        { label: "h2",      detail: "<h2>",              kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: "<h2>$0</h2>", range },
        { label: "h3",      detail: "<h3>",              kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: "<h3>$0</h3>", range },
        { label: "ul",      detail: "<ul><li>",          kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: "<ul>\n  <li>$0</li>\n</ul>", range },
        { label: "ol",      detail: "<ol><li>",          kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: "<ol>\n  <li>$0</li>\n</ol>", range },
        { label: "li",      detail: "<li>",              kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: "<li>$0</li>", range },
        { label: "img",     detail: "<img src>",         kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: '<img src="${1:url}" alt="${2:description}">', range },
        { label: "input",   detail: "<input type>",      kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: '<input type="${1:text}" placeholder="${2}">', range },
        { label: "button",  detail: "<button>",          kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: "<button>$0</button>", range },
        { label: "form",    detail: "<form>",             kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: '<form action="${1:#}" method="${2:post}">\n  $0\n</form>', range },
        { label: "table",   detail: "<table>",           kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: "<table>\n  <tr>\n    <th>$1</th>\n  </tr>\n  <tr>\n    <td>$0</td>\n  </tr>\n</table>", range },
        { label: "nav",     detail: "<nav>",             kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: "<nav>\n  $0\n</nav>", range },
        { label: "section", detail: "<section>",         kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: "<section>\n  $0\n</section>", range },
        { label: "header",  detail: "<header>",          kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: "<header>\n  $0\n</header>", range },
        { label: "footer",  detail: "<footer>",          kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: "<footer>\n  $0\n</footer>", range },
        { label: "main",    detail: "<main>",            kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: "<main>\n  $0\n</main>", range },
        { label: "span",    detail: "<span>",            kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: "<span>$0</span>", range },
        { label: "link",    detail: "<link rel stylesheet>", kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: '<link rel="stylesheet" href="${1:style.css}">', range },
        { label: "script",  detail: "<script src>",      kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: '<script src="${1:app.js}"><\/script>', range },
        { label: "meta",    detail: "<meta>",            kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: '<meta name="${1:description}" content="${2}">', range },
        { label: "label",   detail: "<label for>",       kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: '<label for="${1}">${2}</label>', range },
        { label: "select",  detail: "<select><option>",  kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: "<select>\n  <option value=\"${1}\">$0</option>\n</select>", range },
        { label: "textarea",detail: "<textarea>",        kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: '<textarea rows="${1:4}" cols="${2:30}">$0</textarea>', range },
        { label: "iframe",  detail: "<iframe src>",      kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: '<iframe src="${1:url}" frameborder="0"></iframe>', range },
        { label: "video",   detail: "<video src>",       kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: '<video src="${1:url}" controls>$0</video>', range },
        { label: "audio",   detail: "<audio src>",       kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: '<audio src="${1:url}" controls></audio>', range },
      ];

      return { suggestions: snippets };
    }
  });

  // CSS snippets
  monaco.languages.registerCompletionItemProvider("css", {
    triggerCharacters: [":", "{"],
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber, endLineNumber: position.lineNumber,
        startColumn: word.startColumn, endColumn: position.column
      };
      const snippets = [
        { label: "flex",   detail: "display: flex",        kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: "display: flex;\n  align-items: ${1:center};\n  justify-content: ${2:center};", range },
        { label: "grid",   detail: "display: grid",        kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: "display: grid;\n  grid-template-columns: ${1:repeat(3, 1fr)};\n  gap: ${2:16px};", range },
        { label: "abs",    detail: "position: absolute",   kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: "position: absolute;\n  top: ${1:0};\n  left: ${2:0};", range },
        { label: "trans",  detail: "transition",           kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: "transition: ${1:all} ${2:0.3s} ${3:ease};", range },
        { label: "anim",   detail: "@keyframes animation", kind: monaco.languages.CompletionItemKind.Snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, insertText: "@keyframes ${1:name} {\n  from { ${2} }\n  to { ${3} }\n}", range },
      ];
      return { suggestions: snippets };
    }
  });
}

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
