import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "./components/Sidebar";
import { getMultipleSystemSettings } from "@/lib/settings";
import prisma from "@/lib/db/prisma";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
        redirect("/auth/login");
    }

    const settings = await getMultipleSystemSettings([
        "site_logo", 
        "brand_word_1", 
        "brand_word_2", 
        "theme_color"
    ]);

    const [pendingReportsCount, pendingResidentsCount] = await Promise.all([
        prisma.report.count({ where: { status: "PENDING" } }),
        prisma.resident.count({ where: { registrationStatus: "PENDING" } }),
    ]);

    return (
        <div 
            className="flex min-h-screen bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300"
            style={{ "--primary-theme": settings.get("theme_color") || "#2563eb" } as React.CSSProperties}
        >
            <Sidebar 
                session={session} 
                logoUrl={settings.get("site_logo")}
                brandWord1={settings.get("brand_word_1")}
                brandWord2={settings.get("brand_word_2")}
                themeColor={settings.get("theme_color")}
                pendingReportsCount={pendingReportsCount}
                pendingResidentsCount={pendingResidentsCount}
            />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
