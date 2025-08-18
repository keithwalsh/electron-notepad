import React, { useEffect, useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import { MenuBar } from '../../menubar';
import type { MenuConfig } from '../../menubar';

export function App(): JSX.Element {
  const [text, setText] = useState('');
  const [filePath, setFilePath] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('notepad:text');
    if (saved) setText(saved);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => localStorage.setItem('notepad:text', text), 300);
    return () => clearTimeout(id);
  }, [text]);

  const charCount = useMemo(() => text.length, [text]);
  const lineCount = useMemo(() => text.split(/\n/).length, [text]);

  const menuConfig: MenuConfig[] = useMemo(() => [
    {
      label: 'File',
      items: [
        { kind: 'action', label: 'New', shortcut: 'ctrl+n', action: () => { setText(''); setFilePath(null); } },
        { kind: 'action', label: 'Clear', action: () => setText('') },
        { kind: 'divider' },
        { kind: 'action', label: 'Exit', action: () => window.close() }
      ]
    },
    {
      label: 'Edit',
      items: [
        { kind: 'action', label: 'Select All', shortcut: 'ctrl+a', action: () => { try { document.execCommand?.('selectAll'); } catch {} } }
      ]
    },
    {
      label: 'Help',
      items: [
        { kind: 'action', label: 'About', action: () => alert('Electron Notepad') }
      ]
    }
  ], []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <CssBaseline />
      <MenuBar config={menuConfig} color="default" disableRipple={true} sx={{ borderBottom: '1px solid #e5e5e5' }} />
      <Box sx={{ flex: 1, display: 'flex' }}>
        <TextField
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing..."
          multiline
          fullWidth
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
      <Divider />
      <Box component="footer" sx={{ display: 'flex', gap: 2, color: 'text.secondary', fontSize: 12, px: 1.5, py: 0.75 }}>
        <Typography variant="caption">{filePath ?? 'Unsaved file'}</Typography>
        <Typography variant="caption">Chars: {charCount}</Typography>
        <Typography variant="caption">Lines: {lineCount}</Typography>
      </Box>
    </Box>
  );
}


