"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { BarangayProvider } from "../providers/BarangayProvider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <BarangayProvider>
                {children}
                <Toaster position="top-center" richColors />
            </BarangayProvider>
        </SessionProvider>
    );
}
