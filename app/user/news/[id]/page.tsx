import prisma from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Calendar, User, Home, Share2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import ShareButton from "./ShareButton";

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const news = await prisma.news.findUnique({
        where: { id }
    });

    if (!news) {
        notFound();
    }

    return (
        <div className="min-h-screen pb-20 space-y-6 md:space-y-10">
            {/* Breadcrumb section */}
            <div className="sticky top-[70px] z-40 md:static -mx-4 md:mx-0 px-4 md:px-0 pt-2 md:pt-0">
                <Breadcrumb>
                    <BreadcrumbList className="bg-white/80 dark:bg-white/5 backdrop-blur-md px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-white/10 w-fit shadow-sm">
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">
                                    <Home className="w-3.5 h-3.5 mb-0.5" />
                                    Home
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/user/news" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">
                                    News
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden sm:block" />
                        <BreadcrumbItem className="hidden sm:block">
                            <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic max-w-[150px] truncate">{news.title}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* Main Content Area */}
            <div className="max-w-5xl mx-auto px-4 md:px-0 space-y-8 md:space-y-12">
                {/* Image Section */}
                {news.imageUrl && (
                    <div className="relative aspect-video w-full rounded-2xl md:rounded-[3rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/5 group">
                        <Image
                            src={news.imageUrl}
                            alt={news.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-1000"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                        <div className="absolute top-4 left-4 md:top-8 md:left-8">
                            <div className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary shadow-2xl">
                                {news.category}
                            </div>
                        </div>
                    </div>
                )}

                {/* Header Information */}
                <div className="space-y-4 md:space-y-6">
                    <h1 className="text-3xl md:text-6xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight pt-2 pb-1">
                        {news.title}
                    </h1>

                    <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-2 md:gap-6 pt-4 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-2 md:gap-3 p-2 md:p-4 bg-white dark:bg-white/5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-white/10 shadow-md">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 dark:bg-primary/20 rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
                                <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-400 truncate">Published On</span>
                                <span className="text-[8px] md:text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest italic truncate">
                                    {format(new Date(news.publishDate), "MMM d, yyyy")}
                                </span>
                            </div>
                        </div>

                        {news.author && (
                            <div className="flex items-center gap-2 md:gap-3 p-2 md:p-4 bg-white dark:bg-white/5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-white/10 shadow-md">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-50 dark:bg-white/5 rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
                                    <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-400 truncate">Written By</span>
                                    <span className="text-[8px] md:text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest italic truncate">
                                        {news.author}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Body */}
                <div className="max-w-4xl space-y-10">
                    <div className="prose prose-xl md:prose-2xl prose-slate dark:prose-invert max-w-none">
                        <p className="text-sm md:text-2xl text-slate-600 dark:text-slate-300 font-medium italic leading-relaxed md:leading-[1.8] whitespace-pre-wrap">
                            {news.content}
                        </p>
                    </div>

                    {/* Share Section */}
                    <div className="pt-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 dark:bg-white/5 rounded-xl flex items-center justify-center">
                                <Share2 className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Share this story</span>
                        </div>
                        <ShareButton />
                    </div>
                </div>
            </div>
        </div>
    );
}
