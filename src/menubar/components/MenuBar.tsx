/**
 * @fileoverview Implements the main MenuBar component, rendering a customisable
 * menu bar using Material-UI components and popup state management.
 */

import React, { useMemo } from "react";
import { AppBar, createTheme, ThemeProvider, Toolbar, Box } from "@mui/material";
import { MenuBarProps } from "../types";
import { useMenuHotkeys } from "../utils";
import { RootMenuRenderer } from "./RootMenuRenderer";

// Create theme outside component to avoid recreating on every render
const menuBarTheme = createTheme({
    components: {
        MuiToolbar: {
            styleOverrides: {
                dense: {
                    minHeight: 0,
                    height: 32,
                    px: 0,
                }
            }
        }
    },
});

export const MenuBar: React.FC<MenuBarProps> = ({ config, color = "transparent", sx, disableRipple }) => {
    const menuConfig = config;

    // Set up hotkeys for the menu items
    useMenuHotkeys(menuConfig);

    // Memoize the empty state to avoid recreating
    const emptyMenuBar = useMemo(() => (
        <AppBar position="static" elevation={0} color={color} sx={sx}>
            <Toolbar variant="dense" disableGutters={true} role="toolbar"/>
        </AppBar>
    ), [color, sx]);

    if (menuConfig.length === 0) {
        return emptyMenuBar;
    }

    return (
        <AppBar
            position="static"
            elevation={0}
            data-testid="menu-bar-root"
            color={color}
            sx={{
                px: 0,
                minHeight: 0,
                ...sx,
            }}
        >
            <ThemeProvider theme={menuBarTheme}>
                <Toolbar variant="dense" disableGutters={true} sx={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                        <RootMenuRenderer menuConfig={menuConfig} disableRipple={disableRipple} />
                </Toolbar>
            </ThemeProvider>
        </AppBar>
    );
};

export default MenuBar;
