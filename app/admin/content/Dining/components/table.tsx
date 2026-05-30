"use client";

import { motion } from "framer-motion";
import { useDining, Dining } from "../providers/DiningProvider";
import { Store, MapPin, MoreHorizontal, Map as MapIcon, Trash, EyeOff, Eye } from "lucide-react";
import { deleteDining, toggleDiningStatus } from "@/app/admin/actions";
import {
    Table as UITable,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "../utils/date_and_time";

export function DiningTable() {
    const { diningData, searchTerm, selectedCuisine, selectedStatus, setEditingData, setIsAddModalOpen } = useDining();

    const filteredData = diningData.filter((item: Dining) => {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
            item.name.toLowerCase().includes(query) ||
            item.address.toLowerCase().includes(query) ||
            (item.cuisineType && item.cuisineType.toLowerCase().includes(query));
        const matchesCuisine = selectedCuisine === "All" || item.cuisineType === selectedCuisine;
        const matchesStatus =
            selectedStatus === "All" ||
            (selectedStatus === "Published" && item.isPublished) ||
            (selectedStatus === "Draft" && !item.isPublished);

        return matchesSearch && matchesCuisine && matchesStatus;
    });

    return (
        <div className="overflow-x-auto">
            <UITable>
                <TableHeader className="bg-slate-50 dark:bg-[#0f1117]/50">
                    <TableRow className="border-slate-200 dark:border-[#2a3040] hover:bg-transparent">
                        <TableHead className="text-slate-600 dark:text-slate-400 font-medium h-12">Name</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 font-medium h-12">Cuisine</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 font-medium h-12">Location</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 font-medium h-12">Status</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 font-medium h-12">Added</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 font-medium text-right h-12">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.length === 0 ? (
                        <TableRow className="border-slate-200 dark:border-[#2a3040]">
                            <TableCell colSpan={6} className="text-center py-16 text-slate-500">
                                <div className="flex flex-col items-center justify-center">
                                    <Store className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-3 opacity-50" />
                                    <p>No dining places found.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredData.map((item: Dining, index: number) => (
                            <motion.tr
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={item.id}
                                className="border-b border-slate-200 dark:border-[#2a3040] hover:bg-slate-50/80 dark:hover:bg-[#2a3040]/30 transition-colors group"
                            >
                                <TableCell className="font-semibold text-slate-900 dark:text-slate-100 py-5 pl-6">
                                    <div className="flex flex-col">
                                        <span className="group-hover:text-primary dark:group-hover:text-primary transition-colors text-base">{item.name}</span>
                                        {item.openingHours && (
                                            <span className="text-xs text-slate-500 font-normal mt-1 flex items-center">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                                {item.openingHours}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-400 py-5">
                                    {item.cuisineType ? (
                                        <Badge variant="outline" className="border-slate-200 dark:border-[#343b4f] bg-white dark:bg-[#151b2b] text-slate-700 dark:text-slate-300 font-medium px-3 py-1 shadow-sm">
                                            {item.cuisineType}
                                        </Badge>
                                    ) : (
                                        <span className="text-slate-400 dark:text-slate-600 italic text-sm">Not specified</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-slate-600 dark:text-slate-400 max-w-[250px] py-5">
                                    <div className="flex items-start text-sm">
                                        <MapPin className="w-4 h-4 mr-2 text-slate-400 group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                                        <span className="truncate leading-relaxed">{item.address}</span>
                                    </div>
                                    {(item.latitude && item.longitude) && (
                                        <span className="block text-[11px] text-slate-400 font-mono mt-1.5 ml-6 opacity-80">
                                            {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="py-5">
                                    {item.isPublished ? (
                                        <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20 shadow-sm px-3 py-1">Published</Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-slate-100 dark:bg-[#2a3040] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#343b4f] hover:bg-slate-200 dark:hover:bg-[#343b4f] px-3 py-1">Draft</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-slate-500 text-sm py-5 font-medium">
                                    {formatDate(item.createdAt)}
                                </TableCell>
                                <TableCell className="text-right py-5 pr-6">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#343b4f] rounded-lg transition-all">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[180px] bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040] shadow-xl rounded-xl p-1">
                                            <DropdownMenuLabel className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider font-bold px-2 py-1.5">Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator className="bg-slate-100 dark:bg-[#2a3040] -mx-1" />
                                            <DropdownMenuItem
                                                className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-[#2a3040] focus:text-slate-900 dark:focus:text-white cursor-pointer rounded-md mx-1 my-1 flex items-center"
                                                onClick={() => {
                                                    setEditingData(item);
                                                    setIsAddModalOpen(true);
                                                }}
                                            >
                                                <Store className="w-4 h-4 mr-2 text-slate-500" /> Edit details
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-[#2a3040] focus:text-slate-900 dark:focus:text-white cursor-pointer rounded-md mx-1 my-1 flex items-center"
                                                onClick={async () => {
                                                    const res = await toggleDiningStatus(item.id, !item.isPublished);
                                                    if (!res.success) alert(res.error);
                                                }}
                                            >
                                                {item.isPublished ? (
                                                    <><EyeOff className="w-4 h-4 mr-2 text-slate-500" /> Hide from public</>
                                                ) : (
                                                    <><Eye className="w-4 h-4 mr-2 text-emerald-500" /> Publish entry</>
                                                )}
                                            </DropdownMenuItem>

                                            {(item.googleMapsUrl || (item.latitude && item.longitude)) && (
                                                <DropdownMenuItem
                                                    className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-[#2a3040] focus:text-slate-900 dark:focus:text-white cursor-pointer rounded-md mx-1 my-1 flex items-center"
                                                    onClick={() => {
                                                        const url = item.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`;
                                                        window.open(url, "_blank");
                                                    }}
                                                >
                                                    <MapIcon className="w-4 h-4 mr-2 text-primary" /> View on Map
                                                </DropdownMenuItem>
                                            )}

                                            <DropdownMenuSeparator className="bg-slate-100 dark:bg-[#2a3040] -mx-1" />
                                            <DropdownMenuItem
                                                onClick={async () => {
                                                    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
                                                        const res = await deleteDining(item.id);
                                                        if (!res.success) alert(res.error);
                                                    }
                                                }}
                                                className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-700 dark:focus:text-red-300 font-medium cursor-pointer rounded-md mx-1 my-1 flex items-center"
                                            >
                                                <Trash className="w-4 h-4 mr-2" /> Delete entry
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </motion.tr>
                        ))
                    )}
                </TableBody>
            </UITable>
        </div>
    );
}
