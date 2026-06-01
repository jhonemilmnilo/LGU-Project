import React from "react";
import RegistrarDetailClient from "../RegistrarDetailClient";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTransactionById } from "@/app/admin/transactions/actions";

export const metadata: Metadata = {
    title: "Registrar | Request Details",
    description: "Detail view for registrar request",
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function RegistrarDetailPage({ params }: PageProps) {
    await getServerSession(authOptions);
    const { id } = await params;
    const res = await getTransactionById(id);
    if (!res.success) {
        return (
            <div className="p-8 font-black uppercase text-red-500">
                Unable to load request: {res.error}
            </div>
        );
    }

    const tx = res.data;

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-300">
            <RegistrarDetailClient initialTransaction={tx} />
        </div>
    );
}
