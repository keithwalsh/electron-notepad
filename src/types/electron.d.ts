export interface IElectronAPI {
  minimizeWindow: () => Promise<void>;
  toggleMaximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  reload: () => Promise<void>;
  forceReload: () => Promise<void>;
  toggleDevTools: () => Promise<void>;
  toggleFullscreen: () => Promise<void>;
  zoomReset: () => Promise<void>;
  zoomIn: () => Promise<void>;
  zoomOut: () => Promise<void>;
  openFile: () => Promise<{ canceled: boolean; path?: string; content?: string }>;
  saveFile: (args: { path?: string; content: string }) => Promise<{ canceled: boolean; path?: string }>;
  saveFileAs: (args: { content: string }) => Promise<{ canceled: boolean; path?: string }>;
}

declare global {
  interface Window {
    electronAPI?: IElectronAPI;
    app: {
      name: string;
    };
  }
}
