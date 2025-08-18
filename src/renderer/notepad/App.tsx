import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MenuBar } from '../../menubar';
import { createMenuConfig } from './config/menuConfig';
import StatusBar from './StatusBar';

export function App(): JSX.Element {
  const [text, setText] = useState('');
  const [filePath, setFilePath] = useState<string | null>(null);
  const [mode, setMode] = useState<'light' | 'dark'>(() => (localStorage.getItem('notepad:theme') as 'light' | 'dark') || 'light');
  const [devToolsOpen, setDevToolsOpen] = useState<boolean>(false);
  const [spellCheckEnabled, setSpellCheckEnabled] = useState<boolean>(false);
  const [statusBarVisible, setStatusBarVisible] = useState<boolean>(() => {
    const saved = localStorage.getItem('notepad:statusBar');
    return saved !== null ? saved === 'true' : true;
  });

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

  const charCount = useMemo(() => text.length, [text]);
  const lineCount = useMemo(() => text.split(/\n/).length, [text]);

  const menuConfig = useMemo(() =>
    createMenuConfig({ text, filePath, devToolsOpen, spellCheckEnabled, statusBarVisible, setText, setFilePath, setSpellCheckEnabled, setStatusBarVisible })
  , [text, filePath, devToolsOpen, spellCheckEnabled, statusBarVisible]);

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);
  const toggleTheme = () => setMode(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <CssBaseline />
        <MenuBar config={menuConfig} color="default" disableRipple={true} sx={{ borderBottom: '1px solid #e5e5e5' }} themeMode={mode} onToggleTheme={toggleTheme} />
        <Box sx={{ flex: 1, display: 'flex' }}>
          <TextField
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing..."
            multiline
            fullWidth
            spellCheck={spellCheckEnabled}
            variant="outlined"
            InputProps={{
              sx: {
                fontFamily: 'Consolas, Menlo, monospace',
                fontSize: 14,
              },
            }}
            sx={{ flex: 1, p: 1.5, '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
          />
        </Box>
        {statusBarVisible && <StatusBar filePath={filePath} charCount={charCount} lineCount={lineCount} />}
      </Box>
    </ThemeProvider>
  );
}


