/**
 * @fileoverview A styled wrapper around MUI's TextField,
 * with custom font size and height. Accepts
 * placeholder, value, and onChange handler as props.
 */

import React from 'react';
import { TextField } from '@mui/material';

interface LinTextFieldProps {
  /** Placeholder text displayed when the input is empty */
  placeholder: string;
  /** Current value of the input */
  value: string;
  /** Handler called when the input value changes */
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Renders a compact, styled text field using MUI's TextField.
 */
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
