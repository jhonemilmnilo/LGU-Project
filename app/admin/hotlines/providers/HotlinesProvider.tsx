"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Hotline {
    id: string;
    name: string;
    category: string;
    mobileNumber: string | null;
    telephone: string | null;
    address: string | null;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface HotlinesContextType {
    hotlinesData: Hotline[];
    setHotlinesData: (data: Hotline[]) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    isAddModalOpen: boolean;
    setIsAddModalOpen: (open: boolean) => void;
    editingData: Hotline | null;
    setEditingData: (data: Hotline | null) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    selectedStatus: string;
    setSelectedStatus: (status: string) => void;
    themeColor: string;
}

const HotlinesContext = createContext<HotlinesContextType | undefined>(undefined);

export function HotlinesProvider({ children, initialData }: { children: ReactNode; initialData: Hotline[] }) {
    const [hotlinesData, setHotlinesData] = useState<Hotline[]>(initialData);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingData, setEditingData] = useState<Hotline | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [themeColor, setThemeColor] = useState("#2563eb");

    useEffect(() => {
        setHotlinesData(initialData);
    }, [initialData]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch("/api/settings");
                const data = await response.json();
                if (data.themeColor) {
                    setThemeColor(data.themeColor);
                }
            } catch (error) {
                console.error("Error fetching theme settings:", error);
            }
        };
        fetchSettings();
    }, []);

    return (
        <HotlinesContext.Provider
            value={{
                hotlinesData,
                setHotlinesData,
                searchTerm,
                setSearchTerm,
                isAddModalOpen,
                setIsAddModalOpen,
                editingData,
                setEditingData,
                selectedCategory,
                setSelectedCategory,
                selectedStatus,
                setSelectedStatus,
                themeColor,
            }}
        >
            {children}
        </HotlinesContext.Provider>
    );
}

export function useHotlines() {
    const context = useContext(HotlinesContext);
    if (context === undefined) {
        throw new Error("useHotlines must be used within a HotlinesProvider");
    }
    return context;
}