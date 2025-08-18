/**
 * @fileoverview Shared utilities for cascading menu components, including the
 * React context and rendering helpers used across multiple files.
 */

import React from "react";
import { ListItemIcon } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import { SvgIconProps } from "@mui/material";
import { CascadingContextType } from "../types";

const iconContainerSx: SxProps<Theme> = {
    color: "text.secondary",
    ml: -0.5,
    "& .MuiSvgIcon-root": { fontSize: "small" }
};

export const CascadingContext = React.createContext<CascadingContextType>({
    parentPopupState: null,
    rootPopupState: null,
});

export function renderListItemIcon(icon: React.ReactNode, sx?: SxProps<Theme>) {
    return (
        <ListItemIcon sx={[iconContainerSx, sx] as any}>
            {icon}
        </ListItemIcon>
    );
}


