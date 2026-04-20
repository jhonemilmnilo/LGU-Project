"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
    getTreasuryTransactions, 
    getPendingTreasuryCount 
} from "@/app/admin/transactions/actions";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Search, RefreshCcw, 
    CreditCard, Clock, 
    Archive, Eye
} from "lucide-react";
import { TransactionDetailModal } from "./TransactionDetailModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function TreasuryDashboard() {
    const [status, setStatus] = useState("FOR_REQUESTING");
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedTx, setSelectedTx] = useState<any>(null);
    const [stats, setStats] = useState({ pending: 0, today: 0 });

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getTreasuryTransactions(status);
            if (res.success) {
                setTransactions(res.data || []);
            }
            
            // Fetch stats
            const countRes = await getPendingTreasuryCount();
            if (countRes.success) {
                setStats(prev => ({ ...prev, pending: countRes.count || 0 }));
            }
        } catch {
            toast.error("Failed to load transactions");
        } finally {
            setLoading(false);
        }
    }, [status]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const filteredTransactions = transactions.filter(tx => {
        const name = `${tx.residentSnapshot?.firstName} ${tx.residentSnapshot?.lastName}`.toLowerCase();
        return name.includes(search.toLowerCase()) || tx.id.includes(search);
    });

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "FOR_REQUESTING": return "bg-amber-100 text-amber-700 border-amber-200";
            case "EVALUATED": return "bg-blue-100 text-blue-700 border-blue-200";
            case "PAID": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "RELEASED": return "bg-slate-100 text-slate-700 border-slate-200";
            case "REJECTED": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-slate-50 text-slate-500 border-slate-100";
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all shadow-sm">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] italic">Pending Batch</p>
                        <h3 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">{stats.pending} <span className="text-xs text-amber-500 tracking-normal lowercase not-italic font-bold">Applications</span></h3>
                    </div>
                    <div className="bg-amber-500/10 p-4 rounded-3xl text-amber-500 group-hover:scale-110 transition-transform">
                        <Clock className="w-8 h-8" />
                    </div>
                </div>

                <div className="bg-primary p-8 rounded-[2.5rem] flex items-center justify-between group shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase text-white/50 tracking-[0.3em] italic">Collection Hub</p>
                        <h3 className="text-4xl font-black italic tracking-tighter text-white uppercase italic">Active <span className="text-xs text-white/70 tracking-normal lowercase not-italic font-bold">Queue</span></h3>
                    </div>
                    <div className="bg-white/20 p-4 rounded-3xl text-white">
                        <RefreshCcw className="w-8 h-8" />
                    </div>
                </div>

                <div className="bg-slate-950 p-8 rounded-[2.5rem] flex items-center justify-between group shadow-2xl hover:border-emerald-500/30 transition-all">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] italic">Treasury Status</p>
                        <h3 className="text-4xl font-black italic tracking-tighter text-emerald-500 uppercase italic">Online</h3>
                    </div>
                    <div className="bg-emerald-500/10 p-4 rounded-3xl text-emerald-500">
                        <CreditCard className="w-8 h-8" />
                    </div>
                </div>
            </div>

            {/* Dashboard Controls */}
            <div className="bg-white dark:bg-white/5 p-2 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm">
                <Tabs value={status} onValueChange={setStatus} className="w-full">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-4 p-4">
                        <TabsList className="bg-slate-100 dark:bg-white/5 p-1.5 h-auto rounded-[1.5rem] flex-wrap justify-start">
                            <TabsTrigger value="FOR_REQUESTING" className="rounded-xl px-5 py-2.5 font-bold italic uppercase tracking-widest text-[10px] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Evaluation</TabsTrigger>
                            <TabsTrigger value="EVALUATED" className="rounded-xl px-4 py-2.5 font-bold italic uppercase tracking-widest text-[10px] data-[state=active]:bg-white data-[state=active]:text-primary">Payments</TabsTrigger>
                            <TabsTrigger value="PAID" className="rounded-xl px-4 py-2.5 font-bold italic uppercase tracking-widest text-[10px] data-[state=active]:bg-white data-[state=active]:text-primary">Ready to Release</TabsTrigger>
                            <TabsTrigger value="RELEASED" className="rounded-xl px-4 py-2.5 font-bold italic uppercase tracking-widest text-[10px] data-[state=active]:bg-white data-[state=active]:text-primary">Completed</TabsTrigger>
                            <TabsTrigger value="REJECTED" className="rounded-xl px-4 py-2.5 font-bold italic uppercase tracking-widest text-[10px] data-[state=active]:bg-white data-[state=active]:text-primary">Archive</TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-3 w-full lg:w-auto">
                            <div className="relative flex-1 lg:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input 
                                    placeholder="Search names or ID..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-11 h-12 rounded-2xl border-slate-200 dark:border-white/10 dark:bg-white/5 bg-slate-50/50 italic font-medium" 
                                />
                            </div>
                            <Button 
                                onClick={fetchTransactions} 
                                variant="outline" 
                                className="h-12 w-12 rounded-2xl p-0 border-slate-200 dark:border-white/10"
                            >
                                <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
                            </Button>
                        </div>
                    </div>

                    <TabsContent value={status} className="mt-0 p-2">
                        <div className="bg-white dark:bg-transparent rounded-[2rem] overflow-hidden border border-slate-100 dark:border-white/5">
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-white/5">
                                    <TableRow className="border-none hover:bg-transparent">
                                        <TableHead className="font-black italic uppercase text-[9px] tracking-[0.2em] h-14 pl-8">Transaction ID</TableHead>
                                        <TableHead className="font-black italic uppercase text-[9px] tracking-[0.2em]">Applicant</TableHead>
                                        <TableHead className="font-black italic uppercase text-[9px] tracking-[0.2em]">Service</TableHead>
                                        <TableHead className="font-black italic uppercase text-[9px] tracking-[0.2em]">Method</TableHead>
                                        <TableHead className="font-black italic uppercase text-[9px] tracking-[0.2em]">Amount</TableHead>
                                        <TableHead className="font-black italic uppercase text-[9px] tracking-[0.2em]">Status</TableHead>
                                        <TableHead className="font-black italic uppercase text-[9px] tracking-[0.2em] text-right pr-8">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        Array(5).fill(0).map((_, i) => (
                                            <TableRow key={i} className="animate-pulse">
                                                <TableCell colSpan={7} className="h-20 text-center"><div className="h-4 bg-slate-100 rounded mx-8" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : filteredTransactions.length > 0 ? (
                                        filteredTransactions.map((tx) => (
                                            <TableRow key={tx.id} className="group border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                                <TableCell className="pl-8 py-6">
                                                    <span className="text-[10px] font-black font-mono tracking-widest text-slate-400 group-hover:text-primary transition-colors">#{tx.id.slice(-8).toUpperCase()}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black italic uppercase tracking-tight text-slate-900 dark:text-white">
                                                            {tx.residentSnapshot?.firstName} {tx.residentSnapshot?.lastName}
                                                        </span>
                                                        <span className="text-[10px] font-medium text-slate-400 italic">Registered Resident</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="rounded-lg text-[9px] font-black uppercase italic tracking-tighter py-1">
                                                        {tx.type?.name}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-widest italic">{tx.fulfillmentType}</Badge>
                                                        <span className="text-[8px] text-slate-400 font-bold uppercase">{tx.paymentType?.replace("_", " ")}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm font-black italic text-slate-900 dark:text-white">
                                                        {tx.totalAmount > 0 ? `₱${tx.totalAmount.toLocaleString()}` : "–"}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={cn(
                                                        "text-[9px] font-black uppercase italic tracking-widest px-2 shadow-none border",
                                                        getStatusStyles(tx.status)
                                                    )}>
                                                        {tx.status?.replace("_", " ")}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-8">
                                                    <Button 
                                                        onClick={() => setSelectedTx(tx)}
                                                        variant="ghost" 
                                                        className="h-10 w-10 rounded-xl p-0 hover:bg-primary hover:text-white transition-all transform active:scale-95 group-hover:rotate-6"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-64 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                                                    <Archive className="w-12 h-12" />
                                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">No Transactions in Queue</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {selectedTx && (
                <TransactionDetailModal 
                    transaction={selectedTx}
                    isOpen={!!selectedTx}
                    onClose={() => setSelectedTx(null)}
                    onRefresh={fetchTransactions}
                />
            )}
        </div>
    );
}
