import prisma from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Newspaper, Calendar, User, Tag, Home, Clock, Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import ShareButton from "./ShareButton";

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    const news = await prisma.news.findUnique({
        where: { id }
    });

    if (!news) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0c10] pb-24">
            {/* Header / Banner */}
            <div className="h-64 md:h-80 w-full relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                {news.imageUrl ? (
                    <>
                        <img
                            src={news.imageUrl}
                            alt={news.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                    </>
                ) : (
                    <div className="absolute inset-0 opacity-10 flex flex-wrap gap-12 p-8">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <Newspaper key={i} className="w-24 h-24 rotate-12 text-white" />
                        ))}
                    </div>
                )}

                <div className="relative z-10 text-center space-y-4 px-6">
                    <div className="flex justify-center gap-3">
                        <span className="px-4 py-1.5 bg-white text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl italic">
                            News Article
                        </span>
                        {news.category && (
                            <span className="px-4 py-1.5 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                                {news.category}
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter drop-shadow-2xl">
                        Latest News
                    </h1>
                </div>

                <div className="absolute top-8 left-8 z-50">
                    <Breadcrumb>
                        <BreadcrumbList className="bg-black/20 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-white/10 w-fit shadow-sm">
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white transition-colors">
                                        <Home className="w-3.5 h-3.5 mb-0.5" />
                                        Home
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-white/50" />
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/user/news" className="text-[10px] font-black uppercase tracking-widest text-white transition-colors">
                                        News Hub
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-white/50" />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic max-w-[200px] truncate">{news.title}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10">
                <div className="bg-white dark:bg-[#111622] rounded-[3rem] p-10 md:p-16 shadow-2xl border border-slate-100 dark:border-white/5 space-y-10">
                    <div className="pb-8 border-b border-slate-100 dark:border-white/5 space-y-6">
                        <div className="flex flex-wrap items-center gap-6">
                             {news.category && (
                                <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-primary text-white shadow-lg shadow-primary/20">
                                    {news.category}
                                </span>
                            )}
                            
                            <div className="flex items-center gap-6 text-slate-400 font-bold text-[10px] uppercase tracking-widest italic">
                                {news.author && (
                                    <div className="flex items-center gap-2">
                                        <User className="w-3.5 h-3.5 text-primary" />
                                        {news.author}
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-primary" />
                                    {format(new Date(news.publishDate), "MMMM d, yyyy")}
                                </div>
                            </div>
                        </div>

                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">
                            {news.title}
                        </h2>
                    </div>

                    <div className="prose prose-xl prose-slate dark:prose-invert max-w-none">
                        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 font-medium italic leading-relaxed whitespace-pre-wrap">
                            {news.content}
                        </p>
                    </div>

                    <div className="flex items-center justify-end pt-8 border-t border-slate-100 dark:border-white/5">
                        <ShareButton />
                    </div>
                </div>
            </div>
        </div>
    );
}
