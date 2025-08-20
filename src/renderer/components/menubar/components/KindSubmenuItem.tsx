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
                sx={{ m: 0.5, py: 0 }}
            >
                {icon && renderListItemIcon(icon, { mr: -4.5 })}
                <ListItemText inset sx={{ px: 0 }}>
                    <Typography variant="body2" sx={{ color: (theme) => alpha(theme.palette.text.primary, 0.9) }}>{label}</Typography>   
                </ListItemText>
                <ChevronRight sx={{
                    ml: 4,
                    mr: -1,
                    color: "text.secondary"
                }} />
            </MenuItem>
            <SubMenu
                menuItems={items}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                popupState={popupState}
                useHover={useHover}
            />
        </React.Fragment>
    );
};

export const CascadingSubmenu = React.memo(CascadingSubmenuComponent);

export default CascadingSubmenu;
