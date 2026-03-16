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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const itemsPerPageOptions = [10, 20, 30, 50];
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Reset to page 1 when filters change - using state hook correctly
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
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
                            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Location</TableHead>
                            <TableHead className="font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">Contact</TableHead>
                            <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-right pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredResidents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-[400px] text-center">
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
                                            <span className="font-bold text-slate-900 dark:text-white">
                                                {resident.firstName} {resident.middleName ? `${resident.middleName[0]}.` : ''} {resident.lastName}
                                            </span>
                                            <span className="text-xs text-slate-500 mt-1">
                                                {resident.gender} • {resident.civilStatus}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">{resident.barangay}</span>
                                            <span className="text-xs text-slate-500 mt-1 truncate max-w-[200px]" title={resident.address}>
                                                {resident.address}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 items-start">
                                            {resident.contactNumber ? (
                                                <span className="text-sm font-medium flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {resident.contactNumber}</span>
                                            ) : (
                                                <span className="text-sm text-slate-400 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> N/A</span>
                                            )}
                                            {resident.email && (
                                                <span className="text-xs text-slate-500 truncate max-w-[150px]">{resident.email}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 border-slate-200 dark:border-[#2a3040] hover:bg-slate-100 dark:hover:bg-[#2a3040]"
                                                onClick={() => handleEdit(resident)}
                                            >
                                                <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="h-8 border-slate-200 dark:border-[#2a3040] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-900/30">
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040]">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="text-slate-900 dark:text-white">Remove Resident</AlertDialogTitle>
                                                        <AlertDialogDescription className="text-slate-500">
                                                            Are you sure you want to delete the resident record for {resident.firstName} {resident.lastName}? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 hover:bg-slate-200 dark:hover:bg-slate-700">Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(resident.id)}
                                                            className="bg-red-600 hover:bg-red-700 text-white"
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
            <div className="p-4 border-t border-slate-200 dark:border-[#2a3040] flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#151b2b]">
                <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="hidden sm:inline-block">Rows per page:</span>
                    <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                        <SelectTrigger className="h-8 w-[70px] border-slate-200 dark:border-[#2a3040] bg-transparent">
                            <SelectValue placeholder={itemsPerPage} />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#151b2b]">
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="30">30</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="hidden sm:inline-block border-l border-slate-200 dark:border-[#2a3040] h-4 mx-4"></span>
                    <span>
                        Showing {filteredResidents.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to{" "}
                        {Math.min(currentPage * itemsPerPage, filteredResidents.length)} of {filteredResidents.length} entries
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="h-8 border-slate-200 dark:border-[#2a3040] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2a3040]"
                    >
                        Previous
                    </Button>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 px-2 min-w-[5rem] text-center">
                        Page {totalPages > 0 ? currentPage : 0} of {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="h-8 border-slate-200 dark:border-[#2a3040] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2a3040]"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
