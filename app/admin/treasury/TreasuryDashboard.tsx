"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    getTreasuryTransactions,
    getPendingTreasuryCount,
    getTreasuryStatusCounts,
    getTransactionTypes
} from "@/app/admin/transactions/actions";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Search, RefreshCcw,
    Archive, Clock
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const STATUS_TABS = [
    { value: "ALL", label: "All Status", color: "text-slate-600", activeColor: "bg-slate-900 text-white dark:bg-white dark:text-slate-900" },
    { value: "FOR_REQUESTING", label: "Evaluation", color: "text-amber-600", activeColor: "bg-amber-500 text-white" },
    { value: "FOR_INSPECTION", label: "Inspection", color: "text-blue-600", activeColor: "bg-blue-500 text-white" },
    { value: "FOR_REVISION", label: "For Revision", color: "text-amber-600", activeColor: "bg-amber-600 text-white" },
    { value: "FOR_PROCESSING", label: "Processing", color: "text-sky-600", activeColor: "bg-sky-500 text-white" },
    { value: "FOR_CLAIM", label: "For Claim", color: "text-indigo-600", activeColor: "bg-indigo-500 text-white" },
    { value: "FOR_PICKING", label: "For Picking", color: "text-pink-600", activeColor: "bg-pink-500 text-white" },
    { value: "IN_ROUTE", label: "In Route", color: "text-orange-600", activeColor: "bg-orange-500 text-white" },
    { value: "DELIVERED", label: "Delivered", color: "text-teal-600", activeColor: "bg-teal-500 text-white" },
    { value: "PAID", label: "Paid", color: "text-emerald-600", activeColor: "bg-emerald-500 text-white" },
    { value: "RELEASED", label: "Released", color: "text-slate-600", activeColor: "bg-slate-700 text-white" },
    { value: "REJECTED", label: "Rejected", color: "text-red-500", activeColor: "bg-red-500 text-white" },
    { value: "CANCELLED", label: "Cancelled", color: "text-red-400", activeColor: "bg-red-600 text-white" },
    { value: "RETURN_REQUESTED", label: "Return Req.", color: "text-orange-500", activeColor: "bg-orange-500 text-white" },
    { value: "REFUND_REQUESTED", label: "Refund Req.", color: "text-orange-500", activeColor: "bg-orange-500 text-white" },
];

// Helper: format exact date & time
function formatDateTime(date: string | Date): { date: string; time: string } {
    const d = new Date(date);
    return {
        date: d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }),
        time: d.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit", hour12: true }),
    };
}

