import React, { useMemo } from 'react';
import { Box, Typography, Divider, Stack } from '@mui/material';

interface StatusBarProps {
  filePath: string | null;
  charCount: number;
  lineCount: number;
  text: string | null | undefined;
  zoomPercentage: number;
}

// Utility function to detect line endings in text
const detectLineEndings = (text: string | null | undefined): string => {
  // Handle null, undefined, or empty text
  if (!text || typeof text !== 'string') {
    return getDefaultLineEndingFormat();
  }
  
  // Check if text contains any line breaks
  if (!text.includes('\n') && !text.includes('\r')) {
    return getDefaultLineEndingFormat();
  }
  
  // Check for CRLF first (Windows)
  if (text.includes('\r\n')) {
    return 'Windows (CRLF)';
  }
  
  // Check for CR (old Mac)
  if (text.includes('\r')) {
    return 'Mac (CR)';
  }
  
  // Default to LF (Unix/Linux/modern Mac)
  if (text.includes('\n')) {
    return 'Unix (LF)';
  }
  
  return getDefaultLineEndingFormat();
};

// Get default line ending format based on platform
const getDefaultLineEndingFormat = (): string => {
  // In Electron, we can detect the platform
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Windows')) {
    return 'Windows (CRLF)';
  } else if (userAgent.includes('Mac')) {
    return 'Unix (LF)';
  } else {
    return 'Unix (LF)';
  }
};

export const StatusBar: React.FC<StatusBarProps> = ({ filePath, charCount, lineCount, text, zoomPercentage }) => {
  const lineEndingFormat = useMemo(() => detectLineEndings(text), [text]);

  return (
    <>
      <Divider />
      <Box 
        component="footer" 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'text.secondary', 
          fontSize: 12, 
          px: 1.5, 
          py: 0.75 
        }}
      >
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem />}
          spacing={2}
        >
          <Typography variant="caption">{filePath ?? 'Unsaved file'}</Typography>
          <Typography variant="caption">Chars: {charCount}</Typography>
          <Typography variant="caption">Lines: {lineCount}</Typography>
        </Stack>
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem />}
          spacing={2}
        >
          <Typography variant="caption">{Math.round(zoomPercentage * 100)}%</Typography>
          <Typography variant="caption">{lineEndingFormat}</Typography>
          <Typography variant="caption">UTF-8</Typography>
        </Stack>
      </Box>
    </>
  );
};

export default StatusBar;
