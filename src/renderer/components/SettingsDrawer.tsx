import React from 'react';
import { Box, Drawer, Divider, Typography, TextField as MUITextField, Button, IconButton } from '@mui/material';
import { Add, Close } from '@mui/icons-material';

export interface PasteReplaceRule {
  find: string;
  replace: string;
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
            <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <MUITextField
                size="small"
                placeholder="Replace"
                value={rule.find}
                onChange={(e) => {
                  const next = [...(pasteReplaceRules ?? [])];
                  next[idx] = { ...next[idx], find: e.target.value };
                  onChangePasteReplaceRules?.(next);
                }}
              />
              <Typography variant="body2" sx={{ color: "text.secondary" }}>➜</Typography>
              <MUITextField
                size="small"
                placeholder="With"
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
          ))}
          <Button variant="outlined" size="small" startIcon={<Add />} onClick={() => {
            const next = [ ...(pasteReplaceRules ?? []), { find: '', replace: '' } ];
            onChangePasteReplaceRules?.(next);
          }}>Add rule</Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SettingsDrawer;


