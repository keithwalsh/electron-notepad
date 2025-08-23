/**
 * @fileoverview Component for rendering submenu items with hover functionality
 * and chevron indicator.
 */

import React, { useContext } from "react";
import { alpha, ListItemText, MenuItem, Typography } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import { usePopupState, bindHover, bindTrigger } from "material-ui-popup-state/hooks";
import { MenuItemSubmenu } from "../types";
import { CascadingContext, renderListItemIcon } from "../helpers";
import { SubMenu } from "./SubMenu";

const MENU_ITEM_SX_COMPACT = { m: 0.5, py: 0 };
const ICON_ADJUST_SX = { mr: -4.5 };
const LIST_ITEM_TEXT_SX = { px: 0 };
const primaryText90 = (theme: any) => alpha(theme.palette.text.primary, 0.9);
const LABEL_TYPO_SX = { color: primaryText90 };
const CHEVRON_SX = { ml: 4, mr: -1, color: "text.secondary" };
const SUBMENU_ANCHOR_ORIGIN = { vertical: "top", horizontal: "right" } as const;
const SUBMENU_TRANSFORM_ORIGIN = { vertical: "top", horizontal: "left" } as const;

export interface CascadingSubmenuProps extends MenuItemSubmenu {
    popupId: string;
    useHover?: boolean;
}

const CascadingSubmenuComponent: React.FC<CascadingSubmenuProps> = ({ 
    label, 
    items, 
    icon, 
    popupId,
    useHover = true 
}) => {
    const { parentPopupState } = useContext(CascadingContext);
    const popupState = usePopupState({
        popupId,
        variant: "popover",
        parentPopupState,
    });

    // Prefer custom hover handling on mouseenter (not mouseover) to avoid
    // a submenu opening when it first renders under a stationary cursor.
    const triggerProps = useHover ? bindHover(popupState) : bindTrigger(popupState);

    // Delay opening on hover to avoid flash when the menu first renders under the cursor
    const openDelayRef = React.useRef<number | null>(null);
    const scheduleOpen = React.useCallback((event: React.MouseEvent<any>) => {
        if (openDelayRef.current != null) window.clearTimeout(openDelayRef.current);
        const currentTarget = event.currentTarget as Element;
        const clientX = (event as any).clientX;
        const clientY = (event as any).clientY;
        openDelayRef.current = window.setTimeout(() => {
            popupState.open({
                type: 'mouseover',
                currentTarget,
                clientX,
                clientY,
            } as any);
            openDelayRef.current = null;
        }, 150);
    }, [popupState]);
    const cancelScheduledOpen = React.useCallback(() => {
        if (openDelayRef.current != null) {
            window.clearTimeout(openDelayRef.current);
            openDelayRef.current = null;
        }
    }, []);

    // Cleanup any scheduled open on unmount to avoid stray timeouts
    React.useEffect(() => () => cancelScheduledOpen(), [cancelScheduledOpen]);

    return (
        <React.Fragment>
            <MenuItem 
                {...triggerProps}
                // Override bindHover's mouseover-based open with mouseenter/pointerenter + delay
                {...(useHover ? { 
                    onMouseOver: undefined, 
                    onMouseEnter: scheduleOpen as any, 
                    onPointerEnter: scheduleOpen as any,
                    onMouseLeave: (e: any) => { cancelScheduledOpen(); (triggerProps as any)?.onMouseLeave?.(e); }
                } : {})}
                disableRipple
                sx={MENU_ITEM_SX_COMPACT}
            >
                {icon && renderListItemIcon(icon, ICON_ADJUST_SX)}
                <ListItemText inset sx={LIST_ITEM_TEXT_SX}>
                    <Typography variant="body2" sx={LABEL_TYPO_SX}>{label}</Typography>   
                </ListItemText>
                <ChevronRight sx={CHEVRON_SX} />
            </MenuItem>
            <SubMenu
                menuItems={items}
                anchorOrigin={SUBMENU_ANCHOR_ORIGIN}
                transformOrigin={SUBMENU_TRANSFORM_ORIGIN}
                popupState={popupState}
                useHover={useHover}
            />
        </React.Fragment>
    );
};

// Custom comparator: only re-render when visible props or the semantic shape of items changes
const areEqualSubmenuItem = (prev: CascadingSubmenuProps, next: CascadingSubmenuProps) => {
    if (
        prev.label !== next.label ||
        prev.disabled !== next.disabled ||
        prev.selected !== next.selected ||
        prev.useHover !== next.useHover
    ) {
        return false;
    }

    const a = prev.items;
    const b = next.items;
    if (a === b) return true;
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;

    // Compare items by stable, relevant fields to avoid identity-based re-renders
    for (let i = 0; i < a.length; i++) {
        const ai: any = a[i] as any;
        const bi: any = b[i] as any;
        if (ai.kind !== bi.kind) return false;
        if (ai.label !== bi.label) return false;
        if (ai.disabled !== bi.disabled) return false;
        if (ai.selected !== bi.selected) return false;
        if (ai.kind === 'action') {
            if (ai.shortcut !== bi.shortcut) return false;
        }
    }
    return true;
};
export const CascadingSubmenu = React.memo(CascadingSubmenuComponent, areEqualSubmenuItem);

export default CascadingSubmenu;