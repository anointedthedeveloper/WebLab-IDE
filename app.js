const BACKEND = "https://weblab-ide-api.onrender.com";

const tabContent = {
  html: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello from WebLab IDE</h1>\n  <p>Start editing to see magic!</p>\n</body>\n</html>`,
  css:  `body {\n  font-family: Arial, sans-serif;\n  background: #f0f4ff;\n  display: flex;\n  justify-content: center;\n  padding: 40px;\n}\n\nh1 { color: #7c6af7; }\np  { color: #555; }`,
  js:   `// JavaScript runs in the preview\nconsole.log('Hello from WebLab IDE');\n\ndocument.addEventListener('DOMContentLoaded', () => {\n  console.log('DOM ready');\n});`
};

let editor;
let currentLanguage = "html";
let activeTab = "html";
let ignoreChange = false;

// ── Monaco setup ──────────────────────────────────────────────
require.config({ paths: { vs: "https://unpkg.com/monaco-editor@0.44.0/min/vs" } });

require(["vs/editor/editor.main"], function () {

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
    autoClosingBrackets: "always",
    autoClosingQuotes: "always",
    autoClosingTags: true,
    autoIndent: "full",
    quickSuggestions: { other: true, comments: false, strings: true },
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: "on",
    snippetSuggestions: "top",
    formatOnType: true,
    formatOnPaste: true,
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

  // Emmet
  (function tryEmmet() {
    if (window.__emmetMonaco) {
      window.__emmetMonaco.emmetHTML(monaco, ["html"]);
      window.__emmetMonaco.emmetCSS(monaco, ["css"]);
    } else {
      setTimeout(tryEmmet, 100);
    }
  })();

  registerSnippets();
  updatePreview();
});

// ── Snippets ──────────────────────────────────────────────────
function registerSnippets() {
  const S = monaco.languages.CompletionItemKind.Snippet;
  const R = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;

  function mkRange(model, position) {
    const w = model.getWordUntilPosition(position);
    return { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: w.startColumn, endColumn: position.column };
  }

  monaco.languages.registerCompletionItemProvider("html", {
    triggerCharacters: ["!", ".", "#", ">", "+", "*"],
    provideCompletionItems(model, position) {
      const range = mkRange(model, position);
      return { suggestions: [
        { label: "!", detail: "HTML5 Boilerplate", kind: S, insertTextRules: R, range,
          insertText: `<!DOCTYPE html>\n<html lang="\${1:en}">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>\${2:Document}</title>\n</head>\n<body>\n  \$0\n</body>\n</html>` },
        { label: "a",        detail: "<a href>",           kind: S, insertTextRules: R, range, insertText: '<a href="${1:#}">${2:link}</a>' },
        { label: "div",      detail: "<div>",              kind: S, insertTextRules: R, range, insertText: "<div>\n  $0\n</div>" },
        { label: "p",        detail: "<p>",                kind: S, insertTextRules: R, range, insertText: "<p>$0</p>" },
        { label: "h1",       detail: "<h1>",               kind: S, insertTextRules: R, range, insertText: "<h1>$0</h1>" },
        { label: "h2",       detail: "<h2>",               kind: S, insertTextRules: R, range, insertText: "<h2>$0</h2>" },
        { label: "h3",       detail: "<h3>",               kind: S, insertTextRules: R, range, insertText: "<h3>$0</h3>" },
        { label: "ul",       detail: "<ul><li>",           kind: S, insertTextRules: R, range, insertText: "<ul>\n  <li>$0</li>\n</ul>" },
        { label: "ol",       detail: "<ol><li>",           kind: S, insertTextRules: R, range, insertText: "<ol>\n  <li>$0</li>\n</ol>" },
        { label: "li",       detail: "<li>",               kind: S, insertTextRules: R, range, insertText: "<li>$0</li>" },
        { label: "img",      detail: "<img src alt>",      kind: S, insertTextRules: R, range, insertText: '<img src="${1:url}" alt="${2:description}">' },
        { label: "input",    detail: "<input type>",       kind: S, insertTextRules: R, range, insertText: '<input type="${1:text}" placeholder="${2}">' },
        { label: "button",   detail: "<button>",           kind: S, insertTextRules: R, range, insertText: "<button>$0</button>" },
        { label: "form",     detail: "<form>",             kind: S, insertTextRules: R, range, insertText: '<form action="${1:#}" method="${2:post}">\n  $0\n</form>' },
        { label: "table",    detail: "<table>",            kind: S, insertTextRules: R, range, insertText: "<table>\n  <tr>\n    <th>$1</th>\n  </tr>\n  <tr>\n    <td>$0</td>\n  </tr>\n</table>" },
        { label: "nav",      detail: "<nav>",              kind: S, insertTextRules: R, range, insertText: "<nav>\n  $0\n</nav>" },
        { label: "section",  detail: "<section>",          kind: S, insertTextRules: R, range, insertText: "<section>\n  $0\n</section>" },
        { label: "header",   detail: "<header>",           kind: S, insertTextRules: R, range, insertText: "<header>\n  $0\n</header>" },
        { label: "footer",   detail: "<footer>",           kind: S, insertTextRules: R, range, insertText: "<footer>\n  $0\n</footer>" },
        { label: "main",     detail: "<main>",             kind: S, insertTextRules: R, range, insertText: "<main>\n  $0\n</main>" },
        { label: "span",     detail: "<span>",             kind: S, insertTextRules: R, range, insertText: "<span>$0</span>" },
        { label: "link",     detail: "<link stylesheet>",  kind: S, insertTextRules: R, range, insertText: '<link rel="stylesheet" href="${1:style.css}">' },
        { label: "script",   detail: "<script src>",       kind: S, insertTextRules: R, range, insertText: '<script src="${1:app.js}"><\\/script>' },
        { label: "meta",     detail: "<meta>",             kind: S, insertTextRules: R, range, insertText: '<meta name="${1:description}" content="${2}">' },
        { label: "label",    detail: "<label for>",        kind: S, insertTextRules: R, range, insertText: '<label for="${1}">${2}</label>' },
        { label: "select",   detail: "<select><option>",   kind: S, insertTextRules: R, range, insertText: '<select>\n  <option value="${1}">$0</option>\n</select>' },
        { label: "textarea", detail: "<textarea>",         kind: S, insertTextRules: R, range, insertText: '<textarea rows="${1:4}" cols="${2:30}">$0</textarea>' },
        { label: "iframe",   detail: "<iframe src>",       kind: S, insertTextRules: R, range, insertText: '<iframe src="${1:url}" frameborder="0"></iframe>' },
        { label: "video",    detail: "<video src>",        kind: S, insertTextRules: R, range, insertText: '<video src="${1:url}" controls>$0</video>' },
        { label: "audio",    detail: "<audio src>",        kind: S, insertTextRules: R, range, insertText: '<audio src="${1:url}" controls></audio>' },
      ]};
    }
  });

  monaco.languages.registerCompletionItemProvider("css", {
    triggerCharacters: [":", "{"],
    provideCompletionItems(model, position) {
      const range = mkRange(model, position);
      return { suggestions: [
        { label: "flex",  detail: "display: flex",        kind: S, insertTextRules: R, range, insertText: "display: flex;\n  align-items: ${1:center};\n  justify-content: ${2:center};" },
        { label: "grid",  detail: "display: grid",        kind: S, insertTextRules: R, range, insertText: "display: grid;\n  grid-template-columns: ${1:repeat(3, 1fr)};\n  gap: ${2:16px};" },
        { label: "abs",   detail: "position: absolute",   kind: S, insertTextRules: R, range, insertText: "position: absolute;\n  top: ${1:0};\n  left: ${2:0};" },
        { label: "trans", detail: "transition",           kind: S, insertTextRules: R, range, insertText: "transition: ${1:all} ${2:0.3s} ${3:ease};" },
        { label: "anim",  detail: "@keyframes",           kind: S, insertTextRules: R, range, insertText: "@keyframes ${1:name} {\n  from { ${2} }\n  to { ${3} }\n}" },
      ]};
    }
  });
}

// ── Resize logic ──────────────────────────────────────────────
function initResize() {
  // Sidebar horizontal resize
  makeDragH(
    document.getElementById("resize-sidebar"),
    () => document.getElementById("sidebar").offsetWidth,
    (w) => { document.getElementById("sidebar").style.width = w + "px"; }
  );

  // Editor/Preview horizontal resize
  makeDragH(
    document.getElementById("resize-editor"),
    () => document.getElementById("editor-area").offsetWidth,
    (w) => {
      const mainW = document.getElementById("main-area").offsetWidth;
      const pct = (w / mainW) * 100;
      document.getElementById("editor-area").style.width = pct + "%";
    }
  );

  // Terminal vertical resize
  makeDragV(
    document.getElementById("resize-terminal"),
    () => document.getElementById("terminal-wrap").offsetHeight,
    (h) => { document.getElementById("terminal-wrap").style.height = h + "px"; }
  );
}

function makeDragH(handle, getSize, setSize) {
  handle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startSize = getSize();
    handle.classList.add("dragging");

    function onMove(e) { setSize(Math.max(80, startSize + (e.clientX - startX))); }
    function onUp()    { handle.classList.remove("dragging"); document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });
}

