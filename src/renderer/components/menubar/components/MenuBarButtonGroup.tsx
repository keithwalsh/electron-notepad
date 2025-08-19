/**
 * @fileoverview Provides a context-based group wrapper to coordinate root menu button
 * behaviour including active state, hover navigation, and root-close handling across
 * all root menu buttons.
 */

import React from "react";

export interface MenuBarButtonGroupContextValue {
	isActive: boolean;
	activeKey: string | null;
	registerButtonRef: (key: string, ref: HTMLButtonElement | null) => void;
	onActivate: (key: string) => void;
	onHoverNavigate: (key: string) => void;
	onRootClose: () => void;
}

export const MenuBarButtonGroupContext = React.createContext<MenuBarButtonGroupContextValue>({
	isActive: false,
	activeKey: null,
	registerButtonRef: () => {},
	onActivate: () => {},
	onHoverNavigate: () => {},
	onRootClose: () => {},
});

export interface MenuBarButtonGroupProps {
	children: React.ReactNode;
}

export const MenuBarButtonGroup: React.FC<MenuBarButtonGroupProps> = ({ children }) => {
	const [isActive, setIsActive] = React.useState<boolean>(false);
	const [activeKey, setActiveKey] = React.useState<string | null>(null);

	const buttonRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

	const registerButtonRef = React.useCallback((key: string, ref: HTMLButtonElement | null) => {
		if (ref) buttonRefs.current.set(key, ref);
		else buttonRefs.current.delete(key);
	}, []);

	const onActivate = React.useCallback((key: string) => {
		setIsActive(true);
		setActiveKey(key);
	}, []);

	const onHoverNavigate = React.useCallback((key: string) => {
		if (!isActive) return;
		setActiveKey(key);
	}, [isActive]);

	const onRootClose = React.useCallback(() => {
		setIsActive(false);
		setActiveKey(null);
	}, []);

	React.useEffect(() => {
		if (!isActive) return;

		// Use a throttled version to reduce performance impact
		let animationFrameId: number | null = null;
		
		const handleGlobalMouseMove = (event: MouseEvent) => {
			if (animationFrameId) return; // Skip if already scheduled
			
			animationFrameId = requestAnimationFrame(() => {
				animationFrameId = null;
				
				// Cache button rects to avoid repeated getBoundingClientRect calls
				const buttonData = Array.from(buttonRefs.current.entries()).map(([key, element]) => ({
					key,
					rect: element ? element.getBoundingClientRect() : null
				}));
				
				for (const { key, rect } of buttonData) {
					if (!rect) continue;
					if (
						event.clientX >= rect.left &&
						event.clientX <= rect.right &&
						event.clientY >= rect.top &&
						event.clientY <= rect.bottom
					) {
						if (key !== activeKey) {
							setActiveKey(key);
						}
						return;
					}
				}
			});
		};

		document.addEventListener("mousemove", handleGlobalMouseMove, { passive: true });
		return () => {
			document.removeEventListener("mousemove", handleGlobalMouseMove);
			if (animationFrameId) {
				cancelAnimationFrame(animationFrameId);
			}
		};
	}, [isActive, activeKey]);

	const contextValue = React.useMemo(
		() => ({ isActive, activeKey, registerButtonRef, onActivate, onHoverNavigate, onRootClose }),
		[isActive, activeKey, registerButtonRef, onActivate, onHoverNavigate, onRootClose]
	);

	return (
		<MenuBarButtonGroupContext.Provider value={contextValue}>
			{children}
		</MenuBarButtonGroupContext.Provider>
	);
};

export const useMenuBarButtonGroup = () => React.useContext(MenuBarButtonGroupContext);

export default MenuBarButtonGroup;


