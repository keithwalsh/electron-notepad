/**
 * @fileoverview A styled Material-UI Button with
 * custom styling for font size, padding, and icon spacing.
 */

import React from 'react';
import { Box, Button } from '@mui/material';

/**
 * Props for the LinButton component.
*/
interface LinButtonProps {
  startIcon?: React.ReactNode;
  label: string;
  onClick: () => void;
}

/**
 * Renders a small, outlined Material-UI Button with custom styling and an optional start icon.
*/
const LinButton: React.FC<LinButtonProps> = ({
  startIcon,
  label,
  onClick
}) => {
  return (
    <Box>
      <Button 
        variant="outlined" 
        size="small" 
        sx={{ 
          textTransform: 'none', 
          fontSize: '0.7rem', 
          py: 0.25, 
          px: 0.75, 
          "& .MuiButton-startIcon": { marginRight: 0.25 } 
        }}
        startIcon={startIcon} 
        onClick={onClick}
      >
        {label}
      </Button>
    </Box>
  );
};

export default LinButton;
