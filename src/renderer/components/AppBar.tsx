/**
 * @fileoverview Implements the main MenuBar component, rendering a customisable
 * menu bar using Material-UI components and popup state management.
 */

import React, { useMemo } from "react";
import { AppBar as MuiAppBar, Box, createTheme, ThemeProvider, Toolbar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { MenuBarProps } from "./menubar/types/types";
import { useMenuHotkeys } from "./menubar/utils";
import { MenuBar } from "./menubar";
import { LuNotepadText } from "react-icons/lu";
import WindowControls from "./WindowControls";

export const AppBar: React.FC<MenuBarProps> = ({ config, color = "transparent", sx, themeMode, onToggleTheme, pasteReplaceRules, onChangePasteReplaceRules }) => {
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
        <MuiAppBar position="sticky" elevation={0} color={color} sx={sx}>
            <Toolbar variant="dense" disableGutters={true} role="toolbar"/>
        </MuiAppBar>
    ), [color, sx]);

    if (menuConfig.length === 0) {
        return emptyMenuBar;
    }

    return (
        <MuiAppBar
            position="sticky"
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
                <Toolbar variant="dense" disableGutters={true} sx={{ display: 'flex', width: '100%', alignItems: 'center', WebkitAppRegion: 'drag' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', position: 'relative', zIndex: 1, WebkitAppRegion: 'no-drag' }}>
                        <Box sx={{ mt: '4px', mx: '10px'}}>
                            <LuNotepadText size={18} color="inherit" />
                        </Box>
                        <MenuBar menuConfig={menuConfig} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ WebkitAppRegion: 'no-drag' }}>
                        <WindowControls themeMode={themeMode} onToggleTheme={onToggleTheme} pasteReplaceRules={pasteReplaceRules} onChangePasteReplaceRules={onChangePasteReplaceRules} />
                    </Box>
                </Toolbar>
            </ThemeProvider>
        </MuiAppBar>
    );
}

export default AppBar;
