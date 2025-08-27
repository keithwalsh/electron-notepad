import React from 'react';
import { Box, Drawer, Divider, Typography, IconButton, Checkbox, FormControlLabel } from '@mui/material';
import { Close } from '@mui/icons-material';
import { IoIosAdd } from "react-icons/io";
import LinButton from './LinButton';
import LinTextField from './LinTextField';

export interface PasteReplaceRule {
  find: string;
  replace: string;
  isRegex?: boolean;
}



interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  pasteReplaceRules?: PasteReplaceRule[];
  onChangePasteReplaceRules?: (rules: PasteReplaceRule[]) => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  open,
  onClose,
  pasteReplaceRules,
  onChangePasteReplaceRules
}) => {
  return (
    <Drawer open={open} onClose={onClose} anchor="right">
      <Box sx={{ width: 350, p: 2 }}>
        <Typography variant="h6">Settings</Typography>
        <Divider />
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="subtitle2">Paste replacements</Typography>
          {(pasteReplaceRules ?? []).map((rule, idx) => (
            <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', gap: 0, px: 1, paddingTop: 1, border: 1, borderColor: 'divider', borderRadius: 1,}}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <LinTextField
                  placeholder="Find (text/regex)"
                  value={rule.find}
                  onChange={(e) => {
                    const next = [...(pasteReplaceRules ?? [])];
                    next[idx] = { ...next[idx], find: e.target.value };
                    onChangePasteReplaceRules?.(next);
                  }}
                />
                <Typography variant="body2" sx={{ color: "text.secondary" }}>➜</Typography>
                <LinTextField
                  placeholder="Replace with"
                  value={rule.replace}
                  onChange={(e) => {
                    const next = [...(pasteReplaceRules ?? [])];
                    next[idx] = { ...next[idx], replace: e.target.value };
                    onChangePasteReplaceRules?.(next);
                  }}
                />
                <IconButton size="small" onClick={() => {
                  const next = (pasteReplaceRules ?? []).filter((_, i) => i !== idx);
                  onChangePasteReplaceRules?.(next);
                }} aria-label="remove-rule">
                  <Close fontSize="small" />
                </IconButton>
              </Box>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={rule.isRegex ?? false}
                    onChange={(e) => {
                      const next = [...(pasteReplaceRules ?? [])];
                      next[idx] = { ...next[idx], isRegex: e.target.checked };
                      onChangePasteReplaceRules?.(next);
                    }}
                  />
                }
                label="Use regex"
                sx={{ p: 0, m: 0, "& .MuiFormControlLabel-label": { fontSize: '0.7rem' }, "& .MuiCheckbox-root": { p: 0.6 } }}
              />
            </Box>
          ))}
          <LinButton 
            startIcon={<IoIosAdd />}
            label="Add rule"
            onClick={() => {
              const next = [ ...(pasteReplaceRules ?? []), { find: '', replace: '' } ];
              onChangePasteReplaceRules?.(next);
            }}
          />
        </Box>
      </Box>
    </Drawer>
  );
};

export default SettingsDrawer;


