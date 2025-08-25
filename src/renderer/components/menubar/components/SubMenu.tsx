/**
 * @fileoverview Dedicated component for rendering submenu popups using HoverMenu.
 * Handles the popup behaviour and styling for nested menu items.
 */

import React, { useContext, useMemo } from "react";
import { MenuList } from "@mui/material";
import { styled } from "@mui/material/styles";
import { bindMenu, PopupState } from "material-ui-popup-state/hooks";
import HoverMenuImport from "material-ui-popup-state/HoverMenu";
import { MenuItems } from "../types";
import { CascadingContext, renderMenuItemByKind } from "../helpers";

const MENU_LIST_COMPACT_SX = { m: 0, p: 0 };

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
}

const SubMenuComponent: React.FC<SubMenuProps> = ({ 
    menuItems, 
    popupState,
    useHover = true,
    anchorOrigin,
    transformOrigin,
}) => {
    const { rootPopupState } = useContext(CascadingContext);
    
    const context = useMemo(
        () => ({
            rootPopupState: rootPopupState || popupState,
            parentPopupState: popupState,
        }),
        [rootPopupState, popupState]
    );

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
        <StyledMenu
            {...bindMenu(popupState)}
            anchorOrigin={anchorOrigin}
            transformOrigin={transformOrigin}
            keepMounted
            disableAutoFocusItem
            autoFocus={false}
            transitionDuration={0}
        >
            {menuContent}
        </StyledMenu>
    );
};

export const SubMenu = React.memo(SubMenuComponent);

export default SubMenu;
