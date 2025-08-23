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
	const cachedButtonRectsRef = React.useRef<Array<{ key: string; rect: DOMRect }>>([]);
	const activeKeyRef = React.useRef<string | null>(null);

	const registerButtonRef = React.useCallback((key: string, ref: HTMLButtonElement | null) => {
		if (ref) buttonRefs.current.set(key, ref);
		else buttonRefs.current.delete(key);
	}, []);

	const onActivate = React.useCallback((key: string) => {
		// Mark the group as active and set the starting active key
		setIsActive(true);
		setActiveKey(key);

		// Cache button rects at activation start
		const rects = Array.from(buttonRefs.current.entries())
			.map(([k, element]) => (element ? { key: k, rect: element.getBoundingClientRect() } : null))
			.filter((v): v is { key: string; rect: DOMRect } => Boolean(v));
		cachedButtonRectsRef.current = rects;
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
		if (!isActive) {
			// Clear cache when session ends
			cachedButtonRectsRef.current = [];
			return;
		}

		// Use a throttled version to reduce performance impact
		let animationFrameId: number | null = null;
		
		const handleGlobalMouseMove = (event: MouseEvent) => {
			if (animationFrameId) return; // Skip if already scheduled
			
			animationFrameId = requestAnimationFrame(() => {
				animationFrameId = null;
				
				for (const { key, rect } of cachedButtonRectsRef.current) {
					if (
						event.clientX >= rect.left &&
						event.clientX <= rect.right &&
						event.clientY >= rect.top &&
						event.clientY <= rect.bottom
					) {
						if (key !== activeKeyRef.current) {
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
			cachedButtonRectsRef.current = [];
		};
	}, [isActive]);

	// Keep a live reference of the current activeKey for the mousemove handler
	React.useEffect(() => {
		activeKeyRef.current = activeKey;
	}, [activeKey]);

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


