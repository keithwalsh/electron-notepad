export interface IElectronAPI {
  minimizeWindow: () => Promise<void>;
  toggleMaximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  reload: () => Promise<void>;
  forceReload: () => Promise<void>;
  toggleDevTools: () => Promise<void>;
  isDevToolsOpen: () => Promise<boolean>;
  onDevToolsStateChanged: (callback: (open: boolean) => void) => () => void;
  toggleFullscreen: () => Promise<void>;
  zoomReset: () => Promise<void>;
  zoomIn: () => Promise<void>;
  zoomOut: () => Promise<void>;
  getZoomLevel: () => Promise<number>;
  onZoomChanged: (callback: (zoomFactor: number) => void) => () => void;
  openFile: () => Promise<{ canceled: boolean; path?: string; content?: string }>;
  saveFile: (args: { path?: string; content: string }) => Promise<{ canceled: boolean; path?: string }>;
  saveFileAs: (args: { content: string }) => Promise<{ canceled: boolean; path?: string }>;
  readClipboardText: () => Promise<string>;
  writeClipboardText: (text: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI?: IElectronAPI;
    app: {
      name: string;
    };
  }
}
