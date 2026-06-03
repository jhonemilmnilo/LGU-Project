"use client";

import React, { useState, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Copy, Check, ExternalLink, RefreshCcw, DollarSign, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { getPaymentsLedger } from "./actions";

interface PaymentRecord {
    id: string;
    transactionId: string;
    amount: number;
    method: "CASH" | "CASH_ON_DELIVERY" | "E_PAYMENT" | "BANK_TRANSFER";
    status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    reference: string | null;
    createdAt: string;
    updatedAt: string;
    transaction: {
        id: string;
        businessName: string | null;
        type: {
            name: string;
        };
        user: {
            name: string | null;
            email: string;
        } | null;
    };
}

interface PaymentsClientProps {
    initialPayments: PaymentRecord[];
}

export default function PaymentsClient({ initialPayments }: PaymentsClientProps) {
    const [payments, setPayments] = useState<PaymentRecord[]>(initialPayments);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [methodFilter, setMethodFilter] = useState<string>("ALL");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const res = await getPaymentsLedger("");
            if (res.success && res.data) {
                setPayments(res.data as any);
                toast.success("Payments list updated!");
            } else {
                toast.error(res.error || "Failed to update payments.");
            }
        } catch (err) {
            console.error(err);
            toast.error("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success("Reference number copied!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredPayments = useMemo(() => {
        return payments.filter((payment) => {
            const citizenName = payment.transaction?.user?.name || "Unknown";
            const businessName = payment.transaction?.businessName || "";
            const searchLower = search.toLowerCase();
            
            const matchesSearch = 
                payment.reference?.toLowerCase().includes(searchLower) ||
                payment.transactionId.toLowerCase().includes(searchLower) ||
                payment.id.toLowerCase().includes(searchLower) ||
                citizenName.toLowerCase().includes(searchLower) ||
                businessName.toLowerCase().includes(searchLower);

            const matchesMethod = methodFilter === "ALL" || payment.method === methodFilter;
            const matchesStatus = statusFilter === "ALL" || payment.status === statusFilter;

            return matchesSearch && matchesMethod && matchesStatus;
        });
    }, [payments, search, methodFilter, statusFilter]);

    // Statistics calculations
    const stats = useMemo(() => {
        const totalPaid = payments
            .filter(p => p.status === "PAID")
            .reduce((acc, p) => acc + p.amount, 0);

        const paidCount = payments.filter(p => p.status === "PAID").length;
        const pendingCount = payments.filter(p => p.status === "PENDING").length;
        const failedCount = payments.filter(p => p.status === "FAILED").length;

        return { totalPaid, paidCount, pendingCount, failedCount };
    }, [payments]);

    const formatDateTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return {
            date: d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }),
            time: d.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit", hour12: true }),
        };
    };

    return (
        <div className="space-y-6">
            {/* Top Cards Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Collections */}
                <div className="bg-white dark:bg-[#151b2b] p-6 rounded-2xl border border-slate-200 dark:border-[#2a3040] shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Total Paid Amount</span>
                        <p className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white mt-1">
                            ₱{stats.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-500">
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>

                {/* Paid Transactions */}
                <div className="bg-white dark:bg-[#151b2b] p-6 rounded-2xl border border-slate-200 dark:border-[#2a3040] shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Paid Transactions</span>
                        <p className="text-2xl font-black italic tracking-tighter text-emerald-500 mt-1">
                            {stats.paidCount}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-500">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>

                {/* Pending Payments */}
                <div className="bg-white dark:bg-[#151b2b] p-6 rounded-2xl border border-slate-200 dark:border-[#2a3040] shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Pending Payments</span>
                        <p className="text-2xl font-black italic tracking-tighter text-amber-500 mt-1">
                            {stats.pendingCount}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-500">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                {/* Failed Payments */}
                <div className="bg-white dark:bg-[#151b2b] p-6 rounded-2xl border border-slate-200 dark:border-[#2a3040] shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Failed / Refunded</span>
                        <p className="text-2xl font-black italic tracking-tighter text-red-500 mt-1">
                            {stats.failedCount}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-500/10 text-red-500">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-[#151b2b] p-4 rounded-3xl border border-slate-200 dark:border-[#2a3040] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-[350px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        placeholder="Search ref no, transaction, citizen..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-11 bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] focus-visible:ring-blue-500 rounded-xl"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Method Filter */}
                    <Select value={methodFilter} onValueChange={setMethodFilter}>
                        <SelectTrigger className="h-11 w-40 rounded-xl border-slate-200 dark:border-[#2a3040] bg-white dark:bg-[#0f1117]">
                            <SelectValue placeholder="Payment Method" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#151b2b]">
                            <SelectItem value="ALL">All Methods</SelectItem>
                            <SelectItem value="CASH">Cash</SelectItem>
                            <SelectItem value="E_PAYMENT">E-Payment</SelectItem>
                            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                            <SelectItem value="CASH_ON_DELIVERY">COD</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-11 w-40 rounded-xl border-slate-200 dark:border-[#2a3040] bg-white dark:bg-[#0f1117]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#151b2b]">
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="FAILED">Failed</SelectItem>
                            <SelectItem value="REFUNDED">Refunded</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={handleRefresh}
                        variant="outline"
                        className="h-11 w-11 rounded-xl p-0 border-slate-200 dark:border-[#2a3040] bg-white dark:bg-[#0f1117]"
                        disabled={loading}
                    >
                        <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white dark:bg-[#151b2b] rounded-3xl border border-slate-200 dark:border-[#2a3040] shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-[#1a1f2e] border-b border-slate-200 dark:border-[#2a3040]">
                        <TableRow>
                            <TableHead className="font-bold py-4 pl-6 text-slate-700 dark:text-slate-300">Reference No.</TableHead>
                            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Citizen / Business</TableHead>
                            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Service Type</TableHead>
                            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Method</TableHead>
                            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Amount</TableHead>
                            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Status</TableHead>
                            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Date Paid</TableHead>
                            <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-right pr-6">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPayments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center text-slate-500 dark:text-slate-400">
                                    No payment records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPayments.map((payment) => {
                                const formattedDate = formatDateTime(payment.createdAt);
                                const citizenName = payment.transaction?.user?.name || "Registered Resident";
                                const serviceName = payment.transaction?.type?.name || "Service Payment";
                                const refDisplay = payment.reference || "N/A";
                                
                                return (
                                    <TableRow key={payment.id} className="border-b border-slate-100 dark:border-[#2a3040]/50 hover:bg-slate-50/50 dark:hover:bg-[#1a1f2e]/50 transition-colors">
                                        <TableCell className="py-4 pl-6 font-mono text-xs font-bold text-slate-900 dark:text-white">
                                            <div className="flex items-center gap-2">
                                                <span>{refDisplay}</span>
                                                {payment.reference && (
                                                    <button
                                                        onClick={() => handleCopy(payment.reference!, payment.id)}
                                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                                        title="Copy reference number"
                                                    >
                                                        {copiedId === payment.id ? (
                                                            <Check className="w-3.5 h-3.5 text-emerald-500 animate-in zoom-in-50" />
                                                        ) : (
                                                            <Copy className="w-3.5 h-3.5" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 dark:text-white uppercase leading-tight">
                                                    {citizenName}
                                                </span>
                                                {payment.transaction?.businessName && (
                                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase italic mt-0.5">
                                                        Business: {payment.transaction.businessName}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                            {serviceName}
                                        </TableCell>
                                        <TableCell className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">
                                            {payment.method?.replace(/_/g, " ")}
                                        </TableCell>
                                        <TableCell className="font-bold text-slate-900 dark:text-white">
                                            ₱{payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`text-[10px] font-black uppercase italic tracking-wider px-2.5 py-1 rounded-full ${
                                                payment.status === "PAID"
                                                    ? "text-emerald-700 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/20"
                                                    : payment.status === "PENDING"
                                                    ? "text-amber-700 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/20"
                                                    : "text-red-700 bg-red-500/10 dark:text-red-400 dark:bg-red-500/20"
                                            }`}>
                                                {payment.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{formattedDate.date}</span>
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{formattedDate.time}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Link href={`/admin/treasury/${payment.transactionId}`}>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 rounded-lg gap-1.5 text-xs text-slate-600 hover:text-[#2563eb] hover:bg-slate-100 dark:text-slate-400 dark:hover:text-[#2563eb] dark:hover:bg-slate-800"
                                                    title="View Transaction"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    Detail
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
