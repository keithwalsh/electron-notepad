/**
 * @fileoverview Renders an action-kind cascading menu item with icon, label,
 * shortcut, and click handling that closes the root popup before invoking the
 * provided action.
 */

import React, { useContext } from "react";
import { MenuItem, ListItemText, Typography, alpha } from "@mui/material";
import { MenuItemAction } from "../types";
import { CascadingContext, renderListItemIcon } from "../helpers";

const MENU_ITEM_SX_COMPACT = { m: 0.5, py: 0 };
const textSecondary90 = (theme: any) => alpha(theme.palette.text.secondary, 0.9);
const textSecondary60 = (theme: any) => alpha(theme.palette.text.secondary, 0.6);
const LABEL_TYPO_SX = { color: textSecondary90 };
const SHORTCUT_TYPO_SX = { ml: 4, color: textSecondary60, fontSize: '0.86rem' };

const KindActionItemComponent: React.FC<MenuItemAction> = ({ ...item }) => {
    const { rootPopupState } = useContext(CascadingContext);

    const handleClick = React.useCallback(
        (event: React.MouseEvent<HTMLLIElement>) => {
            // Execute action first (matches ContextMenu ordering), then close menu
            item.action();
            rootPopupState?.close(event);
        },
        [rootPopupState, item.action]
    );

    return (
        <MenuItem
            sx={MENU_ITEM_SX_COMPACT}
            onClick={handleClick}
            disabled={item.disabled}
            selected={item.selected}
            disableRipple
        >
            {item.icon && renderListItemIcon(item.icon)}
            <ListItemText><Typography variant="body2" sx={LABEL_TYPO_SX}>{item.label}</Typography></ListItemText>
            {item.shortcut && (
                <Typography variant="body2" sx={SHORTCUT_TYPO_SX}>
                    {item.shortcut}
                </Typography>
            )}
        </MenuItem>
    );
};

const areEqualActionItem = (prev: MenuItemAction, next: MenuItemAction) => {
    return (
        prev.label === next.label &&
        prev.disabled === next.disabled &&
        prev.selected === next.selected &&
        prev.shortcut === next.shortcut &&
        // Include action identity so we refresh when handlers change (e.g., Undo/Redo closures)
        prev.action === next.action
    );
};

export const KindActionItem = React.memo(KindActionItemComponent, areEqualActionItem);

export default KindActionItem;


