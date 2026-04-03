const BACKEND = "https://weblab-ide-api.onrender.com";

// Stores content for each tab
const tabContent = {
  html: "<h1>Hello from WebLab IDE</h1>\n<p>Edit me!</p>",
  css:  "h1 { color: #0e639c; }\np { font-family: Arial; }",
  js:   "console.log('Hello from WebLab IDE');"
};

let editor;
let currentLanguage = "html";
let activeTab = "html";
let ignoreChange = false;

require.config({ paths: { vs: "https://unpkg.com/monaco-editor@0.44.0/min/vs" } });

require(["vs/editor/editor.main"], function () {
  editor = monaco.editor.create(document.getElementById("editor"), {
    value: tabContent.html,
    language: "html",
    theme: "vs-dark",
    fontSize: 14,
    minimap: { enabled: false },
    automaticLayout: true
  });

  editor.onDidChangeModelContent(() => {
    if (ignoreChange) return;
    if (currentLanguage === "html") {
      tabContent[activeTab] = editor.getValue();
      if (document.getElementById("autoRun").checked) updatePreview();
    }
  });
});

function switchTab(tab) {
  if (currentLanguage !== "html") return;

  // Save current tab content
  tabContent[activeTab] = editor.getValue();
  activeTab = tab;

  // Update tab UI
  document.querySelectorAll(".tab").forEach(t =>
    t.classList.toggle("active", t.dataset.tab === tab)
  );

  // Switch editor language & content
  const langMap = { html: "html", css: "css", js: "javascript" };
  ignoreChange = true;
  monaco.editor.setModelLanguage(editor.getModel(), langMap[tab]);
  editor.setValue(tabContent[tab]);
  ignoreChange = false;
}

function setLanguage(lang) {
  currentLanguage = lang;

  // Update sidebar button states
  document.querySelectorAll(".sidebar button[id^='btn-']").forEach(b => b.classList.remove("active"));
  document.getElementById("btn-" + lang).classList.add("active");

  // Show/hide tabs
  document.getElementById("tabs").classList.toggle("hidden", lang !== "html");

  if (lang === "html") {
    activeTab = "html";
    ignoreChange = true;
    monaco.editor.setModelLanguage(editor.getModel(), "html");
    editor.setValue(tabContent.html);
    ignoreChange = false;
    updatePreview();
  } else {
    ignoreChange = true;
    monaco.editor.setModelLanguage(editor.getModel(), "python");
    editor.setValue("print('Hello from Python')");
    ignoreChange = false;
    document.getElementById("preview").srcdoc = "";
  }
}

function updatePreview() {
  // Save current tab before combining
  if (currentLanguage === "html") tabContent[activeTab] = editor.getValue();

  const combined = `<!DOCTYPE html><html><head><style>${tabContent.css}</style></head><body>${tabContent.html}<script>${tabContent.js}<\/script></body></html>`;
  document.getElementById("preview").srcdoc = combined;
}

async function runCode() {
  if (currentLanguage === "html") {
    updatePreview();
    log("Preview updated.");
    return;
  }

  const code = editor.getValue();
  log("Running...");

  try {
    const res = await fetch(`${BACKEND}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: "python", code })
    });

    const data = await res.json();

    if (data.error) {
      log(data.error, true);
    } else {
      log(data.output || "(no output)");
    }
  } catch (err) {
    log("Failed to reach backend: " + err.message, true);
  }
}

function log(msg, isError = false) {
  const terminal = document.getElementById("terminal");
  const line = document.createElement("div");
  line.textContent = msg;
  if (isError) line.classList.add("error");
  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}
