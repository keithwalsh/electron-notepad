/**
 * @fileoverview Helper to render a menu item based on its kind, centralizing
 * the mapping logic used by both root and submenu renderers.
 */

import React from "react";
import { MenuItems } from "../types";
import { KindActionItem, KindCustomItem, KindDividerItem, CascadingSubmenu } from "./../components";

export interface RenderItemOptions {
    item: MenuItems;
    baseId: string | number;
    useHover?: boolean;
}

export const renderMenuItemByKind = ({ item, baseId, useHover = true }: RenderItemOptions): React.ReactNode => {
    if (item.kind === "submenu") {
        return (
            <CascadingSubmenu
                key={`submenu-${baseId}`}
                {...item}
                popupId={`submenu-${baseId}`}
                useHover={useHover}
            />
        );
    }
    if (item.kind === "divider") {
        return (
            <KindDividerItem
                key={`divider-${baseId}`}
                {...item}
            />
        );
    }
    if (item.kind === "custom") {
        return (
            <KindCustomItem
                key={`custom-${baseId}`}
                {...item}
            />
        );
    }
    if (item.kind === "action") {
        return (
            <KindActionItem
                key={`action-${baseId}`}
                {...item}
            />
        );
    }
    return null;
};

export default renderMenuItemByKind;


