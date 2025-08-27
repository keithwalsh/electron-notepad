import React from 'react';
import { Box, Button } from '@mui/material';

interface LinButtonProps {
  startIcon?: React.ReactNode;
  label: string;
  onClick: () => void;
}

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
