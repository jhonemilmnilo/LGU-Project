import prisma from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Camera, Clock, Navigation, Compass, Wallet, Home, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default async function PlaceDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    // Check if it's a mock ID
    // if (id.startsWith('mock-')) {
    //     const mockSpots = [
    //         {
    //             id: 'mock-1',
    //             name: "Umbrella Rocks",
    //             address: "Sabangan, Mapandan, Pangasinan",
    //             imageUrl: "/place_to_visits/umbrella_rocks.png",
    //             description: "Mapandan's most iconic landmark, famed for mushroom-shaped rock formations sculpted by the relentless waves of the West Philippine Sea. It resembles a giant half-opened umbrella, attracting tourists and geologists alike.",
    //             category: "Geological Formation",
    //             entranceFee: "₱20.00",
    //             bestTimeToVisit: "Summer (March to May)",
    //             googleMapsUrl: "https://maps.app.goo.gl/Fkiw8PHYzdNVXEHA9",
    //             latitude: 16.114229,
    //             longitude: 119.796543,
    //         },
    //         {
    //             id: 'mock-2',
    //             name: "Sabangan Beach",
    //             address: "Sabangan, Mapandan, Pangasinan",
    //             imageUrl: "/place_to_visits/sabangan_beach.png",
    //             description: "Boasting crystal-clear turquoise waters and a diverse marine ecosystem, ideal for swimming and snorkeling. The shoreline is perfect for families looking for a relaxing day by the sea.",
    //             category: "Beach",
    //             entranceFee: "Free",
    //             bestTimeToVisit: "Morning / Daytime",
    //             latitude: 16.115,
    //             longitude: 119.795,
    //         },
    //         {
    //             id: 'mock-3',
    //             name: "Abagatanen Beach",
    //             address: "Abagatanen, Mapandan, Pangasinan",
    //             imageUrl: "/place_to_visits/abagatanen_beach.png",
    //             description: "A serene beach with golden-grey sand and calm blue waters, perfect for a peaceful camping getaway. It's less crowded than other beaches, offering more privacy.",
    //             category: "Beach",
    //             entranceFee: "₱50.00 (Environmental Fee)",
    //             bestTimeToVisit: "Camping Season",
    //             latitude: 16.083,
    //             longitude: 119.783,
    //         },
    //         {
    //             id: 'mock-4',
    //             name: "Death Pool",
    //             address: "Sabangan, Mapandan, Pangasinan",
    //             imageUrl: "/place_to_visits/death_pool.png",
    //             description: "A natural rock formation filled with sea water, creating an 'infinity pool' effect right beside the ocean waves. Despite its name, it's a popular spot for thrill-seekers when the tide is high.",
    //             category: "Natural Pool",
    //             entranceFee: "Included in Umbrella Rocks",
    //             bestTimeToVisit: "High Tide",
    //             latitude: 16.116,
    //             longitude: 119.797,
    //         },
    //         {
    //             id: 'mock-5',
    //             name: "Payad Beach",
    //             address: "Payad, Mapandan, Pangasinan",
    //             imageUrl: "/place_to_visits/payad_beach.png",
    //             description: "A tranquil and rustic beach destination with fine sand and coconut trees, away from the usual crowds. It offers a authentic provincial beach experience.",
    //             category: "Beach",
    //             entranceFee: "Free",
    //             bestTimeToVisit: "Sunset",
    //             latitude: 16.101,
    //             longitude: 119.790,
    //         }
    //     ];
    //     const spot = mockSpots.find(s => s.id === id);
    //     if (!spot) notFound();
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     return <DetailContent item={spot as any} />;
    // }

    const item = await prisma.tourismSpot.findUnique({
        where: { id }
    });

    if (!item || !item.isPublished) {
        notFound();
    }

    return <DetailContent item={item} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DetailContent({ item }: { item: any }) {
    const hasMap = item.googleMapsUrl || (item.latitude && item.longitude);
    const mapQuery = item.latitude && item.longitude 
        ? `${item.latitude},${item.longitude}`
        : `${item.name}, ${item.address}, Mapandan, Pangasinan`;
    const publicMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

    const hasQuickInfo = item.entranceFee || item.bestTimeToVisit;

    return (
        <div className="min-h-screen pb-20 space-y-10">
            {/* Nav */}
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
                            <Link href="/user/tourism" className="text-[10px] font-black uppercase tracking-widest text-white transition-colors">
                                Tourism Gallery
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="text-white/50" />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic max-w-[200px] truncate">{item.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Layout */}
            <div className={cn(
                "grid grid-cols-1 gap-10 items-start",
                hasMap ? "lg:grid-cols-5" : "lg:grid-cols-2 max-w-6xl mx-auto"
            )}>
                {/* Image Section */}
                <div className={hasMap ? "lg:col-span-2" : "w-full"}>
                    <div className={cn(
                        "relative rounded-[3rem] overflow-hidden shadow-2xl ring-1 ring-slate-200 dark:ring-white/5 bg-slate-100 group",
                        hasMap ? "aspect-[4/5]" : "aspect-[16/10]"
                    )}>
                        {item.imageUrl ? (
                            <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                priority
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Camera className="w-16 h-16 text-slate-200" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className={hasMap ? "lg:col-span-3 space-y-8" : "w-full space-y-8 pt-4"}>
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg text-[9px] font-black uppercase tracking-widest border border-primary/20">
                            <Compass className="w-3 h-3" />
                            {hasMap ? "Tourist Destination" : "Hidden Gem Showcase"}
                        </div>
                        <h1 className={cn(
                            "font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-[0.9]",
                            hasMap ? "text-3xl md:text-5xl" : "text-4xl md:text-6xl"
                        )}>
                            {item.name}
                        </h1>
                        {item.address && (
                            <div className="flex items-center gap-2 text-primary">
                                <MapPin className="w-4 h-4" />
                                <span className="text-xs font-black uppercase tracking-widest italic">{item.address}</span>
                            </div>
                        )}
                    </div>

                    {item.description && (
                        <p className={cn(
                            "text-slate-500 dark:text-slate-400 font-medium italic leading-relaxed border-l-4 border-primary pl-6 py-2",
                            hasMap ? "text-lg max-w-2xl" : "text-xl max-w-3xl"
                        )}>
                            {item.description}
                        </p>
                    )}

                    {/* Quick Info Grid - Only if data exists */}
                    {hasQuickInfo && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {item.entranceFee && (
                                <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] space-y-3 border border-slate-100 dark:border-white/5 transition-colors hover:border-primary/20 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                            <Wallet className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entrance Fee</h3>
                                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic">{item.entranceFee}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {item.bestTimeToVisit && (
                                <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] space-y-3 border border-slate-100 dark:border-white/5 transition-colors hover:border-primary/20 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                            <Clock className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Best Time</h3>
                                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic">{item.bestTimeToVisit}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {item.contactNumber && (
                        <div className="space-y-4 pt-4">
                            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Inquiries & Contact</h3>
                            <Link href={`tel:${item.contactNumber}`} className="block w-fit">
                                <Button variant="outline" className="h-16 px-10 rounded-[2rem] border-slate-200 dark:border-white/10 font-black uppercase tracking-widest text-[10px] flex items-center gap-4 shadow-sm hover:border-primary transition-all">
                                    <Phone className="w-4 h-4 text-primary" />
                                    {item.contactNumber}
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Google Maps Section - Only if Map Data Exists */}
            {hasMap && (
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-8 pt-10"
                >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-6">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Location Map</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                                <Navigation className="w-3 h-3 text-primary" />
                                Navigate your way to {item.name}
                            </p>
                        </div>
                        <Link href={item.googleMapsUrl || `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}`} target="_blank">
                            <Button className="bg-primary text-white hover:bg-slate-900 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 px-8 h-12 shadow-xl shadow-primary/20 transition-all hover:-translate-y-1">
                                <Navigation className="w-4 h-4" />
                                Get Directions
                            </Button>
                        </Link>
                    </div>
                    
                    <div className="h-[500px] w-full rounded-[4rem] overflow-hidden shadow-2xl ring-1 ring-slate-200 dark:ring-white/5 bg-slate-100 group relative">
                        <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            style={{ border: 0 }}
                            src={publicMapUrl}
                            allowFullScreen
                            loading="lazy"
                            className="grayscale hover:grayscale-0 transition-all duration-1000"
                        ></iframe>
                        <div className="absolute inset-0 pointer-events-none ring-inset ring-1 ring-white/10 rounded-[4rem]" />
                    </div>
                </motion.div>
            )}
        </div>
    );
}
