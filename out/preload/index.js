"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("app", {
  name: "Electron Notepad"
});
electron.contextBridge.exposeInMainWorld("electronAPI", {
  minimizeWindow: () => electron.ipcRenderer.invoke("window:minimize"),
  toggleMaximizeWindow: () => electron.ipcRenderer.invoke("window:toggle-maximize"),
  closeWindow: () => electron.ipcRenderer.invoke("window:close")
});
//# sourceMappingURL=index.js.map
