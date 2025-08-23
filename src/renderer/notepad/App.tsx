import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar } from '../components/AppBar';
import { StatusBar } from '../components/StatusBar';
import { createMenuConfig } from './config/menuConfig';

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
  const textFieldRef = useRef<HTMLTextAreaElement>(null);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  // Add entry to undo stack
  const pushToUndoStack = useCallback((newText: string, selectionStart: number = 0, selectionEnd: number = 0) => {
    setUndoStack(prev => {
      const newEntry: HistoryEntry = { text, selectionStart, selectionEnd };
      const newStack = [...prev, newEntry];
      // Limit stack size to prevent memory issues
      return newStack.length > 100 ? newStack.slice(1) : newStack;
    });
    setRedoStack([]); // Clear redo stack when new action is performed
    setText(newText);
  }, [text]);

  // Undo functionality
  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    const currentSelection = textFieldRef.current ? {
      start: textFieldRef.current.selectionStart || 0,
      end: textFieldRef.current.selectionEnd || 0
    } : { start: 0, end: 0 };

    const lastEntry = undoStack[undoStack.length - 1];
    const currentEntry: HistoryEntry = { 
      text, 
      selectionStart: currentSelection.start, 
      selectionEnd: currentSelection.end 
    };

    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, currentEntry]);
    setText(lastEntry.text);

    // Restore cursor position after state update
    setTimeout(() => {
      if (textFieldRef.current) {
        textFieldRef.current.setSelectionRange(lastEntry.selectionStart, lastEntry.selectionEnd);
      }
    }, 0);
  }, [undoStack, text]);

  // Redo functionality
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const currentSelection = textFieldRef.current ? {
      start: textFieldRef.current.selectionStart || 0,
      end: textFieldRef.current.selectionEnd || 0
    } : { start: 0, end: 0 };

    const nextEntry = redoStack[redoStack.length - 1];
    const currentEntry: HistoryEntry = { 
      text, 
      selectionStart: currentSelection.start, 
      selectionEnd: currentSelection.end 
    };

    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, currentEntry]);
    setText(nextEntry.text);

    // Restore cursor position after state update
    setTimeout(() => {
      if (textFieldRef.current) {
        textFieldRef.current.setSelectionRange(nextEntry.selectionStart, nextEntry.selectionEnd);
      }
    }, 0);
  }, [redoStack, text]);

  // Debounced undo stack push for regular typing
  const debouncedPushToUndoStack = useCallback((newText: string, selectionStart: number = 0, selectionEnd: number = 0) => {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }
    
    undoTimeoutRef.current = setTimeout(() => {
      pushToUndoStack(newText, selectionStart, selectionEnd);
    }, 1000); // 1 second delay for typing
  }, [pushToUndoStack]);

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

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    };
  }, []);

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

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <CssBaseline />
        <AppBar config={menuConfig} color="default" disableRipple={true} sx={{ borderBottom: '1px solid #e5e5e5' }} themeMode={mode} onToggleTheme={toggleTheme} pasteReplaceRules={pasteReplaceRules} onChangePasteReplaceRules={setPasteReplaceRules} />
        <Box sx={{ flex: 1, display: 'flex', overflow: 'auto', height: '100vh' }}>
          <TextField
            value={text}
            onChange={(e) => {
              const newValue = e.target.value;
              const input = e.target as HTMLTextAreaElement;
              const selectionStart = input.selectionStart || 0;
              const selectionEnd = input.selectionEnd || 0;
              
              setText(newValue);
              
              // Use debounced approach for regular typing
              // For significant changes (paste, large deletions), add immediately
              if (Math.abs(newValue.length - text.length) > 5) {
                // Clear any pending debounced push
                if (undoTimeoutRef.current) {
                  clearTimeout(undoTimeoutRef.current);
                  undoTimeoutRef.current = null;
                }
                pushToUndoStack(newValue, selectionStart, selectionEnd);
              } else {
                debouncedPushToUndoStack(newValue, selectionStart, selectionEnd);
              }
            }}
            onPaste={(e) => {
              const clipboardData = e.clipboardData || (window as any).clipboardData;
              const pastedText = clipboardData?.getData('Text');
              if (typeof pastedText === 'string') {
                const input = e.target as HTMLTextAreaElement;
                const start = input.selectionStart ?? text.length;
                const end = input.selectionEnd ?? text.length;
                
                if ((pasteReplaceRules ?? []).length === 0) {
                  // Normal paste - add to undo stack
                  const newValue = text.slice(0, start) + pastedText + text.slice(end);
                  pushToUndoStack(newValue, start + pastedText.length, start + pastedText.length);
                  e.preventDefault();
                  return;
                }
                
                // Paste with replacements
                e.preventDefault();
                let replaced = pastedText;
                for (const rule of pasteReplaceRules) {
                  if (!rule.find) continue;
                  try {
                    // Treat 'find' as a plain string, escape regex special chars
                    const escaped = rule.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(escaped, 'g');
                    replaced = replaced.replace(regex, rule.replace ?? '');
                  } catch {}
                }
                const newValue = text.slice(0, start) + replaced + text.slice(end);
                pushToUndoStack(newValue, start + replaced.length, start + replaced.length);
              }
            }}
            placeholder="Start typing..."
            multiline
            fullWidth
            spellCheck={spellCheckEnabled}
            variant="outlined"
            slotProps={{
              input: {
                ref: textFieldRef,
                sx: {
                  fontFamily: 'Consolas, Menlo, monospace',
                  fontSize: 14,
                },
              },
            }}
            sx={{ 
              height: '100vh', 
              flex: 1, 
              p: 1.5, 
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, 
              '& .MuiOutlinedInput-root': { 
                height: '100vh',
                py: 0.6,
                px: 1,
                lineHeight: 1.16,
                fontSize: '0.9em',
                alignItems: 'flex-start'
              } 
            }}
          />
        </Box>
        {statusBarVisible && <StatusBar filePath={filePath} charCount={charCount} lineCount={lineCount} text={text} zoomPercentage={zoomLevel} />}
      </Box>
    </ThemeProvider>
  );
}


