import type { MenuConfig } from '../../components/menubar';
import { ClearAll, ExitToApp, FileOpen, NoteAdd, Redo, Save, SaveAs, Undo } from "@mui/icons-material";
import { ContentCopy, ContentCut, ContentPasteGo, SelectAll, DeveloperBoard, Info, ZoomIn, ZoomOut, Refresh, Spellcheck, ViewHeadline } from "@mui/icons-material";


interface CreateMenuConfigParams {
  text: string;
  filePath: string | null;
  devToolsOpen: boolean;
  spellCheckEnabled: boolean;
  statusBarVisible: boolean;
  setText: (value: string) => void;
  setFilePath: (path: string | null) => void;
  setSpellCheckEnabled: (value: boolean) => void;
  setStatusBarVisible: (value: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function createMenuConfig({ text, filePath, devToolsOpen, spellCheckEnabled, statusBarVisible, setText, setFilePath, setSpellCheckEnabled, setStatusBarVisible, undo, redo, canUndo, canRedo }: CreateMenuConfigParams): MenuConfig[] {
  return [
    {
      label: 'File',
      items: [
        { kind: 'action', label: 'New', shortcut: 'Ctrl+N', icon: <NoteAdd />, action: () => { setText(''); setFilePath(null); } },
        { kind: 'action', label: 'Open...', shortcut: 'Ctrl+O', icon: <FileOpen />, action: async () => {
          const result = await window.electronAPI?.openFile?.();
          if (result && !result.canceled && result.content !== undefined) {
            setText(result.content);
            setFilePath(result.path ?? null);
          }
        } },
        { kind: 'divider' },
        { kind: 'action', label: 'Save', shortcut: 'Ctrl+S', icon: <Save />, action: async () => {
          const result = await window.electronAPI?.saveFile?.({ path: filePath ?? undefined, content: text });
          if (result && !result.canceled && result.path) {
            setFilePath(result.path);
          }
        } },
        { kind: 'action', label: 'Save As...', shortcut: 'Ctrl+Shift+S', icon: <SaveAs />, action: async () => {
          const result = await window.electronAPI?.saveFileAs?.({ content: text });
          if (result && !result.canceled && result.path) {
            setFilePath(result.path);
          }
        } },
        { kind: 'divider' },
        { kind: 'action', label: 'Clear', icon: <ClearAll />, action: () => setText('') },
        { kind: 'divider' },
        { kind: 'action', label: 'Exit', icon: <ExitToApp />, action: () => window.close() }
      ]
    },
    {
      label: 'Edit',
      items: [
        { kind: 'action', label: 'Undo', shortcut: 'Ctrl+Z', icon: <Undo />, action: undo, disabled: !canUndo },
        { kind: 'action', label: 'Redo', shortcut: 'Ctrl+Y', icon: <Redo />, action: redo, disabled: !canRedo },
        { kind: 'divider' },
        { kind: 'action', label: 'Cut', shortcut: 'Ctrl+X', icon: <ContentCut />, action: () => { try { document.execCommand?.('cut'); } catch {} } },
        { kind: 'action', label: 'Copy', shortcut: 'Ctrl+C', icon: <ContentCopy />, action: () => { try { document.execCommand?.('copy'); } catch {} } },
        { kind: 'action', label: 'Paste', shortcut: 'Ctrl+V', icon: <ContentPasteGo />, action: () => { try { document.execCommand?.('paste'); } catch {} } },
        { kind: 'divider' },
        { kind: 'action', label: 'Select All', shortcut: 'Ctrl+A', icon: <SelectAll />, action: () => { try { document.execCommand?.('selectAll'); } catch {} } }
      ]
    },
    {
      label: 'View',
      items: [
        {
          kind: "submenu",
          label: "Zoom",
          icon: <ZoomIn />,
          items: [
              { kind: 'action', label: 'Zoom In', shortcut: 'Ctrl+Plus', icon: <ZoomIn />, action: () => { window.electronAPI?.zoomIn?.(); } },
              { kind: 'action', label: 'Zoom Out', shortcut: 'Ctrl+Minus', icon: <ZoomOut />, action: () => { window.electronAPI?.zoomOut?.(); } },
              { kind: 'action', label: 'Restore Default Zoom', shortcut: 'Ctrl+0', action: () => { window.electronAPI?.zoomReset?.(); } },
          ],
        },
        { kind: 'action', label: 'Reload', shortcut: 'Ctrl+R', icon: <Refresh />, action: () => { window.electronAPI?.reload?.(); } },
        { kind: 'action', label: 'Force Reload', shortcut: 'Ctrl+Shift+R', icon: <Refresh />, action: () => { window.electronAPI?.forceReload?.(); } },
        { kind: 'action', label: 'Developer Tools', shortcut: 'Ctrl+Shift+I', icon: <DeveloperBoard />, action: () => { window.electronAPI?.toggleDevTools?.(); }, ...(devToolsOpen ? { selected: true } : {}) },
        { kind: 'divider' },
        { kind: 'action', label: 'Status Bar', icon: <ViewHeadline />, action: () => setStatusBarVisible(!statusBarVisible), ...(statusBarVisible ? { selected: true } : {}) },
        { kind: 'action', label: 'Spellcheck', icon: <Spellcheck />, action: () => { const next = !spellCheckEnabled; setSpellCheckEnabled(next); if (!next) { window.electronAPI?.reload?.(); } }, ...(spellCheckEnabled ? { selected: true } : {}) },
      ]
    },
    {
      label: 'Help',
      items: [
        { kind: 'action', label: 'About', icon: <Info />, action: () => alert('Electron Notepad') }
      ]
    }
  ];
}


