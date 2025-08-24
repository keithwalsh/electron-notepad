import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CodeEditor, CodeEditorHandle } from '../components/CodeEditor';
import { AppBar } from '../components/AppBar';
import { StatusBar } from '../components/StatusBar';
import { createMenuConfig } from './config/menuConfig';
import { ContextMenu } from '../components/ContextMenu';

interface HistoryEntry {
  text: string;
  selectionStart: number;
  selectionEnd: number;
}

export function App(): JSX.Element {
  const [text, setText] = useState('');
  const [filePath, setFilePath] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<HistoryEntry[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryEntry[]>([]);
  const editorRef = useRef<CodeEditorHandle | null>(null);
  const [mode, setMode] = useState<'light' | 'dark'>(() => (localStorage.getItem('notepad:theme') as 'light' | 'dark') || 'light');
  const [devToolsOpen, setDevToolsOpen] = useState<boolean>(false);
  const [spellCheckEnabled, setSpellCheckEnabled] = useState<boolean>(false);
  const [pasteReplaceRules, setPasteReplaceRules] = useState<{ find: string; replace: string; }[]>(() => {
    try {
      const saved = localStorage.getItem('notepad:pasteReplaceRules');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter(r => r && typeof r.find === 'string' && typeof r.replace === 'string');
      }
    } catch {}
    return [];
  });
  const [statusBarVisible, setStatusBarVisible] = useState<boolean>(() => {
    const saved = localStorage.getItem('notepad:statusBar');
    return saved !== null ? saved === 'true' : true;
  });
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [contextAnchor, setContextAnchor] = useState<{ top: number; left: number } | null>(null);
  const [canPaste, setCanPaste] = useState<boolean>(false);

  // Undo functionality
  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const currentSel = editorRef.current?.getSelection() ?? { from: 0, to: 0 };

    const lastEntry = undoStack[undoStack.length - 1];
    const currentEntry: HistoryEntry = { 
      text, 
      selectionStart: currentSel.from, 
      selectionEnd: currentSel.to 
    };

    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, currentEntry]);
    setText(lastEntry.text);
    // Restore editor content and cursor without triggering change handler
    setTimeout(() => {
      editorRef.current?.replaceAll(lastEntry.text, { from: lastEntry.selectionStart, to: lastEntry.selectionEnd });
    }, 0);
  }, [undoStack, text]);

  // Redo functionality
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const currentSel = editorRef.current?.getSelection() ?? { from: 0, to: 0 };

    const nextEntry = redoStack[redoStack.length - 1];
    const currentEntry: HistoryEntry = { 
      text, 
      selectionStart: currentSel.from, 
      selectionEnd: currentSel.to 
    };

    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, currentEntry]);
    setText(nextEntry.text);
    // Restore editor content and cursor without triggering change handler
    setTimeout(() => {
      editorRef.current?.replaceAll(nextEntry.text, { from: nextEntry.selectionStart, to: nextEntry.selectionEnd });
    }, 0);
  }, [redoStack, text]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key === 'Z' || e.key === 'y')) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // no-op

  useEffect(() => {
    const saved = localStorage.getItem('notepad:text');
    if (saved) setText(saved);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => localStorage.setItem('notepad:text', text), 300);
    return () => clearTimeout(id);
  }, [text]);

  useEffect(() => {
    localStorage.setItem('notepad:theme', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('notepad:statusBar', statusBarVisible.toString());
  }, [statusBarVisible]);

  useEffect(() => {
    localStorage.setItem('notepad:pasteReplaceRules', JSON.stringify(pasteReplaceRules));
  }, [pasteReplaceRules]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    (async () => {
      try {
        const isOpen = await window.electronAPI?.isDevToolsOpen?.();
        if (typeof isOpen === 'boolean') setDevToolsOpen(isOpen);
      } catch {}
    })();
    try {
      unsubscribe = window.electronAPI?.onDevToolsStateChanged?.((open) => setDevToolsOpen(open));
    } catch {}
    return () => {
      try { unsubscribe?.(); } catch {}
    };
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    (async () => {
      try {
        const currentZoom = await window.electronAPI?.getZoomLevel?.();
        if (typeof currentZoom === 'number') setZoomLevel(currentZoom);
      } catch {}
    })();
    try {
      unsubscribe = window.electronAPI?.onZoomChanged?.((zoomFactor) => setZoomLevel(zoomFactor));
    } catch {}
    return () => {
      try { unsubscribe?.(); } catch {}
    };
  }, []);

  // Ctrl + mouse wheel to zoom in/out
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      // Prevent default page zoom/scroll to use our controlled zoom via IPC
      e.preventDefault();
      if (e.deltaY < 0) {
        try { window.electronAPI?.zoomIn?.(); } catch {}
      } else if (e.deltaY > 0) {
        try { window.electronAPI?.zoomOut?.(); } catch {}
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel as EventListener);
  }, []);

  const charCount = useMemo(() => text.length, [text]);
  const lineCount = useMemo(() => text.split(/\n/).length, [text]);

  const canUndo = useMemo(() => undoStack.length > 0, [undoStack.length]);
  const canRedo = useMemo(() => redoStack.length > 0, [redoStack.length]);

  const menuConfig = useMemo(
    () =>
      createMenuConfig({
        text,
        filePath,
        devToolsOpen,
        spellCheckEnabled,
        statusBarVisible,
        setText,
        setFilePath,
        setSpellCheckEnabled,
        setStatusBarVisible,
        undo,
        redo,
        canUndo,
        canRedo,
      }),
    [
      text,
      filePath,
      devToolsOpen,
      spellCheckEnabled,
      statusBarVisible,
      undo,
      redo,
      canUndo,
      canRedo,
    ]
  );

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);
  const toggleTheme = () => setMode(prev => prev === 'light' ? 'dark' : 'light');

  // CodeMirror is handled by CodeEditor component

  const openContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const clip = await window.electronAPI?.readClipboardText?.();
      setCanPaste(Boolean(clip && clip.length > 0));
    } catch {
      setCanPaste(false);
    }
    setContextAnchor({ top: e.clientY, left: e.clientX });
  };

  const closeContextMenu = () => setContextAnchor(null);

  const getSelectionRange = () => {
    const sel = editorRef.current?.getSelection() ?? { from: 0, to: 0 };
    const start = Math.min(sel.from, sel.to);
    const end = Math.max(sel.from, sel.to);
    return { start, end };
  };

  const doCopy = async () => {
    const { start, end } = getSelectionRange();
    if (start === end) return;
    const selectionText = text.slice(start, end);
    try { await window.electronAPI?.writeClipboardText?.(selectionText); } catch {}
  };

  const doCut = async () => {
    const { start, end } = getSelectionRange();
    if (start === end) return;
    const selectionText = text.slice(start, end);
    try { await window.electronAPI?.writeClipboardText?.(selectionText); } catch {}
    const newText = text.slice(0, start) + text.slice(end);
    setUndoStack(prev => [...prev, { text, selectionStart: start, selectionEnd: end }]);
    setRedoStack([]);
    setText(newText);
    setTimeout(() => {
      editorRef.current?.replaceAll(newText, { from: start, to: start });
      editorRef.current?.focus();
    }, 0);
  };

  const doPaste = async () => {
    let clip = '';
    try { clip = (await window.electronAPI?.readClipboardText?.()) || ''; } catch {}
    if (!clip) return;
    const { start, end } = getSelectionRange();
    const newText = text.slice(0, start) + clip + text.slice(end);
    const newPos = start + clip.length;
    setUndoStack(prev => [...prev, { text, selectionStart: start, selectionEnd: end }]);
    setRedoStack([]);
    setText(newText);
    setTimeout(() => {
      editorRef.current?.replaceAll(newText, { from: newPos, to: newPos });
      editorRef.current?.focus();
    }, 0);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <CssBaseline />
        <AppBar config={menuConfig} color="default" disableRipple={true} sx={{ borderBottom: '1px solid #e5e5e5' }} themeMode={mode} onToggleTheme={toggleTheme} pasteReplaceRules={pasteReplaceRules} onChangePasteReplaceRules={setPasteReplaceRules} />
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', height: '100vh', p: 1.5 }} onContextMenu={openContextMenu}>
          <CodeEditor
            ref={editorRef}
            value={text}
            spellCheckEnabled={spellCheckEnabled}
            onChange={(change) => {
              setUndoStack(prev => {
                const entry: HistoryEntry = { text: change.prevText, selectionStart: change.prevSelection.from, selectionEnd: change.prevSelection.to };
                const next = [...prev, entry];
                return next.length > 100 ? next.slice(1) : next;
              });
              setRedoStack([]);
              setText(change.newText);
            }}
          />
        </Box>
        <ContextMenu
          anchorPosition={contextAnchor}
          onClose={closeContextMenu}
          canCopy={(() => { const { start, end } = getSelectionRange(); return end > start; })()}
          canCut={(() => { const { start, end } = getSelectionRange(); return end > start; })()}
          canPaste={canPaste}
          onCopy={doCopy}
          onCut={doCut}
          onPaste={doPaste}
        />
        {statusBarVisible && <StatusBar filePath={filePath} charCount={charCount} lineCount={lineCount} text={text} zoomPercentage={zoomLevel} />}
      </Box>
    </ThemeProvider>
  );
}


