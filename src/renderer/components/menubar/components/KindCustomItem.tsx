/**
 * @fileoverview Renders a custom-kind cascading menu item that displays a
 * caller-provided React node and suppresses hover background styles.
 */

import React from "react";
import { Box, MenuItem } from "@mui/material";
import { MenuItemCustom } from "../types";

const CUSTOM_MENU_ITEM_SX = {
	px: 1.5,
	'&:hover': {
		backgroundColor: 'transparent'
	}
};
const CUSTOM_BOX_SX = { minWidth: 200 };

const KindCustomItemComponent: React.FC<MenuItemCustom> = ({ ...item }) => {
    return (
        <MenuItem
            disableRipple
			sx={CUSTOM_MENU_ITEM_SX}
        >
			<Box sx={CUSTOM_BOX_SX}>{item.component}</Box>
        </MenuItem>
    );
};

export const KindCustomItem = React.memo(KindCustomItemComponent);

export default KindCustomItem;


