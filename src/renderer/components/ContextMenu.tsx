import React from 'react';
import { ContentCopy, ContentCut, ContentPaste, SelectAll, Undo } from '@mui/icons-material';
import { Divider, ListItemIcon, ListItemText, Menu, MenuItem, MenuList, SxProps, Theme, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

export interface ContextMenuProps {
  anchorPosition: { top: number; left: number } | null;
  onClose: () => void;
  canCopy: boolean;
  canCut: boolean;
  canPaste: boolean;
  canUndo: boolean;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onSelectAll: () => void;
  onUndo: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  anchorPosition,
  onClose,
  canCopy,
  canCut,
  canPaste,
  canUndo,
  onCopy,
  onCut,
  onPaste,
  onSelectAll,
  onUndo,
}) => {

const textSecondary90 = (theme: any) => alpha(theme.palette.text.secondary, 0.9);
const textSecondary60 = (theme: any) => alpha(theme.palette.text.secondary, 0.6);
  
const iconContainerSx: SxProps<Theme> = {
  color: (theme) => alpha(theme.palette.text.primary, 0.7),
  ml: -0.5,
  "& .MuiSvgIcon-root": { fontSize: "small" }
};

const menuSx: SxProps<Theme> = {
  m: 0, p: 0,
  "& .MuiList-padding": { paddingTop: 0, paddingBottom: 0 },
  "& .MuiPaper-root": { // Remove default browser focus outline
    outline: "none",
    border: "none",
    boxShadow: (theme) => theme.shadows[8]
  }
};

const menuListSx: SxProps<Theme> = {
  m: 0, p: 0, minWidth: 220
};

const menuItemSx: SxProps<Theme> = {
  m: 0.5, py: 0, px: 2
};

const menuItemShortcutSx = { ml: 4, color: textSecondary60, fontSize: '0.86rem' };
const menuItemLabelSx = { color: textSecondary90 };


const open = Boolean(anchorPosition);

const handleCopy = () => { onCopy(); onClose(); };
const handleCut = () => { onCut(); onClose(); };
const handlePaste = () => { onPaste(); onClose(); };
const handleSelectAll = () => { onSelectAll(); onClose(); };
const handleUndo = () => { onUndo(); onClose(); };

  return (
    <Menu
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition || undefined}
      keepMounted
      transitionDuration={0}
      sx={menuSx}
    >
      <MenuList dense sx={menuListSx}>
      <MenuItem sx={menuItemSx} onClick={handleUndo} disabled={!canUndo} dense>
        <ListItemIcon sx={iconContainerSx}>
          <Undo fontSize="small" />
        </ListItemIcon>
        <ListItemText sx={menuItemLabelSx}>Undo</ListItemText>
        <Typography variant="body2" sx={menuItemShortcutSx}>
            Ctrl+Z
        </Typography>
      </MenuItem>
      <Divider sx={{ my: '0 !important' }} />
      <MenuItem sx={menuItemSx} onClick={handleCut} disabled={!canCut} dense>
        <ListItemIcon sx={iconContainerSx}>
          <ContentCut fontSize="small" />
        </ListItemIcon>
        <ListItemText sx={menuItemLabelSx}>Cut</ListItemText>
        <Typography variant="body2" sx={menuItemShortcutSx}>
            Ctrl+X
        </Typography>
      </MenuItem>
      <MenuItem sx={menuItemSx} onClick={handleCopy} disabled={!canCopy} dense>
        <ListItemIcon sx={iconContainerSx}>
          <ContentCopy fontSize="small" />
        </ListItemIcon>
        <ListItemText sx={menuItemLabelSx}>Copy</ListItemText>
        <Typography variant="body2" sx={menuItemShortcutSx}>
            Ctrl+C
        </Typography>
      </MenuItem>
        <MenuItem sx={menuItemSx} onClick={handlePaste} disabled={!canPaste} dense>
        <ListItemIcon sx={iconContainerSx}>
          <ContentPaste fontSize="small" />
        </ListItemIcon>
        <ListItemText sx={menuItemLabelSx}>Paste</ListItemText>
        <Typography variant="body2" sx={menuItemShortcutSx}>
            Ctrl+V
        </Typography>
      </MenuItem>
      <Divider sx={{ my: '0 !important' }} />
      <MenuItem sx={menuItemSx} onClick={handleSelectAll} dense>
        <ListItemIcon sx={iconContainerSx}>
          <SelectAll fontSize="small" />
        </ListItemIcon>
        <ListItemText sx={menuItemLabelSx}>Select All</ListItemText>
        <Typography variant="body2" sx={menuItemShortcutSx}>
            Ctrl+A
        </Typography>
      </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ContextMenu;


