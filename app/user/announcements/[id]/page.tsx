import prisma from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
 
 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Megaphone, Calendar, Tag, Pin, AlertCircle, Info, Clock, Bell, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";

export default async function AnnouncementDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    const announcement = await prisma.announcement.findUnique({
        where: { id }
    });

    if (!announcement) {
        notFound();
    }

    const priorityColors = {
        Critical: "bg-red-600 text-white",
        High: "bg-orange-600 text-white",
        Normal: "bg-blue-600 text-white",
        Low: "bg-slate-600 text-white",
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0c10] pb-24">
            {/* Header / Banner */}
            <div className={`h-64 md:h-80 w-full relative overflow-hidden flex items-center justify-center ${
                announcement.priority === 'Critical' ? 'bg-red-600' :
                announcement.priority === 'High' ? 'bg-orange-600' :
                'bg-blue-600'
            }`}>
                <div className="absolute inset-0 opacity-10 flex flex-wrap gap-12 p-8">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <Megaphone key={i} className="w-24 h-24 rotate-12" />
                    ))}
                </div>
                
                <div className="relative z-10 text-center space-y-4 px-6">
                    <div className="flex justify-center gap-3">
                        <span className="px-4 py-1.5 bg-white text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl italic">
                            Official Announcement
                        </span>
                        {announcement.isPinned && (
                            <span className="px-4 py-1.5 bg-yellow-400 text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                                <Pin className="w-3.5 h-3.5" />
                                Pinned
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter drop-shadow-2xl">
                        Public Bulletin
                    </h1>
                </div>

                <div className="absolute top-8 left-8 z-50">
                    <Breadcrumb>
                        <BreadcrumbList className="bg-white/50 dark:bg-white/5 backdrop-blur-sm px-6 py-2.5 rounded-2xl border border-slate-100 dark:border-white/5 w-fit shadow-sm">
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors">
                                        <Home className="w-3.5 h-3.5 mb-0.5" />
                                        Home
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/user/announcements" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors">
                                        Announcements Hub
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-blue-600 italic max-w-[200px] truncate">{announcement.title}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10">
                <div className="bg-white dark:bg-[#111622] rounded-[3rem] p-10 md:p-16 shadow-2xl border border-slate-100 dark:border-white/5 space-y-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-white/5">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${priorityColors[announcement.priority as keyof typeof priorityColors]}`}>
                                    {announcement.priority} Priority
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                                    {announcement.category}
                                </span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight">
                                {announcement.title}
                            </h2>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest shrink-0">
                            <Clock className="w-4 h-4" />
                            Posted {format(new Date(announcement.createdAt), "MMMM d, yyyy")}
                        </div>
                    </div>

                    <div className="prose prose-xl prose-slate dark:prose-invert max-w-none">
                        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 font-medium italic leading-relaxed whitespace-pre-wrap">
                            {announcement.content}
                        </p>
                    </div>

                    <div className="pt-8">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center shrink-0">
                            <Info className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Public Safety & Information</h4>
                            <p className="text-xs text-slate-500 font-medium italic leading-relaxed">
                                This announcement is for public information purposes. If you require immediate assistance or have specific questions regarding this notice, please contact the relevant department or message the Mapandan Public Information Office directly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
