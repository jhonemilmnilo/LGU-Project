"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface BarangayContextType {
    selectedBarangay: string;
    setSelectedBarangay: (barangay: string) => void;
    isLoading: boolean;
}

const BarangayContext = createContext<BarangayContextType | undefined>(undefined);

export function BarangayProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [selectedBarangay, setSelectedBarangay] = useState<string>("All");
    const [isLoading, setIsLoading] = useState(false);

    // Sync state with URL and localStorage
    useEffect(() => {
        setIsLoading(false); // Hide splash when URL settles
        const urlBarangay = searchParams.get("barangay");
        const saved = localStorage.getItem("selectedBarangay");

        if (urlBarangay) {
            setSelectedBarangay(urlBarangay);
        } else if (saved && saved !== "All") {
            // If no URL param, but we have a saved preference, update URL
            const params = new URLSearchParams(searchParams.toString());
            params.set("barangay", saved);
            router.replace(`${pathname}?${params.toString()}`);
            setSelectedBarangay(saved);
        }
    }, [searchParams, pathname, router]);

    const updateBarangay = (value: string) => {
        setIsLoading(true);
        setSelectedBarangay(value);
        localStorage.setItem("selectedBarangay", value);

        const params = new URLSearchParams(searchParams.toString());
        if (value === "All") {
            params.delete("barangay");
        } else {
            params.set("barangay", value);
        }
        
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <BarangayContext.Provider value={{ selectedBarangay, setSelectedBarangay: updateBarangay, isLoading }}>
            {children}
        </BarangayContext.Provider>
    );
}

export function useBarangay() {
    const context = useContext(BarangayContext);
    if (context === undefined) {
        throw new Error("useBarangay must be used within a BarangayProvider");
    }
    return context;
}
