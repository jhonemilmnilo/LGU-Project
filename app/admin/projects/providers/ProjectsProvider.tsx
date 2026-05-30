"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Project {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    location: string;
    budget: string | null;
    contractor: string | null;
    startDate: Date | null;
    endDate: Date | null;
    progress: number;
    imageUrl: string | null;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface ProjectsContextType {
    projectsData: Project[];
    setProjectsData: (data: Project[]) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    isAddModalOpen: boolean;
    setIsAddModalOpen: (open: boolean) => void;
    editingData: Project | null;
    setEditingData: (data: Project | null) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    selectedStatus: string;
    setSelectedStatus: (status: string) => void;
    currentBarangay?: string;
    activeBarangays?: string[];
    themeColor: string;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export function ProjectsProvider({ 
    children, 
    initialData, 
    currentBarangay, 
    activeBarangays = [] 
}: { 
    children: ReactNode; 
    initialData: Project[]; 
    currentBarangay?: string; 
    activeBarangays?: string[] 
}) {
    const [projectsData, setProjectsData] = useState<Project[]>(initialData);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
     
    const [editingData, setEditingData] = useState<any | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [themeColor, setThemeColor] = useState("#2563eb");

    useEffect(() => {
        setProjectsData(initialData);
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
        <ProjectsContext.Provider
            value={{
                projectsData,
                setProjectsData,
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
                currentBarangay,
                activeBarangays,
                themeColor
            }}
        >
            {children}
        </ProjectsContext.Provider>
    );
}

export function useProjects() {
    const context = useContext(ProjectsContext);
    if (context === undefined) {
        throw new Error("useProjects must be used within a ProjectsProvider");
    }
    return context;
}
