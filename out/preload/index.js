"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("app", {
  name: "Electron Notepad"
});
electron.contextBridge.exposeInMainWorld("electronAPI", {
  minimizeWindow: () => electron.ipcRenderer.invoke("window:minimize"),
  toggleMaximizeWindow: () => electron.ipcRenderer.invoke("window:toggle-maximize"),
  closeWindow: () => electron.ipcRenderer.invoke("window:close"),
  reload: () => electron.ipcRenderer.invoke("window:reload"),
  forceReload: () => electron.ipcRenderer.invoke("window:force-reload"),
  toggleDevTools: () => electron.ipcRenderer.invoke("window:toggle-devtools"),
  toggleFullscreen: () => electron.ipcRenderer.invoke("window:toggle-fullscreen"),
  zoomReset: () => electron.ipcRenderer.invoke("window:zoom-reset"),
  zoomIn: () => electron.ipcRenderer.invoke("window:zoom-in"),
  zoomOut: () => electron.ipcRenderer.invoke("window:zoom-out"),
  openFile: () => electron.ipcRenderer.invoke("file:open"),
  saveFile: (args) => electron.ipcRenderer.invoke("file:save", args),
  saveFileAs: (args) => electron.ipcRenderer.invoke("file:save-as", args)
});
//# sourceMappingURL=index.js.map
