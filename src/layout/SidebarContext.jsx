import { createContext, useContext } from "react";

/**
 * Lets any top header open the dashboard sidebar on mobile without
 * threading props through every page.
 */
export const SidebarContext = createContext({ openSidebar: () => {} });

export const useSidebar = () => useContext(SidebarContext);
