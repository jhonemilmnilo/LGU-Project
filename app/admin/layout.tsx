import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "./components/Sidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session || (session.user as any).role !== "ADMIN") {
        redirect("/auth/login");
    }

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300">
            <Sidebar session={session} />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
