/**
 * @fileoverview Dedicated component for rendering submenu popups using HoverMenu.
 * Handles the popup behaviour and styling for nested menu items.
 */

import React, { useContext, useMemo } from "react";
import { MenuList } from "@mui/material";
import { styled, SxProps, Theme } from "@mui/material/styles";
import { bindMenu, PopupState } from "material-ui-popup-state/hooks";
import HoverMenuImport from "material-ui-popup-state/HoverMenu";
import { MenuItems } from "../types";
import { CascadingContext, renderMenuItemByKind } from "../helpers";

// Cast HoverMenu to any to bypass type checking
const HoverMenu = HoverMenuImport as any;

// Create a styled version of Menu with custom styles
const StyledMenu = styled(HoverMenu)(() => ({
    "& .MuiList-padding": {
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
    },
}));

export interface SubMenuProps {
    menuItems: MenuItems[];
    popupState: PopupState;
    useHover?: boolean;
    anchorOrigin?: {
        vertical: "top" | "center" | "bottom";
        horizontal: "left" | "center" | "right";
    };
    transformOrigin?: {
        vertical: "top" | "center" | "bottom";
        horizontal: "left" | "center" | "right";
    };
    PaperProps?: {
        className?: string;
        sx?: SxProps<Theme>;
        [key: string]: any;
    };
    slotProps?: {
        [key: string]: any;
    }
    [key: string]: any;
}

const SubMenuComponent: React.FC<SubMenuProps> = ({ 
    menuItems, 
    popupState,
    useHover = true,
    PaperProps = {},
    slotProps,
    ...props 
}) => {
    const { rootPopupState } = useContext(CascadingContext);
    
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
            "& .MuiPaper-root": {
                backgroundColor: "background.paper",
            },
            ...(PaperProps?.sx ?? {})
        }),
        [PaperProps?.sx]
    );

    const menuContent = useMemo(() => (
        <CascadingContext.Provider value={context}>
            <MenuList dense sx={{ m: 0, p: 0 }}>
                {menuItems.map((item: MenuItems, index: number) => {
                    const baseId = (item as any).id ?? (item as any).label ?? index;
                    return renderMenuItemByKind({ item, baseId, useHover });
                })}
            </MenuList>
        </CascadingContext.Provider>
    ), [context, menuItems, useHover]);

    return (
        <StyledMenu
            {...props}
            {...bindMenu(popupState)}
            autoFocus={props?.autoFocus ?? false}
            disableAutoFocusItem={props?.disableAutoFocusItem ?? true}
            PaperProps={{
                ...(PaperProps ?? {}),
                sx: paperSx,
            }}
        >
            {menuContent}
        </StyledMenu>
    );
};

export const SubMenu = React.memo(SubMenuComponent);

export default SubMenu;
