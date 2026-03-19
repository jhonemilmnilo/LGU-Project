import prisma from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Calendar, User, Tag, ArrowLeft, Share2, Facebook, Twitter, MessageCircle, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const article = await prisma.news.findUnique({
        where: { id }
    });

    if (!article) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0c10] pb-24">
            {/* Header / Backdrop */}
            <div className="relative h-[50vh] md:h-[70vh] overflow-hidden">
                <Image
                    src={article.imageUrl || "https://images.unsplash.com/photo-150471142745a-5099af501997?auto=format&fit=crop&q=80&w=1600"}
                    alt={article.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0a0c10] via-slate-950/40 to-transparent" />
                
                <div className="absolute top-8 left-8">
                    <Link href="/">
                        <Button variant="ghost" className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30 rounded-2xl px-6 h-12 font-black uppercase tracking-widest text-[10px] border border-white/20">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Return
                        </Button>
                    </Link>
                </div>

                <div className="absolute bottom-16 left-0 right-0 max-w-7xl mx-auto px-6 space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 italic">
                            {article.category}
                        </span>
                        <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/20">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(article.publishDate), "MMMM d, yyyy")}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-[0.9] max-w-4xl drop-shadow-2xl">
                        {article.title}
                    </h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-16">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Left: Article Content */}
                    <div className="flex-1 space-y-12">
                        <div className="flex items-center justify-between py-8 border-y border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center">
                                    <User className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Published By</p>
                                    <p className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tight leading-none group-hover:text-blue-600">
                                        {article.author || "Municipal Administration"}
                                    </p>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center gap-3">
                                <Button size="icon" variant="ghost" className="rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all">
                                    <Facebook className="w-5 h-5" />
                                </Button>
                                <Button size="icon" variant="ghost" className="rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all">
                                    <Twitter className="w-5 h-5" />
                                </Button>
                                <Button size="icon" variant="ghost" className="rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all">
                                    <Share2 className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        <div className="prose prose-xl prose-slate dark:prose-invert max-w-none">
                            <div className="flex items-center gap-2 text-blue-600 mb-8 font-black uppercase tracking-[0.2em] text-xs">
                                <BookOpen className="w-4 h-4" />
                                Story Coverage
                            </div>
                            <div className="text-slate-700 dark:text-slate-300 font-medium text-xl leading-relaxed italic whitespace-pre-wrap">
                                {article.content}
                            </div>
                        </div>

                        <div className="p-12 bg-slate-50 dark:bg-[#111622] rounded-[3rem] border border-slate-200 dark:border-white/5 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                    <MessageCircle className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Official Statement</h3>
                            </div>
                            <p className="text-base text-slate-500 font-medium italic leading-relaxed">
                                This article is an official publication of the Municipality of Mapandan. For verification or media inquiries, please visit the Municipal Information Office during office hours.
                            </p>
                        </div>
                    </div>

                    {/* Right: Sidebar / Recommendations placeholder */}
                    <div className="w-full lg:w-[320px] space-y-12">
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Share this Story</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="outline" className="h-14 rounded-2xl border-slate-200 dark:border-white/10 flex items-center gap-2 font-black uppercase tracking-widest text-[9px] text-slate-600">
                                    <Facebook className="w-4 h-4 text-blue-600" />
                                    Facebook
                                </Button>
                                <Button variant="outline" className="h-14 rounded-2xl border-slate-200 dark:border-white/10 flex items-center gap-2 font-black uppercase tracking-widest text-[9px] text-slate-600">
                                    <Twitter className="w-4 h-4 text-blue-400" />
                                    Twitter
                                </Button>
                            </div>
                            <Button className="w-full h-16 bg-slate-900 border-none text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl transition-all flex items-center justify-center gap-3 group">
                                <Share2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                Copy Full Article Link
                            </Button>
                        </div>

                        <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-2xl shadow-blue-500/30 overflow-hidden relative group">
                            <div className="relative z-10 space-y-4">
                                <Tag className="w-8 h-8 text-blue-300" />
                                <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-tight">Stay Informed,<br/>Stay Connected.</h4>
                                <p className="text-xs font-medium italic text-blue-100">Subscribe to our newsletter for real-time updates from Mapandan.</p>
                                <Button className="w-full h-12 bg-white text-blue-600 rounded-xl font-black uppercase tracking-widest text-[10px] mt-4 hover:bg-blue-50 transition-colors">
                                    Sign Up Now
                                </Button>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
