"use client";

import { useJobs, Job } from "../providers/JobsProvider";
import { deleteJob, toggleJobStatus } from "@/app/admin/actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Edit2, Trash2, Building2, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState } from "react";

export function JobsTable() {
    const { jobsData, searchTerm, setEditingData, setIsAddModalOpen, selectedDepartment } = useJobs();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const filteredData = jobsData.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedDepartment === "All" || item.department === selectedDepartment;
        return matchesSearch && matchesCategory;
    });

    const handleEdit = (item: Job) => {
        setEditingData(item);
        setIsAddModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this job posting?")) return;
        setDeletingId(id);
        try {
            await deleteJob(id);
            toast.success("Job posting deleted successfully!");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error("Failed to delete job posting.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        setTogglingId(id);
        try {
            await toggleJobStatus(id, !currentStatus);
            toast.success(`Job marked as ${!currentStatus ? 'Active' : 'Closed'} successfully!`);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error("Failed to update status.");
        } finally {
            setTogglingId(null);
        }
    };

    if (filteredData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-t border-slate-200 dark:border-[#2a3040]">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Briefcase className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Job Postings Found</h3>
                <p className="text-slate-500 max-w-sm">
                    No jobs match your search criteria. Try adjusting your filters or post a new job opening.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50/50 dark:bg-[#1a1f2e] hover:bg-slate-50/50 dark:hover:bg-[#1a1f2e] border-y border-slate-200 dark:border-[#2a3040]">
                        <TableHead className="w-[280px] font-bold text-slate-900 dark:text-slate-100 h-12">Job Role</TableHead>
                        <TableHead className="font-bold text-slate-900 dark:text-slate-100">Department/Office</TableHead>
                        <TableHead className="font-bold text-slate-900 dark:text-slate-100">Type</TableHead>
                        <TableHead className="font-bold text-slate-900 dark:text-slate-100">Deadline</TableHead>
                        <TableHead className="font-bold text-slate-900 dark:text-slate-100 text-center">Active</TableHead>
                        <TableHead className="text-right font-bold text-slate-900 dark:text-slate-100">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.map((item) => (
                        <TableRow key={item.id} className="group hover:bg-primary/5 transition-colors border-b border-slate-200 dark:border-[#2a3040]">
                            <TableCell className="font-medium">
                                <div className="flex flex-col space-y-1">
                                    <span className="text-slate-900 dark:text-white font-bold leading-tight">{item.title}</span>
                                    <span className="text-xs text-slate-500 line-clamp-1">{item.salary || "Salary Unspecified"}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col space-y-1">
                                    <div className="flex items-center text-slate-900 dark:text-white font-bold text-sm">
                                        <Building2 className="w-3.5 h-3.5 mr-1 text-primary" />
                                        {item.department}
                                    </div>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black italic">{item.location || "Office Based"}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                                    {item.employmentType}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                                    {item.deadline ? format(new Date(item.deadline), "MMM d, yyyy") : "Until Filled"}
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <Switch
                                    checked={item.isActive}
                                    onCheckedChange={() => handleToggleStatus(item.id, item.isActive)}
                                    disabled={togglingId === item.id}
                                    className="data-[state=checked]:bg-primary"
                                />
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(item)}
                                                    className="h-8 w-8 text-primary hover:text-primary/90 hover:bg-primary/10 dark:hover:bg-primary/20"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit Job</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(item.id)}
                                                    disabled={deletingId === item.id}
                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Delete Job</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
