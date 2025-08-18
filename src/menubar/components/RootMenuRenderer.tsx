/**
 * @fileoverview Renders the root menu items for the MenuBar component. Wraps
 * children in MenuButtonGroup so that MenuButton props are minimised.
 */

import React from "react";
import { Box } from "@mui/material";
import { MenuConfig, RootMenuRendererProps } from "../types";
import RootMenuButton from "./RootMenuButton";
import { RootMenuButtonGroup } from "./RootMenuButtonGroup";


const RootMenuRendererComponent: React.FC<RootMenuRendererProps> = ({ menuConfig, disableRipple }) => {
    return (
        <RootMenuButtonGroup>
            <Box 
                data-testid="menu-toolbar"
                sx={{ display: 'flex' }}
            >
                {menuConfig.map((menu: MenuConfig) => {
                    const key = menu.id ?? menu.label;
                    return (
                        <RootMenuButton
                            key={key}
                            menu={menu}
                            disableRipple={disableRipple}
                        />
                    );
                })}
            </Box>
        </RootMenuButtonGroup>
    );
};

export const RootMenuRenderer = React.memo(RootMenuRendererComponent);