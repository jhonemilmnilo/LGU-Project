"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Job {
    id: string;
    title: string;
    department: string;
    location: string | null;
    description: string;
    qualifications: string;
    requirements: string;
    salary: string | null;
    employmentType: string;
    deadline: Date | string | null;
    links: any;
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
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export function JobsProvider({ children, initialData }: { children: ReactNode; initialData: Job[] }) {
    const [jobsData, setJobsData] = useState<Job[]>(initialData);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editingData, setEditingData] = useState<any | null>(null);
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
