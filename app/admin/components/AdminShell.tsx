"use client";

import * as React from "react";
import { SidebarProvider } from "./SidebarContext";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

interface AdminShellProps {
    children: React.ReactNode;
    session: {
        user?: {
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role?: string;
            managedBarangay?: string | null;
        };
    };
    logoUrl?: string;
    brandWord1?: string;
    brandWord2?: string;
    themeColor?: string;
    pendingReportsCount?: number;
    pendingResidentsCount?: number;
    pendingTransactionsCount?: number;
}

export function AdminShell({
    children,
    session,
    logoUrl,
    brandWord1,
    brandWord2,
    themeColor,
    pendingReportsCount,
    pendingResidentsCount,
    pendingTransactionsCount,
}: AdminShellProps) {
    return (
        <SidebarProvider>
            <Sidebar
                session={session}
                logoUrl={logoUrl}
                brandWord1={brandWord1}
                brandWord2={brandWord2}
                themeColor={themeColor}
                pendingReportsCount={pendingReportsCount}
                pendingResidentsCount={pendingResidentsCount}
                pendingTransactionsCount={pendingTransactionsCount}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNav
                    session={session}
                    themeColor={themeColor}
                    brandWord1={brandWord1}
                    brandWord2={brandWord2}
                    logoUrl={logoUrl}
                />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}