function makeDragV(handle, getSize, setSize) {
  handle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startSize = getSize();
    handle.classList.add("dragging");

    function onMove(e) { setSize(Math.max(40, startSize - (e.clientY - startY))); }
    function onUp()    { handle.classList.remove("dragging"); document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });
}

// ── Tab / Language switching ──────────────────────────────────
function switchTab(tab) {
  if (currentLanguage !== "html") return;
  tabContent[activeTab] = editor.getValue();
  activeTab = tab;

  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === tab));

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
    editor.setValue("# Python\nprint('Hello from WebLab IDE')\n\nfor i in range(5):\n    print(f'Line {i + 1}')");
    ignoreChange = false;
    document.getElementById("filename-display").textContent = "main.py";
    document.getElementById("preview").srcdoc = `<html><body style="background:#0f0f13;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><p style="color:#6e7681;font-family:monospace;font-size:13px">Run Python to see output in terminal</p></body></html>`;
  }
}

// ── Preview ───────────────────────────────────────────────────
function updatePreview() {
  if (currentLanguage === "html") tabContent[activeTab] = editor.getValue();
  const combined = `<!DOCTYPE html><html><head><style>${tabContent.css}</style></head><body>${tabContent.html}<script>${tabContent.js}<\/script></body></html>`;
  document.getElementById("preview").srcdoc = combined;
}

