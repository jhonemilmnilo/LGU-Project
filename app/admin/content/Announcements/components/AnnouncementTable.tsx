"use client";

import { useAnnouncements, Announcement } from "../providers/AnnouncementProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Edit2, Trash2, Calendar, Megaphone, Bell, Pin, PinOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState } from "react";
import { deleteAnnouncement, toggleAnnouncementStatus, toggleAnnouncementPin } from "@/app/admin/actions";

export function AnnouncementTable() {
    const { announcements, searchTerm, setEditingData, setIsAddModalOpen, selectedCategory, selectedPriority } = useAnnouncements();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const filteredData = announcements.filter((item: Announcement) => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             item.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
        const matchesPriority = selectedPriority === "All" || item.priority === selectedPriority;
        return matchesSearch && matchesCategory && matchesPriority;
    });

    const handleEdit = (item: Announcement) => {
        setEditingData(item);
        setIsAddModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;
        setDeletingId(id);
        try {
            const res = await deleteAnnouncement(id);
            if (res.success) {
                toast.success("Announcement deleted successfully!");
            } else {
                toast.error(res.error || "Failed to delete.");
            }
        } catch {
            toast.error("Failed to delete announcement.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        setTogglingId(id);
        try {
            const res = await toggleAnnouncementStatus(id, !currentStatus);
            if (res.success) {
                toast.success(`Announcement ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
            }
        } catch {
            toast.error("Failed to update status.");
        } finally {
            setTogglingId(null);
        }
    };

    const handleTogglePin = async (id: string, currentPin: boolean) => {
        try {
            const res = await toggleAnnouncementPin(id, !currentPin);
            if (res.success) {
                toast.success(`Announcement ${!currentPin ? 'pinned' : 'unpinned'} successfully!`);
            }
        } catch {
            toast.error("Failed to update pin status.");
        }
    };

    if (filteredData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center border-t border-slate-200 dark:border-[#2a3040]">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-slate-200 dark:ring-white/5">
                    <Megaphone className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">No Matches Found</h3>
                <p className="text-slate-500 font-medium italic max-w-sm mt-2">
                    Walang lumabas na announcement sa criteria mo. Try adjusting your filters or post a new one!
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50/50 dark:bg-[#1a1f2e] hover:bg-slate-50/50 dark:hover:bg-[#1a1f2e] border-y border-slate-200 dark:border-[#2a3040]">
                        <TableHead className="w-[350px] font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-slate-100 h-14 pl-8">Notice Details</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-slate-100">Category</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-slate-100">Priority</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-slate-100">Date Posted</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-slate-100 text-center">Active</TableHead>
                        <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-slate-100 pr-8">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.map((item) => (
                        <TableRow key={item.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-colors border-b border-slate-200 dark:border-[#2a3040]">
                            <TableCell className="pl-8 py-5">
                                <div className="flex flex-col space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        {item.isPinned && <Pin className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />}
                                        <span className="text-slate-900 dark:text-white font-black uppercase italic tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                                            {item.title}
                                        </span>
                                    </div>
                                    <span className="text-[11px] text-slate-500 font-medium italic line-clamp-1 max-w-[300px]">
                                        {item.content}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                    {item.category}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full shadow-sm",
                                        item.priority === "Critical" ? "bg-red-500 animate-pulse" :
                                        item.priority === "High" ? "bg-orange-500" :
                                        item.priority === "Low" ? "bg-slate-400" : "bg-blue-500"
                                    )} />
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-widest italic",
                                        item.priority === "Critical" ? "text-red-500" : "text-slate-600 dark:text-slate-400"
                                    )}>
                                        {item.priority}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center text-slate-500 dark:text-slate-400 text-[11px] font-medium italic">
                                    <Calendar className="w-3.5 h-3.5 mr-2 text-blue-500" />
                                    {format(new Date(item.createdAt), "MMM d, yyyy")}
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <Switch
                                    checked={item.isActive}
                                    onCheckedChange={() => handleToggleStatus(item.id, item.isActive)}
                                    disabled={togglingId === item.id}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </TableCell>
                            <TableCell className="text-right pr-8">
                                <div className="flex justify-end gap-2">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleTogglePin(item.id, item.isPinned)}
                                                    className={cn(
                                                        "h-9 w-9 rounded-xl transition-all",
                                                        item.isPinned 
                                                            ? "text-orange-500 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100" 
                                                            : "text-slate-400 hover:text-orange-500 hover:bg-orange-50"
                                                    )}
                                                >
                                                    {item.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>{item.isPinned ? "Unpin" : "Pin to Top"}</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(item)}
                                                    className="h-9 w-9 rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/40 border border-transparent hover:border-blue-200"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit Announcement</TooltipContent>
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
                                                    className="h-9 w-9 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/40 border border-transparent hover:border-red-200"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Delete Announcement</TooltipContent>
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
