"use client";

import { useHotlines, Hotline } from "../providers/HotlinesProvider";
import { deleteHotline, toggleHotlineStatus } from "@/app/admin/actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Edit2, Trash2, Phone, PhoneCall, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useState, type CSSProperties } from "react";

export function HotlinesTable() {
    const { hotlinesData, searchTerm, setEditingData, setIsAddModalOpen, selectedCategory, selectedStatus, themeColor } = useHotlines();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const filteredData = hotlinesData.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
        const matchesStatus = selectedStatus === "All" || 
            (selectedStatus === "Active" && item.isActive) ||
            (selectedStatus === "Hidden" && !item.isActive);
        return matchesSearch && matchesCategory && matchesStatus;
    }).sort((a, b) => a.order - b.order);

    const handleEdit = (item: Hotline) => {
        setEditingData(item);
        setIsAddModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this hotline entry?")) return;
        setDeletingId(id);
        try {
            await deleteHotline(id);
            toast.success("Hotline entry deleted successfully!");
        } catch {
            toast.error("Failed to delete hotline element.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        setTogglingId(id);
        try {
            await toggleHotlineStatus(id, !currentStatus);
            toast.success(`Hotline ${!currentStatus ? 'published' : 'hidden'} successfully!`);
        } catch {
            toast.error("Failed to update status.");
        } finally {
            setTogglingId(null);
        }
    };

    if (filteredData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-t border-slate-200 dark:border-[#2a3040]">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Phone className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Hotlines Found</h3>
                <p className="text-slate-500 max-w-sm">
                    No hotline numbers match your search criteria. Try adjusting your filters or add a new entry.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50/50 dark:bg-[#1e2330] hover:bg-slate-50 dark:hover:bg-[#1e2330] border-y border-slate-200 dark:border-[#2a3040]">
                        <TableHead className="w-[300px] font-bold text-slate-900 dark:text-slate-100 h-12 text-xs uppercase tracking-widest">Agency / Location</TableHead>
                        <TableHead className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-widest">Contact Numbers</TableHead>
                        <TableHead className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-widest">Category</TableHead>
                        <TableHead className="font-bold text-slate-900 dark:text-slate-100 text-center text-xs uppercase tracking-widest">Active</TableHead>
                        <TableHead className="text-right font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-widest">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.map((item) => (
                        <TableRow key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-[#202635] transition-colors border-b border-slate-200 dark:border-[#2a3040]">
                            <TableCell className="font-medium">
                                <div className="flex flex-col space-y-1">
                                    <span className="text-slate-900 dark:text-white font-bold leading-tight">{item.name}</span>
                                    {item.address && (
                                        <div className="flex items-center text-xs text-slate-500">
                                            <MapPin className="w-3 h-3 mr-1" style={{ color: themeColor }} />
                                            <span className="line-clamp-1">{item.address}</span>
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col space-y-1">
                                    {item.mobileNumber && (
                                        <div className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            <Phone className="w-3.5 h-3.5 mr-2" style={{ color: themeColor }} />
                                            {item.mobileNumber}
                                        </div>
                                    )}
                                    {item.telephone && (
                                        <div className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            <PhoneCall className="w-3.5 h-3.5 mr-2" style={{ color: themeColor }} />
                                            {item.telephone}
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                                    {item.category}
                                </span>
                            </TableCell>
                            <TableCell className="text-center">
                                <Switch
                                    checked={item.isActive}
                                    onCheckedChange={() => handleToggleStatus(item.id, item.isActive)}
                                    disabled={togglingId === item.id}
                                    className="data-[state=checked]:bg-primary"
                                    style={{ "--tw-bg-opacity": "1", backgroundColor: item.isActive ? themeColor : undefined } as CSSProperties}
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
                                                    style={{ color: themeColor }}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit Hotline</TooltipContent>
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
                                            <TooltipContent>Delete Hotline</TooltipContent>
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