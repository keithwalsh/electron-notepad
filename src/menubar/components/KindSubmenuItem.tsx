/**
 * @fileoverview Component for rendering submenu items with hover functionality
 * and chevron indicator.
 */

import React, { useContext } from "react";
import { MenuItem, ListItemText, Typography } from "@mui/material";
import ChevronRight from "@mui/icons-material/ChevronRight";
import { usePopupState, bindHover, bindTrigger } from "material-ui-popup-state/hooks";
import { MenuItemSubmenu } from "../types";
import { CascadingContext, renderListItemIcon } from "./CascadingShared";
import { SubMenu } from "./SubMenuRenderer";
import { alpha } from "@mui/material/styles";

export interface CascadingSubmenuProps extends MenuItemSubmenu {
    popupId: string;
    disableRipple?: boolean;
    useHover?: boolean;
}

const CascadingSubmenuComponent: React.FC<CascadingSubmenuProps> = ({ 
    label, 
    items, 
    icon, 
    popupId, 
    disableRipple, 
    useHover = true 
}) => {
    const { parentPopupState } = useContext(CascadingContext);
    const popupState = usePopupState({
        popupId,
        variant: "popover",
        parentPopupState,
    });

    // Use bindHover if useHover is true, otherwise use bindTrigger
    const bindMenuProps = useHover ? bindHover : bindTrigger;

    return (
        <React.Fragment>
            <MenuItem 
                {...bindMenuProps(popupState)} 
                disableRipple={disableRipple}
                sx={{ m: 0.5, py: 0 }}
            >
                {icon && renderListItemIcon(icon, { mr: -4.5 })}
                <ListItemText inset sx={{ px: 0 }}>
                    <Typography variant="body2" sx={{ color: (theme) => alpha(theme.palette.text.secondary, 0.9) }}>{label}</Typography>   
                </ListItemText>
                <ChevronRight sx={{
                    ml: 4,
                    mr: -1,
                    color: (theme) => alpha(theme.palette.text.secondary, 0.9)
                }} />
            </MenuItem>
            <SubMenu
                menuItems={items}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                popupState={popupState}
                disableRipple
                useHover={useHover}
            />
        </React.Fragment>
    );
};

export const CascadingSubmenu = React.memo(CascadingSubmenuComponent);

export default CascadingSubmenu;
