"use client";

import React, { useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

/**
 * Engineer Detail Page
 * Redirects to the treasury detail page which already handles ENGINEER role
 * via the backUrl variable (routes back to /admin/engineer for ENGINEER users).
 */
export default function EngineerDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();

    useEffect(() => {
        router.replace(`/admin/treasury/${id}`);
    }, [id, router]);

    return (
        <div className="min-h-screen bg-[#f8fafd] dark:bg-[#0c111d] flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );
}
