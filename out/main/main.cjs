"use strict";
const electron = require("electron");
const promises = require("fs/promises");
const path = require("path");
const url = require("url");
var _documentCurrentScript = typeof document !== "undefined" ? document.currentScript : null;
const __filename$1 = url.fileURLToPath(typeof document === "undefined" ? require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === "SCRIPT" && _documentCurrentScript.src || new URL("main.cjs", document.baseURI).href);
const __dirname$1 = path.dirname(__filename$1);
let mainWindow = null;
async function createMainWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 900,
    height: 700,
    frame: false,
    // Remove default frame for custom window controls
    webPreferences: {
      preload: path.join(__dirname$1, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.webContents.setWindowOpenHandler(({ url: url2 }) => {
    electron.shell.openExternal(url2);
    return { action: "deny" };
  });
  {
    await mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  }
}
electron.app.whenReady().then(async () => {
  await createMainWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      void createMainWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") electron.app.quit();
});
electron.ipcMain.handle("window:minimize", () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});
electron.ipcMain.handle("window:toggle-maximize", () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});
electron.ipcMain.handle("window:close", () => {
  if (mainWindow) {
    mainWindow.close();
  }
});
electron.ipcMain.handle("window:reload", () => {
  if (mainWindow) {
    mainWindow.reload();
  }
});
electron.ipcMain.handle("window:toggle-devtools", () => {
  if (mainWindow) {
    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools();
    } else {
      mainWindow.webContents.openDevTools({ mode: "detach" });
    }
  }
});
electron.ipcMain.handle("window:force-reload", () => {
  if (mainWindow) {
    mainWindow.webContents.reloadIgnoringCache();
  }
});
electron.ipcMain.handle("window:toggle-fullscreen", () => {
  if (mainWindow) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  }
});
electron.ipcMain.handle("window:zoom-reset", () => {
  if (mainWindow) {
    mainWindow.webContents.setZoomFactor(1);
  }
});
electron.ipcMain.handle("window:zoom-in", () => {
  if (mainWindow) {
    const current = mainWindow.webContents.getZoomFactor();
    const next = Math.min(3, Math.round((current + 0.1) * 10) / 10);
    mainWindow.webContents.setZoomFactor(next);
  }
});
electron.ipcMain.handle("window:zoom-out", () => {
  if (mainWindow) {
    const current = mainWindow.webContents.getZoomFactor();
    const next = Math.max(0.3, Math.round((current - 0.1) * 10) / 10);
    mainWindow.webContents.setZoomFactor(next);
  }
});
electron.ipcMain.handle("file:open", async () => {
  if (!mainWindow) return { canceled: true };
  const result = await electron.dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [
      { name: "Text Files", extensions: ["txt", "md", "log"] },
      { name: "All Files", extensions: ["*"] }
    ]
  });
  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }
  const path2 = result.filePaths[0];
  const content = await promises.readFile(path2, "utf8");
  return { canceled: false, path: path2, content };
});
electron.ipcMain.handle("file:save", async (_event, args) => {
  if (!mainWindow) return { canceled: true };
  const { path: existingPath, content } = args ?? {};
  let targetPath = existingPath;
  if (!targetPath) {
    const result = await electron.dialog.showSaveDialog(mainWindow, {
      filters: [
        { name: "Text Files", extensions: ["txt"] },
        { name: "All Files", extensions: ["*"] }
      ]
    });
    if (result.canceled || !result.filePath) {
      return { canceled: true };
    }
    targetPath = result.filePath;
  }
  await promises.writeFile(targetPath, content, "utf8");
  return { canceled: false, path: targetPath };
});
electron.ipcMain.handle("file:save-as", async (_event, args) => {
  if (!mainWindow) return { canceled: true };
  const { content } = args ?? {};
  const result = await electron.dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: "Text Files", extensions: ["txt"] },
      { name: "All Files", extensions: ["*"] }
    ]
  });
  if (result.canceled || !result.filePath) {
    return { canceled: true };
  }
  await promises.writeFile(result.filePath, content, "utf8");
  return { canceled: false, path: result.filePath };
});
//# sourceMappingURL=main.cjs.map
