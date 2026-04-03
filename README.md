# WebLab IDE

A lightweight, browser-based code editor built with Monaco Editor — the same engine that powers VS Code.

![WebLab IDE](https://img.shields.io/badge/WebLab-IDE-7c6af7?style=for-the-badge)
![HTML](https://img.shields.io/badge/HTML-e34c26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-264de4?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776ab?style=for-the-badge&logo=python&logoColor=white)

---

## Features

- **Monaco Editor** — VS Code-level editing experience in the browser
- **Emmet support** — type `!` and press Enter for a full HTML5 boilerplate, plus all standard Emmet abbreviations
- **Auto-closing tags** — open tags close automatically as you type
- **IntelliSense** — HTML5, CSS, and JavaScript suggestions with tab stops
- **HTML/CSS/JS tabs** — separate editors for each file, combined live in the preview
- **Live preview** — instant iframe preview of your HTML/CSS/JS output
- **Auto-run toggle** — preview updates as you type
- **Python execution** — send Python code to the backend and see output in the terminal
- **Resizable panels** — drag to resize the sidebar, editor, preview, and terminal
- **Export files** — download `index.html`, `style.css`, or `script.js` individually
- **Export as ZIP** — bundle all three files into `weblab-project.zip`
- **Dark theme** — VS Code-inspired dark UI with gradient accents

---

## Layout

```
┌─────────────────────────────────────────────────────┐
│                     Title Bar                        │
├──────────┬──────────────────────┬───────────────────┤
│          │  Tabs                │                   │
│ Sidebar  │  ┌────────────────┐  │    Preview        │
│          │  │  Monaco Editor │  │    (iframe)       │
│ Language │  │                │  │                   │
│ Actions  │  │                │  │                   │
│ Export   │  └────────────────┘  │                   │
├──────────┴──────────────────────┴───────────────────┤
│                     Terminal                         │
├─────────────────────────────────────────────────────┤
│                     Footer                           │
└─────────────────────────────────────────────────────┘
```

All panel borders are **draggable** — resize the sidebar, editor/preview split, and terminal height.

---

## Getting Started

No build step required. Just open `index.html` in a browser.

```bash
git clone https://github.com/anointedthedeveloper/WebLab-IDE.git
cd WebLab-IDE
# Open index.html in your browser
```

Or serve it locally:

```bash
npx serve .
# or
python -m http.server 8080
```

---

## Backend

Python execution is powered by a Flask backend hosted on Render.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/languages` | GET | Returns supported languages |
| `/run` | POST | Executes code and returns output |

**Run Python:**
```json
POST /run
{ "language": "python", "code": "print('hello')" }
```

**Run HTML/CSS/JS:**
```json
POST /run
{ "language": "html", "code": "<h1>Hi</h1>", "css": "h1{color:red}", "js": "console.log('hi')" }
```

Backend URL: `https://weblab-ide-api.onrender.com`

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Accept suggestion / expand snippet |
| `Ctrl+Space` | Trigger suggestions manually |
| `Ctrl+/` | Toggle comment |
| `Ctrl+Z` | Undo |
| `Shift+Alt+F` | Format document |
| `!` + `Enter` | HTML5 boilerplate (Emmet) |

---

## Project Structure

```
WebLab-IDE/
├── index.html      # App shell, layout, SVG icons
├── styles.css      # Dark theme, resizable panel styles
└── app.js          # Monaco setup, Emmet, resize logic, export
```

---

## Deployment

| Part | Platform |
|------|----------|
| Frontend | [Vercel](https://vercel.com) / GitHub Pages |
| Backend | [Render](https://render.com) |

To deploy the frontend on Vercel, connect the GitHub repo and set the root directory to `/`. No build command needed.

---

## Roadmap

- [ ] More languages (JavaScript Node, C++, Java)
- [ ] File tree / multi-file projects
- [ ] Theme switcher (light / dark / high contrast)
- [ ] Shareable project links
- [ ] Console output capture from preview iframe

---

## Developed by

**[anointedthedeveloper](https://github.com/anointedthedeveloper)**
