import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar } from '../components/AppBar';
import { StatusBar } from '../components/StatusBar';
import { createMenuConfig } from './config/menuConfig';

export function App(): JSX.Element {
  const [text, setText] = useState('');
  const [filePath, setFilePath] = useState<string | null>(null);
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

  const menuConfig = useMemo(() =>
    createMenuConfig({ text, filePath, devToolsOpen, spellCheckEnabled, statusBarVisible, setText, setFilePath, setSpellCheckEnabled, setStatusBarVisible })
  , [text, filePath, devToolsOpen, spellCheckEnabled, statusBarVisible]);

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
            onChange={(e) => setText(e.target.value)}
            onPaste={(e) => {
              const clipboardData = e.clipboardData || (window as any).clipboardData;
              const pastedText = clipboardData?.getData('Text');
              if (typeof pastedText === 'string') {
                if ((pasteReplaceRules ?? []).length === 0) return;
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
                const input = e.target as HTMLTextAreaElement;
                const start = input.selectionStart ?? text.length;
                const end = input.selectionEnd ?? text.length;
                const newValue = text.slice(0, start) + replaced + text.slice(end);
                setText(newValue);
              }
            }}
            placeholder="Start typing..."
            multiline
            fullWidth
            spellCheck={spellCheckEnabled}
            variant="outlined"
            slotProps={{
              input: {
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


