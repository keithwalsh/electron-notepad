import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('app', {
  name: 'Electron Notepad'
});

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  toggleMaximizeWindow: () => ipcRenderer.invoke('window:toggle-maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  reload: () => ipcRenderer.invoke('window:reload'),
  forceReload: () => ipcRenderer.invoke('window:force-reload'),
  toggleDevTools: () => ipcRenderer.invoke('window:toggle-devtools'),
  toggleFullscreen: () => ipcRenderer.invoke('window:toggle-fullscreen'),
  zoomReset: () => ipcRenderer.invoke('window:zoom-reset'),
  zoomIn: () => ipcRenderer.invoke('window:zoom-in'),
  zoomOut: () => ipcRenderer.invoke('window:zoom-out'),
  openFile: () => ipcRenderer.invoke('file:open'),
  saveFile: (args: { path?: string; content: string }) => ipcRenderer.invoke('file:save', args),
  saveFileAs: (args: { content: string }) => ipcRenderer.invoke('file:save-as', args)
});

export {};


