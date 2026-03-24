"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Job {
    id: string;
    title: string;
    department: string;
    location: string | null;
    mapUrl: string | null;
    description: string;
    qualifications: string;
    requirements: string;
    salary: string | null;
    employmentType: string;
    deadline: Date | string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    links: any;
    barangay: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface JobsContextType {
    jobsData: Job[];
    setJobsData: (data: Job[]) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    isAddModalOpen: boolean;
    setIsAddModalOpen: (open: boolean) => void;
    editingData: Job | null;
    setEditingData: (data: Job | null) => void;
    selectedDepartment: string;
    setSelectedDepartment: (department: string) => void;
    currentBarangay?: string | null;
    activeBarangays?: string[];
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export function JobsProvider({ 
    children, 
    initialData,
    currentBarangay,
    activeBarangays = [] 
}: { 
    children: ReactNode; 
    initialData: Job[];
    currentBarangay?: string | null;
    activeBarangays?: string[];
}) {
    const [jobsData, setJobsData] = useState<Job[]>(initialData);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingData, setEditingData] = useState<Job | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState("All");

    useEffect(() => {
        setJobsData(initialData);
    }, [initialData]);

    return (
        <JobsContext.Provider
            value={{
                jobsData,
                setJobsData,
                searchTerm,
                setSearchTerm,
                isAddModalOpen,
                setIsAddModalOpen,
                editingData,
                setEditingData,
                selectedDepartment,
                setSelectedDepartment,
                currentBarangay,
                activeBarangays
            }}
        >
            {children}
        </JobsContext.Provider>
    );
}

export function useJobs() {
    const context = useContext(JobsContext);
    if (context === undefined) {
        throw new Error("useJobs must be used within a JobsProvider");
    }
    return context;
}
