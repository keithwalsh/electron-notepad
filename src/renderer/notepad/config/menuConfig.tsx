import type { MenuConfig } from '../../../menubar';
import { NoteAdd } from "@mui/icons-material";


interface CreateMenuConfigParams {
  text: string;
  filePath: string | null;
  setText: (value: string) => void;
  setFilePath: (path: string | null) => void;
}

export function createMenuConfig({ text, filePath, setText, setFilePath }: CreateMenuConfigParams): MenuConfig[] {
  return [
    {
      label: 'File',
      items: [
        { kind: 'action', label: 'New', shortcut: 'Ctrl+N', icon: <NoteAdd />, action: () => { setText(''); setFilePath(null); } },
        { kind: 'action', label: 'Open...', shortcut: 'Ctrl+O', action: async () => {
          const result = await window.electronAPI?.openFile?.();
          if (result && !result.canceled && result.content !== undefined) {
            setText(result.content);
            setFilePath(result.path ?? null);
          }
        } },
        { kind: 'divider' },
        { kind: 'action', label: 'Save', shortcut: 'ctrl+s', action: async () => {
          const result = await window.electronAPI?.saveFile?.({ path: filePath ?? undefined, content: text });
          if (result && !result.canceled && result.path) {
            setFilePath(result.path);
          }
        } },
        { kind: 'action', label: 'Save As...', shortcut: 'ctrl+shift+s', action: async () => {
          const result = await window.electronAPI?.saveFileAs?.({ content: text });
          if (result && !result.canceled && result.path) {
            setFilePath(result.path);
          }
        } },
        { kind: 'divider' },
        { kind: 'action', label: 'Clear', action: () => setText('') },
        { kind: 'divider' },
        { kind: 'action', label: 'Exit', action: () => window.close() }
      ]
    },
    {
      label: 'Edit',
      items: [
        { kind: 'action', label: 'Undo', shortcut: 'ctrl+z', action: () => { try { document.execCommand?.('undo'); } catch {} } },
        { kind: 'action', label: 'Redo', shortcut: 'ctrl+y', action: () => { try { document.execCommand?.('redo'); } catch {} } },
        { kind: 'divider' },
        { kind: 'action', label: 'Cut', action: () => { try { document.execCommand?.('cut'); } catch {} } },
        { kind: 'action', label: 'Copy', action: () => { try { document.execCommand?.('copy'); } catch {} } },
        { kind: 'action', label: 'Paste', action: () => { try { document.execCommand?.('paste'); } catch {} } },
        { kind: 'divider' },
        { kind: 'action', label: 'Select All', shortcut: 'ctrl+a', action: () => { try { document.execCommand?.('selectAll'); } catch {} } }
      ]
    },
    {
      label: 'View',
      items: [
        { kind: 'action', label: 'Reload', shortcut: 'ctrl+r', action: () => { window.electronAPI?.reload?.(); } },
        { kind: 'action', label: 'Force Reload', shortcut: 'ctrl+shift+r', action: () => { window.electronAPI?.forceReload?.(); } },
        { kind: 'action', label: 'Toggle Developer Tools', shortcut: 'ctrl+shift+i', action: () => { window.electronAPI?.toggleDevTools?.(); } },
        { kind: 'divider' },
        { kind: 'action', label: 'Actual Size', shortcut: 'ctrl+0', action: () => { window.electronAPI?.zoomReset?.(); } },
        { kind: 'action', label: 'Zoom In', shortcut: 'ctrl+=', action: () => { window.electronAPI?.zoomIn?.(); } },
        { kind: 'action', label: 'Zoom Out', shortcut: 'ctrl+-', action: () => { window.electronAPI?.zoomOut?.(); } },
        { kind: 'divider' },
        { kind: 'action', label: 'Toggle Full Screen', shortcut: 'F11', action: () => { window.electronAPI?.toggleFullscreen?.(); } },
      ]
    },
    {
      label: 'Window',
      items: [
        { kind: 'action', label: 'Minimize', action: () => window.electronAPI?.minimizeWindow?.() },
        { kind: 'action', label: 'Zoom', action: () => window.electronAPI?.toggleMaximizeWindow?.() },
        { kind: 'divider' },
        { kind: 'action', label: 'Close', shortcut: 'alt+f4', action: () => window.electronAPI?.closeWindow?.() },
      ]
    },
    {
      label: 'Help',
      items: [
        { kind: 'action', label: 'About', action: () => alert('Electron Notepad') }
      ]
    }
  ];
}


