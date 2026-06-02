"use client";

import { motion } from "framer-motion";
import { useTourism, Tourism } from "../providers/TourismProvider";
import Image from "next/image";
import { MapPin, MoreHorizontal, Map as MapIcon, Trash, EyeOff, Eye, Camera } from "lucide-react";
import { deleteTourismSpot, toggleTourismSpotStatus } from "@/app/admin/actions";
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
export function TourismTable() {
    const { tourismData, searchTerm, setEditingData, setIsAddModalOpen, selectedCategory, selectedStatus, themeColor } = useTourism();

    const filteredData = tourismData.filter((item: Tourism) => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
        const matchesStatus = selectedStatus === "All" || 
            (selectedStatus === "Published" && item.isPublished) ||
            (selectedStatus === "Hidden" && !item.isPublished);
        return matchesSearch && matchesCategory && matchesStatus;
    });

    return (
        <div className="overflow-x-auto">
            <UITable>
                <TableHeader>
                    <TableRow className="bg-slate-50/50 dark:bg-[#1e2330] border-slate-200 dark:border-[#2a3040] hover:bg-slate-50 dark:hover:bg-[#1e2330]">
                        <TableHead className="w-[350px] font-bold text-slate-900 dark:text-slate-100 py-5 pl-6 text-xs uppercase tracking-widest">Gallery Item</TableHead>
                        <TableHead className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-widest">Address / Location</TableHead>
                        <TableHead className="font-bold text-slate-900 dark:text-slate-100 text-center text-xs uppercase tracking-widest">Status</TableHead>
                        <TableHead className="font-bold text-slate-900 dark:text-slate-100 text-right pr-6 text-xs uppercase tracking-widest">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-64 text-center">
                                <div className="flex flex-col items-center justify-center space-y-3">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <Camera className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="text-slate-500 font-medium">No tourism spots found</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredData.map((item: Tourism, index: number) => (
                            <motion.tr
                                key={item.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group border-slate-200 dark:border-[#2a3040] hover:bg-slate-50/50 dark:hover:bg-[#202635] transition-colors"
                            >
                                <TableCell className="pl-6 py-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-200 dark:border-[#2a3040]">
                                            {item.imageUrl ? (
                                                <Image src={item.imageUrl} alt={item.name} layout="fill" objectFit="cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Camera className="w-5 h-5 text-slate-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-base leading-tight group-hover:text-primary dark:group-hover:text-primary transition-colors uppercase">{item.name}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center text-slate-600 dark:text-slate-400 text-xs">
                                        <MapPin className="w-3 h-3 mr-1.5" style={{ color: themeColor }} />
                                        <span className="truncate max-w-[200px]">{item.address}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    {item.isPublished ? (
                                        <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-50 border-emerald-100 dark:border-emerald-500/30 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                                            Published
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-100 border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                                            Hidden
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-slate-100 dark:hover:bg-[#2a3040]">
                                                <MoreHorizontal className="h-5 w-5 text-slate-500" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[200px] bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040] shadow-xl rounded-xl p-1">
                                            <DropdownMenuLabel className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider font-bold px-2 py-1.5">Spot Management</DropdownMenuLabel>
                                            <DropdownMenuSeparator className="bg-slate-100 dark:bg-[#2a3040] -mx-1" />
                                            <DropdownMenuItem
                                                className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-[#2a3040] focus:text-slate-900 dark:focus:text-white cursor-pointer rounded-md mx-1 my-1 flex items-center font-medium"
                                                onClick={() => {
                                                    setEditingData(item);
                                                    setIsAddModalOpen(true);
                                                }}
                                            >
                                                <Camera className="w-4 h-4 mr-2 text-slate-500" /> Edit Entry Details
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-[#2a3040] focus:text-slate-900 dark:focus:text-white cursor-pointer rounded-md mx-1 my-1 flex items-center font-medium"
                                                onClick={async () => {
                                                    const res = await toggleTourismSpotStatus(item.id, !item.isPublished);
                                                    if (!res.success) alert(res.error);
                                                }}
                                            >
                                                {item.isPublished ? (
                                                    <><EyeOff className="w-4 h-4 mr-2 text-slate-500" /> Hide from Visitors</>
                                                ) : (
                                                    <><Eye className="w-4 h-4 mr-2 text-emerald-500" /> Make Public</>
                                                )}
                                            </DropdownMenuItem>

                                            {(item.googleMapsUrl || (item.latitude && item.longitude)) && (
                                                <DropdownMenuItem
                                                    className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-[#2a3040] focus:text-slate-900 dark:focus:text-white cursor-pointer rounded-md mx-1 my-1 flex items-center font-medium"
                                                    onClick={() => {
                                                        const url = item.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`;
                                                        window.open(url as string, "_blank");
                                                    }}
                                                >
                                                    <MapIcon className="w-4 h-4 mr-2" style={{ color: themeColor }} /> Open in Maps
                                                </DropdownMenuItem>
                                            )}

                                            <DropdownMenuSeparator className="bg-slate-100 dark:bg-[#2a3040] -mx-1" />
                                            <DropdownMenuItem
                                                onClick={async () => {
                                                    if (window.confirm(`Seryoso ka pal? Buburahin natin 'to? ${item.name}`)) {
                                                        const res = await deleteTourismSpot(item.id);
                                                        if (!res.success) alert(res.error);
                                                    }
                                                }}
                                                className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-700 dark:focus:text-red-300 font-bold cursor-pointer rounded-md mx-1 my-1 flex items-center"
                                            >
                                                <Trash className="w-4 h-4 mr-2" /> Delete Permanent
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