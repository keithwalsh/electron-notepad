/**
 * @fileoverview Helper for rendering a consistent ListItemIcon.
 */

import React from "react";
import { alpha, ListItemIcon } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";

const iconContainerSx: SxProps<Theme> = {
	color: (theme) => alpha(theme.palette.text.primary, 0.7),
	ml: -0.5,
	"& .MuiSvgIcon-root": { fontSize: "small" }
};

export function renderListItemIcon(icon: React.ReactNode, sx?: SxProps<Theme>) {
	return (
		<ListItemIcon sx={[iconContainerSx, sx] as any}>
			{icon}
		</ListItemIcon>
	);
}

export default renderListItemIcon;