// ── Run ───────────────────────────────────────────────────────
async function runCode() {
  if (currentLanguage === "html") {
    updatePreview();
    log("Preview updated.", "info");
    return;
  }

  const code = editor.getValue();
  log("Running Python...", "info");

  try {
    const res = await fetch(`${BACKEND}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: "python", code })
    });
    const data = await res.json();
    data.error ? log(data.error, "error") : log(data.output || "(no output)");
  } catch (err) {
    log("Failed to reach backend: " + err.message, "error");
  }
}

// ── Export ────────────────────────────────────────────────────
function exportFile(type) {
  if (currentLanguage === "html") tabContent[activeTab] = editor.getValue();

  const map = {
    html: { name: "index.html", mime: "text/html",       content: tabContent.html },
    css:  { name: "style.css",  mime: "text/css",        content: tabContent.css  },
    js:   { name: "script.js",  mime: "text/javascript", content: tabContent.js   },
  };

  const { name, mime, content } = map[type];
  const blob = new Blob([content], { type: mime });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: name });
  a.click();
  URL.revokeObjectURL(a.href);
  log(`Exported ${name}`, "info");
}

async function exportAll() {
  if (currentLanguage === "html") tabContent[activeTab] = editor.getValue();

  if (typeof JSZip === "undefined") {
    log("JSZip not loaded yet, try again.", "error");
    return;
  }

  const zip = new JSZip();
  zip.file("index.html", tabContent.html);
  zip.file("style.css",  tabContent.css);
  zip.file("script.js",  tabContent.js);

  const blob = await zip.generateAsync({ type: "blob" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "weblab-project.zip" });
  a.click();
  URL.revokeObjectURL(a.href);
  log("Exported weblab-project.zip", "info");
}

// ── Terminal ──────────────────────────────────────────────────
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

// ── Init ──────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", initResize);
