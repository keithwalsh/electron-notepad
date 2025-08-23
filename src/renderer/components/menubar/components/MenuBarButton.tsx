/**
 * @fileoverview Encapsulates a single root menu button with its popup state
 * and associated cascading menu rendering. Uses group context to coordinate
 * active state, hover navigation, and root-close behavior.
 */

import React from "react";
import { Button, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { usePopupState } from "material-ui-popup-state/hooks";
import { RootMenu } from "./RootMenu";
import { MenuConfig } from "../types";
import { useMenuBarButtonGroup } from ".";

// Stable style helpers
const secondaryText90 = (theme: any) => alpha(theme.palette.text.secondary, 0.9);
const BUTTON_SX_BASE = {
	textTransform: "none",
	px: 1.25,
	py: 0.25,
	minWidth: 0,
	WebkitAppRegion: 'no-drag'
};
const BUTTON_HOVER_SELECTED_SX = { backgroundColor: 'action.selected' };
const BUTTON_HOVER_DEFAULT_SX = { backgroundColor: 'action.hover' };
const LABEL_TYPOGRAPHY_SX = { color: secondaryText90 };


export interface MenuBarButtonProps {
	menu: MenuConfig;
}

const MenuBarButtonComponent: React.FC<MenuBarButtonProps> = ({ menu }) => {
	const menuId = menu.id ?? menu.label;
	const popupState = usePopupState({
		variant: "popover" as const,
		popupId: `menu-${menuId}`,
	});

	const buttonRef = React.useRef<HTMLButtonElement | null>(null);
	const { isActive, activeKey, registerButtonRef, onActivate, onHoverNavigate, onRootClose } = useMenuBarButtonGroup();
	
	// Handle button ref callback
	const handleButtonRef = React.useCallback((ref: HTMLButtonElement | null) => {
		buttonRef.current = ref;
		registerButtonRef(menuId, ref);
	}, [registerButtonRef, menuId]);

	React.useEffect(() => {
		const isOpenByGroup = activeKey === menuId;
		if (isOpenByGroup && !popupState.isOpen) {
			if (!popupState.anchorEl && buttonRef.current) {
				popupState.setAnchorEl(buttonRef.current as any);
			}
			popupState.open();
		} else if (!isOpenByGroup && popupState.isOpen && isActive) {
			popupState.close();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeKey]);

	// Deactivate group when the currently active (key) menu closes
	const wasOpenRef = React.useRef<boolean>(false);
	React.useEffect(() => {
		const wasOpen = wasOpenRef.current;
		const isOpenByGroup = activeKey === menuId;
		if (wasOpen && !popupState.isOpen && isOpenByGroup) {
			onRootClose?.();
		}
		wasOpenRef.current = popupState.isOpen;
	}, [popupState.isOpen, activeKey, onRootClose, menuId]);

	const handleClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
		popupState.setAnchorEl(event.currentTarget as any);
		onActivate?.(menuId);
		if (!popupState.isOpen) popupState.open();
		else popupState.close();
	}, [onActivate, popupState, menuId]);

	const handleMouseEnter = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
		if (!isActive) return;
		popupState.setAnchorEl(event.currentTarget as any);
		onHoverNavigate?.(menuId);
	}, [isActive, onHoverNavigate, popupState, menuId]);

	return (
		<React.Fragment>
			<Button
				ref={handleButtonRef}
				onClick={handleClick}
				onPointerEnter={handleMouseEnter as any}
				color="inherit"
				sx={[
					BUTTON_SX_BASE,
					{
						backgroundColor: popupState.isOpen ? 'action.selected' : 'transparent',
						'&:hover': popupState.isOpen ? BUTTON_HOVER_SELECTED_SX : BUTTON_HOVER_DEFAULT_SX,
					}
				]}
				disabled={menu.disabled}
				disableRipple
			>
				<Typography
					variant="body2"
					sx={LABEL_TYPOGRAPHY_SX}
				>
					{menu.label}
				</Typography>
			</Button>
			<RootMenu
				menuItems={menu.items}
				popupState={popupState}
				useHover={true}
				onRootClose={onRootClose}
			/>
		</React.Fragment>
	);
};

export const MenuBarButton = React.memo(MenuBarButtonComponent);

export default MenuBarButton;


