import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

let mainWindow: BrowserWindow | null = null;

async function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    frame: false, // Remove default frame for custom window controls
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Notify renderer when DevTools open/close state changes
  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow?.webContents.send('devtools-state-changed', true);
  });
  mainWindow.webContents.on('devtools-closed', () => {
    mainWindow?.webContents.send('devtools-state-changed', false);
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    await mainWindow.loadFile(join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
}

app.whenReady().then(async () => {
  await createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers for window controls
ipcMain.handle('window:minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('window:toggle-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window:close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

// View / Dev tools / Zoom / Fullscreen helpers
ipcMain.handle('window:reload', () => {
  if (mainWindow) {
    mainWindow.reload();
  }
});

ipcMain.handle('window:toggle-devtools', () => {
  if (mainWindow) {
    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools();
    } else {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  }
});

ipcMain.handle('window:is-devtools-open', () => {
  if (mainWindow) {
    return mainWindow.webContents.isDevToolsOpened();
  }
  return false;
});

ipcMain.handle('window:force-reload', () => {
  if (mainWindow) {
    mainWindow.webContents.reloadIgnoringCache();
  }
});

ipcMain.handle('window:toggle-fullscreen', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  }
});

ipcMain.handle('window:zoom-reset', () => {
  if (mainWindow) {
    mainWindow.webContents.setZoomFactor(1);
  }
});

ipcMain.handle('window:zoom-in', () => {
  if (mainWindow) {
    const current = mainWindow.webContents.getZoomFactor();
    const next = Math.min(3, Math.round((current + 0.1) * 10) / 10);
    mainWindow.webContents.setZoomFactor(next);
  }
});

ipcMain.handle('window:zoom-out', () => {
  if (mainWindow) {
    const current = mainWindow.webContents.getZoomFactor();
    const next = Math.max(0.3, Math.round((current - 0.1) * 10) / 10);
    mainWindow.webContents.setZoomFactor(next);
  }
});

// File open/save handlers
ipcMain.handle('file:open', async () => {
  if (!mainWindow) return { canceled: true };
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt', 'md', 'log'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }
  const path = result.filePaths[0];
  const content = await readFile(path, 'utf8');
  return { canceled: false, path, content };
});

ipcMain.handle('file:save', async (_event, args: { path?: string; content: string }) => {
  if (!mainWindow) return { canceled: true };
  const { path: existingPath, content } = args ?? {};
  let targetPath = existingPath;
  if (!targetPath) {
    const result = await dialog.showSaveDialog(mainWindow, {
      filters: [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    if (result.canceled || !result.filePath) {
      return { canceled: true };
    }
    targetPath = result.filePath;
  }
  await writeFile(targetPath, content, 'utf8');
  return { canceled: false, path: targetPath };
});

ipcMain.handle('file:save-as', async (_event, args: { content: string }) => {
  if (!mainWindow) return { canceled: true };
  const { content } = args ?? {};
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  if (result.canceled || !result.filePath) {
    return { canceled: true };
  }
  await writeFile(result.filePath, content, 'utf8');
  return { canceled: false, path: result.filePath };
});


