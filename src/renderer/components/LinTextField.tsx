import React from 'react';
import { TextField } from '@mui/material';

interface LinTextFieldProps {
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const LinTextField: React.FC<LinTextFieldProps> = ({
  placeholder,
  value,
  onChange
}) => {
  return (
    <TextField
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      sx={{ 
        flex: 1, 
        "& .MuiInputBase-input": { 
          height: '0.7rem', 
          fontSize: '0.7rem' 
        } 
      }}
    />
  );
};

export default LinTextField;
