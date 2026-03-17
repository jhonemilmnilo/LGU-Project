"use client";

import { useResident } from "../providers";
import { Resident } from "../providers/ResidentProvider";
import { deleteResident } from "../../actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Search, Phone } from "lucide-react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function ResidentTable() {
    const {
        residents,
        setResidents,
        searchQuery,
        selectedBarangay,
        selectedGender,
        setEditingData,
        setIsAddModalOpen,
    } = useResident();

    const filteredResidents = residents.filter((r) => {
        const matchesSearch =
            r.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.barangay.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBarangay = selectedBarangay === "All" || r.barangay === selectedBarangay;
        const matchesGender = selectedGender === "All" || r.gender === selectedGender;
        return matchesSearch && matchesBarangay && matchesGender;
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, selectedBarangay, selectedGender, itemsPerPage]);

    const totalPages = Math.ceil(filteredResidents.length / itemsPerPage);
    const paginatedResidents = filteredResidents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleDelete = async (id: string) => {
        try {
            const response = await deleteResident(id);
            if (response.success) {
                setResidents(prev => prev.filter(r => r.id !== id));
                toast.success("Resident entry deleted successfully!");
            } else {
                toast.error(response.error || "Failed to delete resident entry.");
            }
        } catch (_error) {
            toast.error("An error occurred while deleting the resident.");
        }
    };

    const handleEdit = (resident: Resident) => {
        setEditingData(resident);
        setIsAddModalOpen(true);
    };

    return (
        <div className="bg-white dark:bg-[#151b2b] rounded-2xl border border-slate-200 dark:border-[#2a3040] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-slate-50 border-b border-slate-200 dark:bg-[#1a1f2e] dark:border-[#2a3040]">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-bold text-slate-700 dark:text-slate-300 py-5">Profile</TableHead>
                            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Name</TableHead>
                            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Info & Status</TableHead>
                            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Location</TableHead>
                            <TableHead className="font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">Contact</TableHead>
                            <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-right pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredResidents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-[400px] text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                                        <Search className="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600" />
                                        <p className="text-xl font-bold text-slate-700 dark:text-slate-300">No residents found</p>
                                        <p className="mt-2">Try adjusting your filters or search term.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedResidents.map((resident) => (
                                <TableRow key={resident.id} className="border-b border-slate-100 dark:border-[#2a3040]/50 hover:bg-slate-50/50 dark:hover:bg-[#1a1f2e]/50 transition-colors">
                                    <TableCell className="py-4">
                                        <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                                            {resident.imageUrl ? (
                                                <Image src={resident.imageUrl} alt={`${resident.firstName} ${resident.lastName}`} layout="fill" objectFit="cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold uppercase">
                                                    {resident.firstName[0]}{resident.lastName[0]}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 dark:text-white uppercase leading-tight">
                                                {resident.lastName}, {resident.firstName} {resident.middleName ? `${resident.middleName[0]}.` : ''} {resident.suffix}
                                            </span>
                                            <div className="flex items-center gap-1 mt-1">
                                                {resident.isHead && (
                                                    <Badge variant="outline" className="text-[9px] h-4 bg-blue-50 text-blue-600 dark:bg-blue-900/20 border-blue-200 px-1 font-black">HEAD</Badge>
                                                )}
                                                {!resident.isHead && resident.headName && (
                                                    <Badge variant="outline" className="text-[9px] h-4 bg-slate-50 text-slate-500 dark:bg-slate-900/20 border-slate-200 px-1 font-black uppercase">
                                                        {resident.relationshipToHead || 'MEMBER'} OF {resident.headName}
                                                    </Badge>
                                                )}
                                                {resident.isSenior && (
                                                    <Badge variant="outline" className="text-[9px] h-4 bg-amber-50 text-amber-600 dark:bg-amber-900/20 border-amber-200 px-1 font-black">SENIOR</Badge>
                                                )}
                                                {resident.isPWD && (
                                                    <Badge variant="outline" className="text-[9px] h-4 bg-purple-50 text-purple-600 dark:bg-purple-900/20 border-purple-200 px-1 font-black">PWD</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-xs text-slate-500">
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">{resident.gender} • {resident.civilStatus}</span>
                                            <span>DOB: {new Date(resident.dateOfBirth).toLocaleDateString()}</span>
                                            {resident.is4Ps && <span className="text-green-600 font-bold dark:text-green-400 text-[10px]">4Ps Beneficiary</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800 dark:text-slate-200 uppercase text-xs">{resident.barangay}</span>
                                            <span className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[150px]">
                                                {resident.houseNumber} {resident.street} {resident.sitio} {resident.purok}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-0.5 items-start">
                                            {resident.contactNumber ? (
                                                <span className="text-xs font-black flex items-center gap-1"><Phone className="w-3 h-3 text-blue-500" /> {resident.contactNumber}</span>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">No Contact</span>
                                            )}
                                            {resident.email && (
                                                <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{resident.email}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-9 w-9 rounded-xl border-slate-200 dark:border-[#2a3040] hover:bg-slate-100 dark:hover:bg-[#2a3040] p-0"
                                                onClick={() => handleEdit(resident as any)}
                                            >
                                                <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="h-9 w-9 rounded-xl border-slate-200 dark:border-[#2a3040] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-900/30 p-0">
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040] rounded-3xl">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="text-slate-900 dark:text-white font-black uppercase text-xl italic tracking-tighter">Remove Resident</AlertDialogTitle>
                                                        <AlertDialogDescription className="text-slate-500 font-medium">
                                                            Are you sure you want to delete the resident record for {resident.firstName} {resident.lastName}? This action cannot be undone and will affect census data.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter className="gap-3">
                                                        <AlertDialogCancel className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl h-11 px-6 font-bold">Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(resident.id)}
                                                            className="bg-red-600 hover:bg-red-700 text-white rounded-2xl h-11 px-6 font-bold"
                                                        >
                                                            Delete Record
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="p-6 border-t border-slate-200 dark:border-[#2a3040] flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-[#151b2b]/50">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <span className="hidden sm:inline-block">Rows per page:</span>
                    <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                        <SelectTrigger className="h-8 w-[70px] border-slate-200 dark:border-[#2a3040] bg-white dark:bg-[#0f1117] rounded-lg">
                            <SelectValue placeholder={itemsPerPage} />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#151b2b]">
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="30">30</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        Showing {Math.min(currentPage * itemsPerPage, filteredResidents.length)} of {filteredResidents.length}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="h-10 px-4 rounded-xl border-slate-200 dark:border-[#2a3040] font-bold"
                        >
                            Prev
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="h-10 px-4 rounded-xl border-slate-200 dark:border-[#2a3040] font-bold"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
