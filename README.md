## Electron Notepad

A lightweight, Notepad-style desktop app built with Electron, Vite, React, and MUI. It features a custom React menubar, basic text editing, native file open/save, zoom controls, theme toggle, and a status bar.

### Features
- **Notepad UI**: Plain text editor with optional spellcheck and a minimal chrome.
- **File operations**: New, Open, Save, Save As via native dialogs.
- **Zoom & view**: Zoom in/out/reset, reload/force-reload, toggle DevTools, fullscreen.
- **Custom window controls**: Frameless window with programmatic minimize/maximize/close.
- **Theme**: Light/Dark toggle persisted in local storage.
- **Status bar**: Displays file path, character count, and line count.

### Tech stack
- **Electron Forge 7** with **Vite** plugin
- **Electron 30**, **Vite 5**, **React 18**, **MUI 7**, **TypeScript 5**, **Emotion**
- Secure preload: `contextIsolation: true`, `nodeIntegration: false`