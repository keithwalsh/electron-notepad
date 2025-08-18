/**
 * @fileoverview Implements the main MenuBar component, rendering a customisable
 * menu bar using Material-UI components and popup state management.
 */

import React, { useMemo } from "react";
import { AppBar, Box, createTheme, ThemeProvider, Toolbar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { MenuBarProps } from "../types";
import { useMenuHotkeys } from "../utils";
import { RootMenuRenderer } from "./RootMenuRenderer";
import { LuNotepadText } from "react-icons/lu";
import WindowControls from "../../renderer/components/WindowControls";

export const MenuBar: React.FC<MenuBarProps> = ({ config, color = "transparent", sx, disableRipple, themeMode, onToggleTheme }) => {
    const menuConfig = config;

    // Set up hotkeys for the menu items
    useMenuHotkeys(menuConfig);

    const outerTheme = useTheme();
    const menuBarTheme = useMemo(() => createTheme({
        ...outerTheme,
        components: {
            ...outerTheme.components,
            MuiToolbar: {
                styleOverrides: {
                    dense: {
                        minHeight: 0,
                        height: 32,
                        px: 0,
                    }
                }
            }
        }
    }), [outerTheme]);

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
                    <Box sx={{ mt: '4px', mx: '10px'}}>
                        <LuNotepadText size={18} color="inherit" />
                    </Box>
                    <RootMenuRenderer menuConfig={menuConfig} disableRipple={disableRipple} />
                    <WindowControls themeMode={themeMode} onToggleTheme={onToggleTheme} />
                </Toolbar>
            </ThemeProvider>
        </AppBar>
    );
}

export default MenuBar;
