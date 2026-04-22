import React from "react";
import PaymentSettingsClient from "@/app/admin/treasury/payment-settings/PaymentSettingsClient";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db/prisma";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Payment Settings | Mapandan Portal",
    description: "Official administrative configuration for municipal payment channels and merchant details.",
};

export default async function PaymentSettingsPage() {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    // Restricted to Treasury and Admin
    if (role !== "TREASURY_STAFF" && role !== "ADMIN") {
        redirect("/admin/dashboard");
    }

    // Fetch Treasury Settings for the configuration form
    const settingsList = await prisma.systemSetting.findMany({
        where: {
            key: {
                in: ["gcash_qr_url", "gcash_account_name", "gcash_account_number"]
            }
        }
    });

    const treasurySettings = settingsList.reduce((acc: any, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {});

    return (
        <div className="min-h-screen pb-20">
            {/* Elegant Header */}
            <div className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-white/5 py-12 px-8 mb-10">
                <div className="max-w-7xl mx-auto space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-primary rounded-full" />
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
                            Payment <span className="text-primary tracking-normal italic">Settings</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium italic text-lg max-w-2xl leading-relaxed">
                        Manage official merchant identities and digital payment reception channels for municipality services.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8">
                <PaymentSettingsClient initialSettings={treasurySettings} role={role} />
            </div>
        </div>
    );
}
