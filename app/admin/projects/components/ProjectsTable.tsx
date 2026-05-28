"use client";

import { useProjects } from "../providers/ProjectsProvider";
import { deleteProject, toggleProjectStatus } from "@/app/admin/actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Edit2, Trash2, FolderKanban, MapPin, Building2, Calendar as CalIcon } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function ProjectsTable() {
    const { projectsData, searchTerm, setEditingData, setIsAddModalOpen, selectedCategory, selectedStatus } = useProjects();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const filteredData = projectsData.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
        const matchesStatus = selectedStatus === "All" || item.status === selectedStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

     
    const handleEdit = (item: any) => {
        setEditingData(item);
        setIsAddModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;
        setDeletingId(id);
        try {
            await deleteProject(id);
            toast.success("Project deleted successfully!");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error("Failed to delete project.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        setTogglingId(id);
        try {
            await toggleProjectStatus(id, !currentStatus);
            toast.success(`Project ${!currentStatus ? 'published' : 'hidden'} successfully!`);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error("Failed to update status.");
        } finally {
            setTogglingId(null);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const colors: Record<string, string> = {
            "Planned": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800",
            "Ongoing": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800",
            "Completed": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
            "Suspended": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800",
        };
        const colorClass = colors[status] || "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
        return (
            <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", colorClass)}>
                {status}
            </span>
        );
    };

    if (filteredData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-t border-slate-200 dark:border-[#2a3040]">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <FolderKanban className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Projects Found</h3>
                <p className="text-slate-500 max-w-sm">
                    No projects match your current filters. Clear the search or add a new project.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50/50 dark:bg-[#1a1f2e] hover:bg-slate-50/50 dark:hover:bg-[#1a1f2e] border-y border-slate-200 dark:border-[#2a3040]">
                        <TableHead className="w-[300px] font-bold text-slate-900 dark:text-slate-100 h-12">Project Details</TableHead>
                        <TableHead className="font-bold text-slate-900 dark:text-slate-100">Status & Progress</TableHead>
                        <TableHead className="font-bold text-slate-900 dark:text-slate-100">Budget</TableHead>
                        <TableHead className="font-bold text-slate-900 dark:text-slate-100 text-center">Published</TableHead>
                        <TableHead className="text-right font-bold text-slate-900 dark:text-slate-100">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.map((item) => (
                        <TableRow key={item.id} className="group hover:bg-primary/10/50 dark:hover:bg-blue-900/10 transition-colors border-b border-slate-200 dark:border-[#2a3040]">
                            <TableCell>
                                <div className="flex items-center space-x-4">
                                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                                        {item.imageUrl ? (
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.title}
                                                width={56}
                                                height={56}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <FolderKanban className="w-6 h-6 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight line-clamp-1">
                                            {item.title}
                                        </span>
                                        <div className="flex items-center text-xs text-slate-500">
                                            <span className="font-medium text-primary dark:text-primary mr-2">{item.category}</span>
                                        </div>
                                        <div className="flex items-center text-xs text-slate-500">
                                            <MapPin className="w-3 h-3 mr-1" />
                                            <span className="truncate max-w-[150px]">{item.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col space-y-2">
                                    <div className="flex justify-between items-center w-[140px]">
                                        <StatusBadge status={item.status} />
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.progress}%</span>
                                    </div>
                                    <div className="w-[140px] h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${item.progress}%` }}
                                        />
                                    </div>
                                    {item.endDate && (
                                        <div className="flex items-center text-xs text-slate-500 pt-1">
                                            <CalIcon className="w-3 h-3 mr-1" />
                                            {format(new Date(item.endDate), "MMM d, yyyy")}
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col space-y-1 text-sm">
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {item.budget || "N/A"}
                                    </span>
                                    {item.contractor && (
                                        <div className="flex items-center text-xs text-slate-500 max-w-[140px] truncate">
                                            <Building2 className="w-3 h-3 mr-1 shrink-0" />
                                            <span className="truncate">{item.contractor}</span>
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <Switch
                                    checked={item.isPublished}
                                    onCheckedChange={() => handleToggleStatus(item.id, item.isPublished)}
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
                                                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10 dark:hover:bg-blue-900/50"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit Project</TooltipContent>
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
                                            <TooltipContent>Delete Project</TooltipContent>
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
