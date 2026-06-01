"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getTreasuryTransactions } from "@/app/admin/transactions/actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCcw, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

function formatDateTime(date: string | Date) {
    const d = new Date(date);
    return {
        date: d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }),
        time: d.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit", hour12: true }),
    };
}

function getResidentSnapshot(tx: any) {
    if (!tx.residentSnapshot) return {};
    if (typeof tx.residentSnapshot === 'string') {
        try { return JSON.parse(tx.residentSnapshot); } catch { return {}; }
    }
    return tx.residentSnapshot;
}

export default function ReleaseDocumentsList() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getTreasuryTransactions("FOR_PROCESSING");
            if (res.success) {
                const filtered = (res.data || []).filter((tx: any) => tx.type?.category === "Civil Registry");
                setTransactions(filtered);
            } else {
                toast.error(res.error || "Failed to load transactions.");
                setTransactions([]);
            }
        } catch (err) {
            console.error("Failed to load processing transactions:", err);
            toast.error("Failed to load transactions");
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

    const formatStatusLabel = (s?: string) => {
        if (!s) return "N/A";
        if (s === "FOR_PROCESSING") return "Processing";
        return s.replace(/_/g, " ");
    };

    const filtered = transactions.filter(tx => {
        const rs = getResidentSnapshot(tx);
        const name = `${rs.firstName || ''} ${rs.lastName || ''}`.trim().toLowerCase();
        const refId = tx.id.slice(-8).toUpperCase();
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return name.includes(q) || tx.id.toLowerCase().includes(q) || refId.includes(q.toUpperCase());
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div className="relative w-full sm:w-[420px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input placeholder="Search names or Reference ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11" />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-11 w-11 p-0" onClick={fetchTransactions}><RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} /></Button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Applicant</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow className="animate-pulse"><TableCell colSpan={6}><div className="h-12 bg-slate-100 rounded" /></TableCell></TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-8">No transactions found</TableCell></TableRow>
                        ) : (
                            filtered.map((tx, i) => (
                                <TableRow key={tx.id} onClick={() => router.push(`/admin/registrar/${tx.id}`)} className="cursor-pointer hover:bg-slate-50/50">
                                    <TableCell>{i + 1}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold uppercase">{(() => { const rs = getResidentSnapshot(tx); return `${rs.firstName || 'Unknown'} ${rs.lastName || ''}`; })()}</span>
                                            <span className="text-[10px] text-slate-500">Registered Resident</span>
                                        </div>
                                    </TableCell>
                                    <TableCell><span className="text-xs font-bold uppercase text-blue-600">{tx.type?.name}</span></TableCell>
                                    <TableCell><span className="font-bold">{tx.totalAmount > 0 ? `₱${tx.totalAmount.toLocaleString()}` : '–'}</span></TableCell>
                                    <TableCell><span className="text-[10px] font-black uppercase italic tracking-wider text-sky-600">{formatStatusLabel(tx.status)?.toUpperCase()}</span></TableCell>
                                    <TableCell>
                                        {(() => { const f = formatDateTime(tx.updatedAt); return (<div className="flex flex-col"><span className="text-xs font-bold">{f.date}</span><span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{f.time}</span></div>); })()}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
