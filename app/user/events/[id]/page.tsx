import prisma from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
 
 
 
 
 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Calendar, MapPin, Clock, Tag, ArrowLeft, Phone, Share2, Navigation, Info, Home, BellRing, ShieldCheck, MapPinned, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default async function EventDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    const event = await prisma.event.findUnique({
        where: { id }
    });

    if (!event) {
        notFound();
    }

    const mapQuery = event.latitude && event.longitude 
        ? `${event.latitude},${event.longitude}`
        : `${event.venueName}, ${event.address}, Mapandan, Pangasinan`;
    const publicMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0c10] pb-24 space-y-8">
            {/* Header / Backdrop */}
            <div className="relative h-[40vh] md:h-[55vh] overflow-hidden">
                <Image
                    src={event.imageUrl || "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=1600"}
                    alt={event.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-[#0a0c10] via-slate-950/20 to-transparent" />
                
                <div className="absolute top-6 left-8">
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
                                    <Link href="/user/events" className="text-[10px] font-black uppercase tracking-widest text-white transition-colors">
                                        Events Feed
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-white/50" />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic max-w-[200px] truncate">{event.title}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-10">
            <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6 md:gap-8">
                {/* Left: Content */}
                <div className="lg:col-span-3 space-y-6 md:space-y-8">
                        <div className="bg-white dark:bg-[#111622] rounded-[3.5rem] p-10 md:p-16 shadow-2xl border border-slate-100 dark:border-white/5 space-y-8">
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="px-4 py-1.5 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                                        {event.category}
                                    </span>
                                    <span className="px-4 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-slate-200 dark:border-white/10">
                                        <Clock className="w-3.5 h-3.5 text-primary" />
                                        {format(new Date(event.startDate), "hh:mm a")} - {format(new Date(event.endDate), "hh:mm a")}
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">
                                    {event.title}
                                </h1>
                            </div>

                            <div className="prose prose-slate dark:prose-invert max-w-none">
                                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium italic leading-relaxed">
                                    {event.description || "No detailed description provided for this event."}
                                </p>
                            </div>
                        </div>

                        {/* Map Section */}
                        <div className="bg-white dark:bg-[#111622] rounded-[3.5rem] p-10 overflow-hidden shadow-2xl border border-slate-100 dark:border-white/5 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <Navigation className="w-5 h-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Location Map</h3>
                                </div>
                            </div>
                            <div className="aspect-video w-full bg-slate-100 dark:bg-white/5 rounded-[3rem] overflow-hidden border border-slate-100 dark:border-white/5 shadow-inner relative group/map">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    style={{ border: 0 }}
                                    src={publicMapUrl}
                                    allowFullScreen
                                    loading="lazy"
                                ></iframe>
                                
                                {/* Floating Directions Button */}
                                <div className="absolute top-4 right-4 z-20">
                                    <Link href={event.googleMapsUrl || `https://maps.google.com/maps?q=${encodeURIComponent(`${event.title}, ${event.venueName}`)}`} target="_blank">
                                        <Button className="bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center gap-2 px-6 h-10 shadow-2xl">
                                            <Navigation className="w-3.5 h-3.5" />
                                            Get Directions
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Sidebar Actions */}
                    <div className="w-full lg:w-[380px] space-y-8">
                        <div className="bg-white dark:bg-[#111622] rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-white/5 sticky top-8 space-y-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-6 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-primary" />
                                    Event Details
                                </h3>
                                
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                            <Calendar className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Event Date</p>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">{format(new Date(event.startDate), "MMMM d, yyyy")}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                            <MapPinned className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Exact Venue</p>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase leading-tight">{event.venueName}</p>
                                            <p className="text-[10px] text-slate-500 font-medium italic mt-1 line-clamp-1">{event.address}</p>
                                        </div>
                                    </div>
                                    
                                    {event.contactNumber && (
                                        <Link href={`tel:${event.contactNumber}`} className="block">
                                            <Button variant="outline" className="w-full h-16 border-slate-200 dark:border-white/10 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-all">
                                                <Phone className="w-4 h-4" />
                                                Phone Inquiries: {event.contactNumber}
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100 dark:border-white/5">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-6 flex items-center gap-2">
                                    <BellRing className="w-5 h-5 text-primary" />
                                    Reminders
                                </h3>
                                <div className="space-y-3">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {((event as any).reminders && (event as any).reminders.length > 0) ? (
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        (event as any).reminders.map((reminder: string, rIdx: number) => (
                                            <div key={rIdx} className="flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-500 fill-mode-both" style={{ animationDelay: `${rIdx * 100}ms` }}>
                                                <BellRing className="w-3.5 h-3.5 text-primary/70 shrink-0 mt-0.5" />
                                                <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed">
                                                    {reminder}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 opacity-60">
                                            <Info className="w-5 h-5 text-slate-400 mb-2" />
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">No specific reminders for this event.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
