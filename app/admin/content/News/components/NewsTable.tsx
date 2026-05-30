"use client";

import { useNews, News } from "../providers/NewsProvider";
import { deleteNews, toggleNewsStatus } from "@/app/admin/actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Edit2, Trash2, Calendar, Newspaper, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState } from "react";

export function NewsTable() {
    const { newsData, searchTerm, setEditingData, setIsAddModalOpen, selectedCategory } = useNews();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const filteredData = newsData.filter((item: News) => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleEdit = (item: News) => {
        setEditingData(item);
        setIsAddModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this article?")) return;
        setDeletingId(id);
        try {
            await deleteNews(id);
            toast.success("News deleted successfully!");
        } catch {
            toast.error("Failed to delete news.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        setTogglingId(id);
        try {
            await toggleNewsStatus(id, !currentStatus);
            toast.success(`News ${!currentStatus ? 'published' : 'unpublished'} successfully!`);
        } catch {
            toast.error("Failed to update status.");
        } finally {
            setTogglingId(null);
        }
    };

    if (filteredData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center border-t border-slate-200 dark:border-[#2a3040]">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-slate-200 dark:ring-white/5" style={{ backgroundColor: "color-mix(in srgb, var(--primary-theme) 10%, transparent)" }}>
                    <Newspaper className="w-10 h-10" style={{ color: "var(--primary-theme)" }} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">No Articles Found</h3>
                <p className="text-slate-500 font-medium italic max-w-sm mt-2">
                    Walang lumabas na balita sa criteria mo. Try adjusting your filters or publish a new one!
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50/50 dark:bg-[#1a1f2e] hover:bg-slate-50/50 dark:hover:bg-[#1a1f2e] border-y border-slate-200 dark:border-[#2a3040]">
                        <TableHead className="w-[80px] font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-slate-100 h-14 pl-8">Image</TableHead>
                        <TableHead className="w-[300px] font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-slate-100">Article Details</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-slate-100">Category</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-slate-100">Author</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-slate-100">Date Posted</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-slate-100 text-center">Published</TableHead>
                        <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-slate-100 pr-8">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.map((item) => (
                        <TableRow key={item.id} className="group hover:bg-[color-mix(in_srgb,var(--primary-theme)_8%,transparent)] transition-colors border-b border-slate-200 dark:border-[#2a3040]">
                            <TableCell className="pl-8">
                                <div className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    {item.imageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <Newspaper className="w-5 h-5 text-slate-300" />
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="py-5">
                                <div className="flex flex-col space-y-1.5">
                                    <span className="text-slate-900 dark:text-white font-black uppercase italic tracking-tight leading-tight transition-colors group-hover:text-[var(--primary-theme)]">
                                        {item.title}
                                    </span>
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
                                <div className="flex items-center text-slate-500 dark:text-slate-400 text-[11px] font-medium italic">
                                    <User className="w-3.5 h-3.5 mr-2" style={{ color: "var(--primary-theme)" }} />
                                    {item.author || "Admin"}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center text-slate-500 dark:text-slate-400 text-[11px] font-medium italic">
                                    <Calendar className="w-3.5 h-3.5 mr-2" style={{ color: "var(--primary-theme)" }} />
                                    {format(new Date(item.publishDate), "MMM d, yyyy")}
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <Switch
                                    checked={item.isPublished}
                                    onCheckedChange={() => handleToggleStatus(item.id, item.isPublished)}
                                    disabled={togglingId === item.id}
                                    className="data-[state=checked]:bg-[var(--primary-theme)]"
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
                                                    onClick={() => handleEdit(item)}
                                                    className="h-9 w-9 rounded-xl border border-transparent transition-all hover:bg-[color-mix(in_srgb,var(--primary-theme)_10%,transparent)] hover:border-[color-mix(in_srgb,var(--primary-theme)_20%,transparent)]"
                                                    style={{ color: "var(--primary-theme)" }}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit News</TooltipContent>
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
                                                    className="h-9 w-9 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/40 border border-transparent hover:border-red-200 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Delete News</TooltipContent>
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
