/**
 * @fileoverview Dedicated component for rendering root-level menu popups using Popover.
 * Handles the main menu behaviour, root close events, and positioning for top-level menus.
 */

import React, { useContext, useMemo } from "react";
import { MenuList, Popover } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import { PopupState } from "material-ui-popup-state/hooks";
import { MenuItems } from "../types";
import { CascadingContext, renderMenuItemByKind } from "../helpers";

const MENU_LIST_COMPACT_SX = { m: 0, p: 0 };
const DEFAULT_ANCHOR_ORIGIN = { vertical: 'bottom', horizontal: 'left' as const };
const DEFAULT_TRANSFORM_ORIGIN = { vertical: 'top', horizontal: 'left' as const };

export interface RootMenuProps {
    menuItems: MenuItems[];
    popupState: PopupState;
    disableRipple?: boolean;
    useHover?: boolean;
    onRootClose?: () => void;
    PopoverProps?: {
        PaperProps?: {
            className?: string;
            sx?: SxProps<Theme>;
            [key: string]: any;
        };
        anchorOrigin?: {
            vertical: "top" | "center" | "bottom";
            horizontal: "left" | "center" | "right";
        };
        transformOrigin?: {
            vertical: "top" | "center" | "bottom";
            horizontal: "left" | "center" | "right";
        };
        slotProps?: {
            transition?: any;
            [key: string]: any;
        };
        [key: string]: any;
    };
    [key: string]: any;
}

export const RootMenu: React.FC<RootMenuProps> = ({ 
    menuItems, 
    popupState, 
    disableRipple, 
    useHover = true,
    onRootClose,
    PopoverProps = {},
    ...props 
}) => {
    const { rootPopupState } = useContext(CascadingContext);
    const { slotProps: incomingSlotProps, ...restPopoverProps } = (PopoverProps as any) ?? {};
    
    const context = useMemo(
        () => ({
            rootPopupState: rootPopupState || popupState,
            parentPopupState: popupState,
        }),
        [rootPopupState, popupState]
    );

    const paperSx: SxProps<Theme> = useMemo(
        () => ({
            backgroundColor: "background.paper",
            transform: 'none !important',
            "& .MuiPaper-root": {
                backgroundColor: "background.paper",
            },
            ...(restPopoverProps?.PaperProps?.sx ?? {}),
            ...(incomingSlotProps?.paper?.sx ?? {}),
        }),
        [restPopoverProps?.PaperProps?.sx, incomingSlotProps?.paper?.sx]
    );

    const paperSlotProps = useMemo(() => ({
        ...(restPopoverProps?.PaperProps ?? {}),
        ...(incomingSlotProps?.paper ?? {}),
        sx: paperSx,
    }), [restPopoverProps?.PaperProps, incomingSlotProps?.paper, paperSx]);

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
            {...props}
            {...restPopoverProps}
            open={popupState.isOpen}
            anchorEl={popupState.anchorEl}
            onClose={handleClose}
            keepMounted
            disableRestoreFocus
            disableEnforceFocus
            anchorOrigin={{
                ...DEFAULT_ANCHOR_ORIGIN,
                ...(restPopoverProps?.anchorOrigin ?? {})
            }}
            transformOrigin={{
                ...DEFAULT_TRANSFORM_ORIGIN,
                ...(restPopoverProps?.transformOrigin ?? {})
            }}
        >
            {menuContent}
        </Popover>
    );
};

export default RootMenu;
