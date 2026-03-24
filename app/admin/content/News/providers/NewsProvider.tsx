"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface News {
    id: string;
    title: string;
    content: string;
    category: string;
    author: string | null;
    imageUrl: string | null;
    publishDate: Date;
    barangay: string | null;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface NewsContextType {
    newsData: News[];
    setNewsData: (data: News[]) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    isAddModalOpen: boolean;
    setIsAddModalOpen: (open: boolean) => void;
    editingData: News | null;
    setEditingData: (data: News | null) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    currentBarangay?: string;
    activeBarangays?: string[];
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export function NewsProvider({ children, initialData, currentBarangay, activeBarangays = [] }: { children: ReactNode; initialData: News[]; currentBarangay?: string; activeBarangays?: string[] }) {
    const [newsData, setNewsData] = useState<News[]>(initialData);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editingData, setEditingData] = useState<any | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("All");

    useEffect(() => {
        setNewsData(initialData);
    }, [initialData]);

    return (
        <NewsContext.Provider
            value={{
                newsData,
                setNewsData,
                searchTerm,
                setSearchTerm,
                isAddModalOpen,
                setIsAddModalOpen,
                editingData,
                setEditingData,
                selectedCategory,
                setSelectedCategory,
                currentBarangay,
                activeBarangays,
            }}
        >
            {children}
        </NewsContext.Provider>
    );
}

export function useNews() {
    const context = useContext(NewsContext);
    if (context === undefined) {
        throw new Error("useNews must be used within a NewsProvider");
    }
    return context;
}