export default function TreasuryDashboard() {
    const router = useRouter();
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role;

    const filteredTabs = useMemo(() => {
        if (userRole === "ADMIN_AIDE") {
            return STATUS_TABS.filter(tab => tab.value === "FOR_INSPECTION");
        }
        // Treasury Staff and other roles should not see the Inspection tab as it is processed exclusively by Admin Aide
        return STATUS_TABS.filter(tab => tab.value !== "FOR_INSPECTION");
    }, [userRole]);

    const [status, setStatus] = useState("ALL");

    // Default status tab to FOR_INSPECTION for ADMIN_AIDE
    useEffect(() => {
        if (userRole === "ADMIN_AIDE") {
            setStatus("FOR_INSPECTION");
        }
    }, [userRole]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [allServices, setAllServices] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
    const [sortBy, setSortBy] = useState<"date" | "service">("date");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [serviceFilter, setServiceFilter] = useState<string | null>(null);

    // Fetch all active service types directly from the database for the filter dropdown
    useEffect(() => {
        async function fetchServices() {
            try {
                const res = await getTransactionTypes();
                if (res.success && res.data) {
                    const names = res.data.map(t => t.name).filter(Boolean);
                    setAllServices(names);
                }
            } catch (err) {
                console.error("Failed to load services for filter:", err);
            }
        }
        fetchServices();
    }, []);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getTreasuryTransactions(status);
            if (res.success) {
                setTransactions(res.data || []);
            } else {
                // Surface the server-side error — toast shows user message, console shows dev detail
                console.error("[TreasuryDashboard] getTreasuryTransactions failed:", res.error);
                setTransactions([]);
                toast.error(res.error || "Failed to load transactions. Check your permissions.");
            }
            await getPendingTreasuryCount();
        } catch (err) {
            console.error("[TreasuryDashboard] Unexpected error:", err);
            toast.error("Failed to load transactions");
        } finally {
            setLoading(false);
        }
    }, [status]);

    // Fetch all status counts on mount and when transactions change
    const fetchStatusCounts = useCallback(async () => {
        try {
            const res = await getTreasuryStatusCounts();
            if (res.success && res.data) {
                setStatusCounts(res.data);
            }
        } catch {
            // Silently fail — counts are non-critical
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    useEffect(() => {
        fetchStatusCounts();
    }, [fetchStatusCounts]);

    // Refresh counts when status changes (after data is fetched)
    useEffect(() => {
        if (!loading) {
            fetchStatusCounts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading]);

    // Reset serviceFilter and page when status changes to prevent lingering filter states across empty pages
    useEffect(() => {
        setServiceFilter(null);
    }, [status]);

    // Reset to page 1 when filters change
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, status, itemsPerPage]);

    const filteredTransactions = transactions.filter(tx => {
        const name = `${tx.residentSnapshot?.firstName} ${tx.residentSnapshot?.lastName}`.toLowerCase();
        const refId = tx.id.slice(-8).toUpperCase();
        const searchUpper = search.toUpperCase();

        const matchesSearch = name.includes(search.toLowerCase()) ||
            tx.id.toLowerCase().includes(search.toLowerCase()) ||
            refId.includes(searchUpper);

        const matchesService = !serviceFilter || tx.type?.name === serviceFilter;

        return matchesSearch && matchesService;
    });

    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
        if (sortBy === "service") {
            const serviceA = (a.type?.name || "").toLowerCase();
            const serviceB = (b.type?.name || "").toLowerCase();
            return sortDirection === "asc"
                ? serviceA.localeCompare(serviceB)
                : serviceB.localeCompare(serviceA);
        } else {
            const dateA = new Date(a.updatedAt).getTime();
            const dateB = new Date(b.updatedAt).getTime();
            return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        }
    });

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = sortedTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Toggles sorting direction for the service column
    const handleServiceSortToggle = () => {
        if (sortBy === "service") {
            setSortDirection(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortBy("service");
            setSortDirection("asc");
        }
    };

    // Resets any dynamic service filtering when explicit date sorting is toggled
    const handleDateHeaderClick = () => {
        setServiceFilter(null);
        if (sortBy === "date") {
            setSortDirection(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortBy("date");
            setSortDirection("desc");
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Dashboard Controls */}
            <div className="bg-white dark:bg-[#151b2b] rounded-3xl border border-slate-200 dark:border-[#2a3040] shadow-2xl shadow-blue-500/5 overflow-hidden ring-1 ring-slate-200 dark:ring-white/5">
                <Tabs value={status} onValueChange={setStatus} className="w-full">
                    {/* Filters Section — matching ResidentFilters style */}
                    <div className="flex flex-col border-b border-slate-200 dark:border-[#2a3040] bg-slate-50/50 dark:bg-[#151b2b]">
                        {/* (Status dropdown moved inline into the search row below) */}

                        {/* Search Row — matching ResidentFilters style */}
                        <div className="p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                                <div className="relative w-full sm:w-[350px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search names or Reference ID..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10 h-11 bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] focus-visible:ring-blue-500 rounded-xl"
                                    />
                                </div>
                            </div>

                            {/* Right controls: Status dropdown + Refresh */}
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:block">
                                    <Select value={serviceFilter ?? "ALL"} onValueChange={(v) => { setSortBy("service"); setServiceFilter(v === "ALL" ? null : v); }}>
                                        <SelectTrigger className="h-11 w-48 rounded-xl border-slate-200 dark:border-[#2a3040] bg-white dark:bg-[#0f1117]">
                                            <SelectValue placeholder="Service" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-[#151b2b]">
                                            <SelectItem value="ALL" className="text-sm">All Services</SelectItem>
                                            {allServices.map(srv => (
                                                <SelectItem key={srv} value={srv} className="text-sm">{srv}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="hidden sm:block">
                                    <Select value={status} onValueChange={(v) => setStatus(v)}>
                                        <SelectTrigger className="h-11 w-48 rounded-xl border-slate-200 dark:border-[#2a3040] bg-white dark:bg-[#0f1117]">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-[#151b2b]">
                                            {filteredTabs.map(tab => {
                                                const count = tab.value === "ALL"
                                                    ? Object.values(statusCounts).reduce((a, b) => a + b, 0)
                                                    : (statusCounts[tab.value] || 0);
                                                return (
                                                    <SelectItem key={tab.value} value={tab.value} className="text-sm">
                                                        {tab.label}{count ? ` (${count})` : ""}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    onClick={fetchTransactions}
                                    variant="outline"
                                    className="h-11 w-11 rounded-xl p-0 border-slate-200 dark:border-[#2a3040] bg-white dark:bg-[#0f1117]"
                                >
                                    <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {status !== "SETTINGS" && (
                        <TabsContent value={status} className="mt-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50 border-b border-slate-200 dark:bg-[#1a1f2e] dark:border-[#2a3040]">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="font-bold text-slate-700 dark:text-slate-300 py-5">#</TableHead>
                                            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Applicant</TableHead>
                                            <TableHead className="font-bold text-slate-700 dark:text-slate-300 py-5">
                                                <div className="flex items-center gap-2">
                                                    {/* Sort Trigger */}
                                                    <button
                                                        onClick={handleServiceSortToggle}
                                                        className="flex items-center gap-1.5 hover:text-primary transition-colors focus:outline-none font-bold"
                                                    >
                                                        <span>Service</span>
                                                        <span className={cn(
                                                            "transition-colors duration-200 font-black text-[10px]",
                                                            sortBy === "service"
                                                                ? "text-blue-600 dark:text-blue-400 font-bold"
                                                                : "text-slate-300 dark:text-slate-600"
                                                        )}>
                                                            {sortBy === "service"
                                                                ? (sortDirection === "asc" ? "▲" : "▼")
                                                                : "⇅"
                                                            }
                                                        </span>
                                                    </button>

                                                    {/* Service filter moved to the top controls for better UX */}
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Method</TableHead>
                                            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Amount</TableHead>
                                            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Status</TableHead>
                                            <TableHead
                                                className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none hover:text-primary transition-colors py-5"
                                                onClick={handleDateHeaderClick}
                                            >
                                                <div className="flex items-center gap-1.5 group">
                                                    <span>Date</span>
                                                    <span className={cn(
                                                        "transition-colors duration-200 font-black text-[10px]",
                                                        sortBy === "date"
                                                            ? "text-blue-600 dark:text-blue-400 font-bold"
                                                            : "text-slate-300 dark:text-slate-600 group-hover:text-slate-400"
                                                    )}>
                                                        {sortBy === "date"
                                                            ? (sortDirection === "asc" ? "▲" : "▼")
                                                            : "⇅"
                                                        }
                                                    </span>
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            Array(5).fill(0).map((_, i) => (
                                                <TableRow key={i} className="animate-pulse">
                                                    <TableCell colSpan={7} className="h-20 text-center"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded mx-8" /></TableCell>
                                                </TableRow>
                                            ))
                                        ) : paginatedTransactions.length > 0 ? (
                                            paginatedTransactions.map((tx, index) => (
                                                <TableRow
                                                    key={tx.id}
                                                    onClick={() => router.push(`/admin/treasury/${tx.id}`)}
                                                    className="border-b border-slate-100 dark:border-[#2a3040]/50 hover:bg-slate-50/50 dark:hover:bg-[#1a1f2e]/50 transition-colors cursor-pointer select-none"
                                                >
                                                    <TableCell className="py-4">
                                                        <span className="text-xs font-black font-mono tracking-widest text-primary">{(currentPage - 1) * itemsPerPage + index + 1}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-900 dark:text-white uppercase leading-tight">
                                                                {tx.type?.requiresBusinessName
                                                                    ? (tx.businessName || (tx.additionalData as any)?.businessName || "UNNAMED ENTITY")
                                                                    : `${tx.residentSnapshot?.firstName} ${tx.residentSnapshot?.lastName}`}
                                                            </span>
                                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase italic mt-0.5">
                                                                {tx.type?.requiresBusinessName ? "Business Entity" : "Registered Resident"}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">
                                                            {tx.type?.name}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">{tx.fulfillmentType}</span>
                                                            <span className="text-[10px] text-slate-500 font-bold uppercase">{tx.paymentType?.replace("_", " ")}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-bold text-slate-900 dark:text-white">
                                                            {tx.totalAmount > 0 ? `₱${tx.totalAmount.toLocaleString()}` : "–"}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={cn(
                                                            "text-[10px] font-black uppercase italic tracking-wider",
                                                            tx.isCancelled ? "text-red-600" : ({
                                                                "FOR_REQUESTING": "text-amber-600",
                                                                "FOR_REVISION": "text-amber-600",
                                                                "EVALUATED": "text-blue-600",
                                                                "FOR_CLAIM": "text-indigo-600",
                                                                "FOR_PICKING": "text-pink-600",
                                                                "IN_ROUTE": "text-orange-600",
                                                                "DELIVERED": "text-teal-600",
                                                                "FOR_PROCESSING": "text-sky-600",
                                                                "PAID": "text-emerald-600",
                                                                "RELEASED": "text-slate-600",
                                                                "REJECTED": "text-red-600",
                                                                "RETURN_REQUESTED": "text-orange-500",
                                                                "REFUND_REQUESTED": "text-orange-500",
                                                                "RETURNED": "text-slate-500",
                                                                "REFUNDED": "text-slate-500",
                                                                "DISPUTE_REJECTED": "text-red-700",
                                                            } as Record<string, string>)[tx.status] || "text-slate-500"
                                                        )}>
                                                            {tx.isCancelled ? "CANCELLED" : tx.status?.replace(/_/g, " ")}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            {/* Always show transaction update date and time */}
                                                            {(() => {
                                                                const source = tx.updatedAt;
                                                                const f = formatDateTime(source);
                                                                return (
                                                                    <>
                                                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{f.date}</span>
                                                                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{f.time}</span>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-[400px] text-center">
                                                    <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                                                        <Archive className="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600" />
                                                        <p className="text-xl font-bold text-slate-700 dark:text-slate-300">No transactions found</p>
                                                        <p className="mt-2">Try adjusting your filters or search term.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination Controls — matching ResidentTable */}
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
                                        Showing {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length}
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
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
}
