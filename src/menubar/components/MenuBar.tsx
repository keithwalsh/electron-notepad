/**
 * @fileoverview Implements the main MenuBar component, rendering a customisable
 * menu bar using Material-UI components and popup state management.
 */

import React from "react";
import { AppBar, createTheme, ThemeProvider, Toolbar, Box } from "@mui/material";
import { MenuBarProps } from "../types";
import { useMenuHotkeys } from "../utils";
import { RootMenuRenderer } from "./RootMenuRenderer";
import { WindowControls } from "../../renderer/components/WindowControls";

export const MenuBar: React.FC<MenuBarProps> = ({ config, color = "transparent", sx, disableRipple }) => {
    const menuConfig = config;

    // Set up hotkeys for the menu items
    useMenuHotkeys(menuConfig);

    if (menuConfig.length === 0) {
        return (
            <AppBar position="static" elevation={0} color={color} sx={sx}>
                <Toolbar variant="dense" disableGutters={true} role="toolbar"/>
            </AppBar>
        );
    }

    

const theme = createTheme({
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
    })

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
            <ThemeProvider theme={theme}>
                <Toolbar variant="dense" disableGutters={true} sx={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                        <RootMenuRenderer menuConfig={menuConfig} disableRipple={disableRipple} />
                </Toolbar>
            </ThemeProvider>
        </AppBar>
    );
};

export default MenuBar;
