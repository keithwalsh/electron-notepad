/**
 * @fileoverview Dedicated component for rendering root-level menu popups using Popover.
 * Handles the main menu behaviour, root close events, and positioning for top-level menus.
 */

import React, { useContext, useMemo } from "react";
import { MenuList, Popover } from "@mui/material";
import { PopupState } from "material-ui-popup-state/hooks";
import { MenuItems } from "../types";
import { CascadingContext, renderMenuItemByKind } from "../helpers";

const MENU_LIST_COMPACT_SX = { m: 0, p: 0 };
const DEFAULT_ANCHOR_ORIGIN = { vertical: 'bottom' as const, horizontal: 'left' as const };
const DEFAULT_TRANSFORM_ORIGIN = { vertical: 'top' as const, horizontal: 'left' as const };

export interface RootMenuProps {
    menuItems: MenuItems[];
    popupState: PopupState;
    useHover?: boolean;
    onRootClose?: () => void;
}

export const RootMenu: React.FC<RootMenuProps> = ({ 
    menuItems, 
    popupState, 
    useHover = true,
    onRootClose,
}) => {
    const { rootPopupState } = useContext(CascadingContext);
    
    const context = useMemo(
        () => ({
            rootPopupState: rootPopupState || popupState,
            parentPopupState: popupState,
        }),
        [rootPopupState, popupState]
    );

    const handleClose = useMemo(() => (_: {}, reason: "backdropClick" | "escapeKeyDown") => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") {
            popupState.close();
            onRootClose?.();
        }
    }, [popupState, onRootClose]);

    const menuContent = useMemo(() => (
        <CascadingContext.Provider value={context}>
            <MenuList dense sx={MENU_LIST_COMPACT_SX}>
                {menuItems.map((item: MenuItems, index: number) => {
                    const baseId = (item as any).id ?? (item as any).label ?? index;
                    return renderMenuItemByKind({ item, baseId, useHover });
                })}
            </MenuList>
        </CascadingContext.Provider>
    ), [context, menuItems, useHover]);

    return (
        <Popover
            open={popupState.isOpen}
            anchorEl={popupState.anchorEl}
            onClose={handleClose}
            keepMounted
            disableRestoreFocus
            disableEnforceFocus
            transitionDuration={0}
            anchorOrigin={DEFAULT_ANCHOR_ORIGIN}
            transformOrigin={DEFAULT_TRANSFORM_ORIGIN}
        >
            {menuContent}
        </Popover>
    );
};

export default RootMenu;
