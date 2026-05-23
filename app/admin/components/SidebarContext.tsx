"use client";
import * as React from "react";

interface SidebarContextValue {
    isOpen: boolean;
    toggle: () => void;
    close: () => void;
}

export const SidebarContext = React.createContext<SidebarContextValue>({
    isOpen: true,
    toggle: () => {},
    close: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = React.useState(true);
    const toggle = React.useCallback(() => setIsOpen((v) => !v), []);
    const close = React.useCallback(() => setIsOpen(false), []);
    return (
        <SidebarContext.Provider value={{ isOpen, toggle, close }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    return React.useContext(SidebarContext);
}
