import prisma from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Phone, Facebook, Utensils, Navigation, Home } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

export default async function DiningDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const item = await prisma.dining.findUnique({
        where: { id }
    });

    if (!item || !item.isPublished) {
        notFound();
    }

    // Map implementation without API key
    const mapQuery = item.latitude && item.longitude 
        ? `${item.latitude},${item.longitude}`
        : `${item.name}, ${item.address}, Mapandan, Pangasinan`;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY_PLACEHOLDER || ''}&q=${encodeURIComponent(mapQuery)}`;
    // Fallback public embed if no key:
    const publicMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

    return (
        <div className="min-h-screen pb-20 space-y-10">
            {/* Header / Nav */}
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
                            <Link href="/user/dining" className="text-[10px] font-black uppercase tracking-widest text-white transition-colors">
                                Dining Hub
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic max-w-[200px] truncate">{item.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Compact Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
                {/* Smaller Image Column */}
                <div className="lg:col-span-2">
                    <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-slate-200 dark:ring-white/5">
                        {item.imageUrl ? (
                            <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                                <Utensils className="w-16 h-16 text-slate-200" />
                            </div>
                        )}
                        <div className="absolute top-4 left-4">
                            <span className="px-4 py-1.5 bg-orange-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">
                                Kainan
                            </span>
                        </div>
                    </div>
                </div>

                {/* Larger Details Column */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="space-y-3">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">
                            {item.name}
                        </h1>
                        <div className="flex items-center gap-2 text-primary">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest italic">{item.address}</span>
                        </div>
                    </div>

                    <p className="text-base text-slate-500 dark:text-slate-400 font-medium italic leading-relaxed">
                        {item.description}
                    </p>

                    {/* Smaller Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-[2rem] space-y-2 border border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-2 text-primary">
                                <Clock className="w-4 h-4" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Opening Hours</h3>
                            </div>
                            <p className="text-xs font-bold text-slate-500 italic">{item.openingHours || "Contact establishment"}</p>
                        </div>

                        <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-[2rem] space-y-2 border border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-2 text-primary">
                                <Utensils className="w-4 h-4" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Cuisine</h3>
                            </div>
                            <p className="text-xs font-bold text-slate-500 italic">{item.cuisineType || "Local"}</p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Connect with Establishment</h3>
                        <div className="flex flex-wrap gap-3">
                            {item.contactNumber && (
                                <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 dark:border-white/10 font-black uppercase tracking-widest text-[9px] flex items-center gap-3 shadow-sm hover:border-primary/50 transition-colors">
                                    <Phone className="w-3.5 h-3.5 text-primary" />
                                    {item.contactNumber}
                                </Button>
                            )}
                            {item.facebookUrl && (
                                <Link href={item.facebookUrl} target="_blank">
                                    <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 dark:border-white/10 font-black uppercase tracking-widest text-[9px] flex items-center gap-3 shadow-sm hover:border-primary/50 transition-colors">
                                        <Facebook className="w-3.5 h-3.5 text-primary" />
                                        Facebook Page
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Shorter Map Section - Always visible */}
                    <div className="space-y-4 pt-4 relative group/map">
                        <div className="h-[300px] w-full rounded-[2.5rem] overflow-hidden shadow-xl ring-1 ring-slate-200 dark:ring-white/5 bg-slate-100 relative">
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                style={{ border: 0 }}
                                src={publicMapUrl}
                                allowFullScreen
                                loading="lazy"
                            ></iframe>
                            
                            {/* Floating Directions Button - Fixed and visible */}
                            {item.googleMapsUrl && (
                                <div className="absolute top-4 right-4 z-20">
                                    <Link href={item.googleMapsUrl} target="_blank">
                                        <Button className="bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center gap-2 px-6 h-10 shadow-2xl">
                                            <Navigation className="w-3.5 h-3.5" />
                                            Get Directions
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
