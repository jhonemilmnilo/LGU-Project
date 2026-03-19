"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Official {
    id: string;
    name: string;
    position: string;
    contactNumber: string | null;
    email: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    links: any;
    bio: string | null;
    education: string | null;
    motto: string | null;
    achievements: string | null;
    imageUrl: string | null;
    termStart: Date | null;
    termEnd: Date | null;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface OfficialsContextType {
    officialsData: Official[];
    setOfficialsData: (data: Official[]) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    isAddModalOpen: boolean;
    setIsAddModalOpen: (open: boolean) => void;
    editingData: Official | null;
    setEditingData: (data: Official | null) => void;
    selectedPosition: string;
    setSelectedPosition: (position: string) => void;
}

const OfficialsContext = createContext<OfficialsContextType | undefined>(undefined);

export function OfficialsProvider({ children, initialData }: { children: ReactNode; initialData: Official[] }) {
    const [officialsData, setOfficialsData] = useState<Official[]>(initialData);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editingData, setEditingData] = useState<any | null>(null);
    const [selectedPosition, setSelectedPosition] = useState("All");

    useEffect(() => {
        setOfficialsData(initialData);
    }, [initialData]);

    return (
        <OfficialsContext.Provider
            value={{
                officialsData,
                setOfficialsData,
                searchTerm,
                setSearchTerm,
                isAddModalOpen,
                setIsAddModalOpen,
                editingData,
                setEditingData,
                selectedPosition,
                setSelectedPosition,
            }}
        >
            {children}
        </OfficialsContext.Provider>
    );
}

export function useOfficials() {
    const context = useContext(OfficialsContext);
    if (context === undefined) {
        throw new Error("useOfficials must be used within an OfficialsProvider");
    }
    return context;
}
