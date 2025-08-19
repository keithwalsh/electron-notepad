/**
 * @fileoverview React context for cascading menus. Extracted to helpers.
 */

import React from "react";
import { CascadingContextType } from "../types";

export const CascadingContext = React.createContext<CascadingContextType>({
	parentPopupState: null,
	rootPopupState: null,
});

export default CascadingContext;


