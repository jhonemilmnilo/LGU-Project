"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface BarangayContextType {
    selectedBarangay: string;
    setSelectedBarangay: (barangay: string) => void;
}

const BarangayContext = createContext<BarangayContextType | undefined>(undefined);

export function BarangayProvider({ children }: { children: React.ReactNode }) {
    const [selectedBarangay, setSelectedBarangay] = useState<string>("All");

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("selectedBarangay");
        if (saved) {
            setSelectedBarangay(saved);
        }
    }, []);

    // Save to localStorage on change
    const updateBarangay = (value: string) => {
        setSelectedBarangay(value);
        localStorage.setItem("selectedBarangay", value);
    };

    return (
        <BarangayContext.Provider value={{ selectedBarangay, setSelectedBarangay: updateBarangay }}>
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
