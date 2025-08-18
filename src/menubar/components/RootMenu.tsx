/**
 * @fileoverview Dedicated component for rendering root-level menu popups using Popover.
 * Handles the main menu behaviour, root close events, and positioning for top-level menus.
 */

import React, { useContext, useMemo } from "react";
import { MenuList, Popover } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import { PopupState } from "material-ui-popup-state/hooks";
import { MenuItems } from "../types";
import { CascadingContext } from "./CascadingShared";
import { CascadingMenuItem } from "./CascadingMenuItem";
import { CascadingSubmenu } from "./KindSubmenuItem";

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
        TransitionProps?: any;
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
    const { TransitionProps: deprecatedTransitionProps, slotProps: incomingSlotProps, ...restPopoverProps } = (PopoverProps as any) ?? {};
    
    const mergedTransitionSlotProps = useMemo(() => ({
        timeout: 0,
        enter: 0,
        exit: 0,
        ...(deprecatedTransitionProps ?? {}),
        ...(incomingSlotProps?.transition ?? {})
    }), [deprecatedTransitionProps, incomingSlotProps?.transition]);
    
    const popoverSlotProps = useMemo(() => ({
        ...(incomingSlotProps ?? {}),
        transition: mergedTransitionSlotProps
    }), [incomingSlotProps, mergedTransitionSlotProps]);
    
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
            ...(restPopoverProps?.PaperProps?.sx ?? {})
        }),
        [restPopoverProps?.PaperProps?.sx]
    );

    const handleClose = useMemo(() => (_: {}, reason: "backdropClick" | "escapeKeyDown") => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") {
            popupState.close();
            onRootClose?.();
        }
    }, [popupState, onRootClose]);

    const menuContent = useMemo(() => (
        <CascadingContext.Provider value={context}>
            <MenuList dense sx={{ m: 0, p: 0 }}>
                {menuItems.map((item: MenuItems, index: number) => {
                    const baseId = (item as any).id ?? (item as any).label ?? index;
                    if (item.kind === "submenu") {
                        return (
                            <CascadingSubmenu
                                key={`submenu-${baseId}`}
                                {...item}
                                popupId={`submenu-${baseId}`}
                                disableRipple={disableRipple}
                                useHover={useHover}
                            />
                        );
                    }
                    return (
                        <CascadingMenuItem
                            key={`item-${baseId}`}
                            {...item}
                            disableRipple={disableRipple}
                        />
                    );
                })}
            </MenuList>
        </CascadingContext.Provider>
    ), [context, menuItems, disableRipple, useHover]);

    return (
        <Popover
            {...props}
            {...restPopoverProps}
            open={popupState.isOpen}
            anchorEl={popupState.anchorEl}
            onClose={handleClose}
            transitionDuration={0}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
                ...(restPopoverProps?.anchorOrigin ?? {})
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
                ...(restPopoverProps?.transformOrigin ?? {})
            }}
            PaperProps={{
                ...(restPopoverProps?.PaperProps ?? {}),
                sx: paperSx
            }}
            slotProps={popoverSlotProps}
        >
            {menuContent}
        </Popover>
    );
};

export default RootMenu;
