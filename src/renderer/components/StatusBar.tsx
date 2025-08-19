import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

interface StatusBarProps {
  filePath: string | null;
  charCount: number;
  lineCount: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({ filePath, charCount, lineCount }) => {
  return (
    <>
      <Divider />
      <Box 
        component="footer" 
        sx={{ 
          display: 'flex', 
          gap: 2, 
          color: 'text.secondary', 
          fontSize: 12, 
          px: 1.5, 
          py: 0.75 
        }}
      >
        <Typography variant="caption">{filePath ?? 'Unsaved file'}</Typography>
        <Typography variant="caption">Chars: {charCount}</Typography>
        <Typography variant="caption">Lines: {lineCount}</Typography>
      </Box>
    </>
  );
};

export default StatusBar;
