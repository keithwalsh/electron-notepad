import React from 'react';
import { Box, IconButton } from '@mui/material';
import MinimizeIcon from '@mui/icons-material/Minimize';
import CloseIcon from '@mui/icons-material/Close';
import { VscChromeRestore } from "react-icons/vsc";

interface WindowControlsProps {
  onMinimize?: () => void;
  onRestore?: () => void;
  onClose?: () => void;
}

export const WindowControls: React.FC<WindowControlsProps> = ({
  onMinimize,
  onRestore,
  onClose
}) => {
  const handleMinimize = () => {
    if (onMinimize) {
      onMinimize();
    } else if (window.electronAPI?.minimizeWindow) {
      window.electronAPI.minimizeWindow();
    }
  };

  const handleRestore = () => {
    if (onRestore) {
      onRestore();
    } else if (window.electronAPI?.toggleMaximizeWindow) {
      window.electronAPI.toggleMaximizeWindow();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (window.electronAPI?.closeWindow) {
      window.electronAPI.closeWindow();
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      height: '100%',
      ml: 'auto' // Push to the right side
    }}>
      <IconButton
        size="small"
        onClick={handleMinimize}
        sx={{
          borderRadius: 0,
          width: 46,
          height: 32,
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
          }
        }}
        aria-label="minimize"
      >
        <MinimizeIcon fontSize="small" />
      </IconButton>
      
      <IconButton
        size="small"
        onClick={handleRestore}
        sx={{
          borderRadius: 0,
          width: 46,
          height: 32,
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
          }
        }}
        aria-label="restore"
      >
        <VscChromeRestore size={16} />
      </IconButton>
      
      <IconButton
        size="small"
        onClick={handleClose}
        sx={{
          borderRadius: 0,
          width: 46,
          height: 32,
          '&:hover': {
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            color: '#dc3545'
          }
        }}
        aria-label="close"
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default WindowControls;
