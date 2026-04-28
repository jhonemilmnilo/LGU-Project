"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Announcement {
    id: string;
    title: string;
    content: string;
    priority: string;
    category: string;
    isPinned: boolean;
    isActive: boolean;
    barangay: string | null;
    expiryDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

interface AnnouncementContextType {
    announcements: Announcement[];
    setAnnouncements: (data: Announcement[]) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    isAddModalOpen: boolean;
    setIsAddModalOpen: (open: boolean) => void;
    editingData: Announcement | null;
    setEditingData: (data: Announcement | null) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    selectedPriority: string;
    setSelectedPriority: (priority: string) => void;
    currentBarangay?: string;
    activeBarangays?: string[];
    themeColor: string;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    itemsPerPage: number;
    setItemsPerPage: (count: number) => void;
}

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);

export function AnnouncementProvider({ children, initialData, currentBarangay, activeBarangays = [] }: { children: ReactNode; initialData: Announcement[]; currentBarangay?: string; activeBarangays?: string[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [announcements, setAnnouncements] = useState<Announcement[]>(initialData);
    const [editingData, setEditingData] = useState<Announcement | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedPriority, setSelectedPriority] = useState("All");
    const [themeColor, setThemeColor] = useState("#2563eb");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/settings');
                const data = await response.json();
                if (data.themeColor) {
                    setThemeColor(data.themeColor);
                }
            } catch (error) {
                console.error('Error fetching theme settings:', error);
            }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        setAnnouncements(initialData);
    }, [initialData]);

    return (
        <AnnouncementContext.Provider
            value={{
                announcements,
                setAnnouncements,
                searchTerm,
                setSearchTerm,
                isAddModalOpen,
                setIsAddModalOpen,
                editingData,
                setEditingData,
                selectedCategory,
                setSelectedCategory,
                selectedPriority,
                setSelectedPriority,
                currentBarangay,
                activeBarangays,
                themeColor,
                currentPage,
                setCurrentPage,
                itemsPerPage,
                setItemsPerPage,
            }}
        >
            {children}
        </AnnouncementContext.Provider>
    );
}

export function useAnnouncements() {
    const context = useContext(AnnouncementContext);
    if (context === undefined) {
        throw new Error("useAnnouncements must be used within an AnnouncementProvider");
    }
    return context;
}
