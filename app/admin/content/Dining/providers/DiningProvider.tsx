"use client";

import React, { createContext, useContext, useState } from "react";

export interface Dining {
    id: string;
    name: string;
    description: string | null;
    address: string;
    cuisineType: string | null;
    openingHours: string | null;
    contactNumber: string | null;
    facebookUrl: string | null;
    imageUrl: string | null;
    latitude: number | null;
    longitude: number | null;
    googleMapsUrl: string | null;
    barangay: string | null;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface DiningContextType {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    isAddModalOpen: boolean;
    setIsAddModalOpen: (isOpen: boolean) => void;
    diningData: Dining[];
    editingData: Dining | null;
    setEditingData: (data: Dining | null) => void;
    currentBarangay?: string;
}

const DiningContext = createContext<DiningContextType | undefined>(undefined);

export function DiningProvider({ children, initialData, currentBarangay }: { children: React.ReactNode; initialData: Dining[]; currentBarangay?: string }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [diningData, setDiningData] = useState<Dining[]>(initialData);
    const [editingData, setEditingData] = useState<Dining | null>(null);

    // Whenever initialData from server changes, you might want to sync, 
    // but for simple cases we just use it directly or let the server action revalidate the page.
    React.useEffect(() => {
        setDiningData(initialData);
    }, [initialData]);

    return (
        <DiningContext.Provider value={{ searchTerm, setSearchTerm, isAddModalOpen, setIsAddModalOpen, diningData, editingData, setEditingData, currentBarangay }}>
            {children}
        </DiningContext.Provider>
    );
}

export function useDining() {
    const context = useContext(DiningContext);
    if (context === undefined) {
        throw new Error("useDining must be used within a DiningProvider");
    }
    return context;
}
