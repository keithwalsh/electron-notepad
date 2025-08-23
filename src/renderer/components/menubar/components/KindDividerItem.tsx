/**
 * @fileoverview Renders a divider-kind cascading menu item as a list Divider.
 */

import React from "react";
import { Divider } from "@mui/material";
import { MenuItemDivider } from "../types";

const DIVIDER_SX_RESET_MARGIN = { my: '0 !important' };

export const KindDividerItem: React.FC<MenuItemDivider> = () => {
    return <Divider data-testid="menu-divider" component="li" sx={DIVIDER_SX_RESET_MARGIN} />;
};

export default KindDividerItem;


