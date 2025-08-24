import { contextBridge, ipcRenderer, clipboard } from 'electron';

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
  isDevToolsOpen: () => ipcRenderer.invoke('window:is-devtools-open') as Promise<boolean>,
  onDevToolsStateChanged: (callback: (open: boolean) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, open: boolean) => callback(open);
    ipcRenderer.on('devtools-state-changed', listener);
    return () => ipcRenderer.removeListener('devtools-state-changed', listener);
  },
  toggleFullscreen: () => ipcRenderer.invoke('window:toggle-fullscreen'),
  zoomReset: () => ipcRenderer.invoke('window:zoom-reset'),
  zoomIn: () => ipcRenderer.invoke('window:zoom-in'),
  zoomOut: () => ipcRenderer.invoke('window:zoom-out'),
  getZoomLevel: () => ipcRenderer.invoke('window:get-zoom-level') as Promise<number>,
  onZoomChanged: (callback: (zoomFactor: number) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, zoomFactor: number) => callback(zoomFactor);
    ipcRenderer.on('zoom-changed', listener);
    return () => ipcRenderer.removeListener('zoom-changed', listener);
  },
  openFile: () => ipcRenderer.invoke('file:open'),
  saveFile: (args: { path?: string; content: string }) => ipcRenderer.invoke('file:save', args),
  saveFileAs: (args: { content: string }) => ipcRenderer.invoke('file:save-as', args)
  ,
  readClipboardText: () => Promise.resolve(clipboard.readText()),
  writeClipboardText: (text: string) => Promise.resolve(clipboard.writeText(text))
});

export {};


