import prisma from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Camera, Clock, Phone, ArrowLeft, Navigation, Compass, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function PlaceDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    // Check if it's a mock ID
    if (id.startsWith('mock-')) {
        const mockSpots = [
            {
                id: 'mock-1',
                name: "Umbrella Rocks",
                address: "Sabangan, Agno, Pangasinan",
                imageUrl: "/place_to_visits/umbrella_rocks.png",
                description: "Agno's most iconic landmark, famed for mushroom-shaped rock formations sculpted by the relentless waves of the West Philippine Sea. It resembles a giant half-opened umbrella, attracting tourists and geologists alike.",
                category: "Geological Formation",
                entranceFee: "₱20.00",
                bestTimeToVisit: "Summer (March to May)",
                googleMapsUrl: "https://maps.app.goo.gl/Fkiw8PHYzdNVXEHA9",
                latitude: 16.114229,
                longitude: 119.796543,
            },
            {
                id: 'mock-2',
                name: "Sabangan Beach",
                address: "Sabangan, Agno, Pangasinan",
                imageUrl: "/place_to_visits/sabangan_beach.png",
                description: "Boasting crystal-clear turquoise waters and a diverse marine ecosystem, ideal for swimming and snorkeling. The shoreline is perfect for families looking for a relaxing day by the sea.",
                category: "Beach",
                entranceFee: "Free",
                bestTimeToVisit: "Morning / Daytime",
                latitude: 16.115,
                longitude: 119.795,
            },
            {
                id: 'mock-3',
                name: "Abagatanen Beach",
                address: "Abagatanen, Agno, Pangasinan",
                imageUrl: "/place_to_visits/abagatanen_beach.png",
                description: "A serene beach with golden-grey sand and calm blue waters, perfect for a peaceful camping getaway. It's less crowded than other beaches, offering more privacy.",
                category: "Beach",
                entranceFee: "₱50.00 (Environmental Fee)",
                bestTimeToVisit: "Camping Season",
                latitude: 16.083,
                longitude: 119.783,
            },
            {
                id: 'mock-4',
                name: "Death Pool",
                address: "Sabangan, Agno, Pangasinan",
                imageUrl: "/place_to_visits/death_pool.png",
                description: "A natural rock formation filled with sea water, creating an 'infinity pool' effect right beside the ocean waves. Despite its name, it's a popular spot for thrill-seekers when the tide is high.",
                category: "Natural Pool",
                entranceFee: "Included in Umbrella Rocks",
                bestTimeToVisit: "High Tide",
                latitude: 16.116,
                longitude: 119.797,
            },
            {
                id: 'mock-5',
                name: "Payad Beach",
                address: "Payad, Agno, Pangasinan",
                imageUrl: "/place_to_visits/payad_beach.png",
                description: "A tranquil and rustic beach destination with fine sand and coconut trees, away from the usual crowds. It offers a authentic provincial beach experience.",
                category: "Beach",
                entranceFee: "Free",
                bestTimeToVisit: "Sunset",
                latitude: 16.101,
                longitude: 119.790,
            }
        ];
        const spot = mockSpots.find(s => s.id === id);
        if (!spot) notFound();
        return <DetailContent item={spot as any} />;
    }

    const item = await prisma.tourismSpot.findUnique({
        where: { id }
    });

    if (!item || !item.isPublished) {
        notFound();
    }

    return <DetailContent item={item} />;
}

function DetailContent({ item }: { item: any }) {
    const mapQuery = item.latitude && item.longitude 
        ? `${item.latitude},${item.longitude}`
        : `${item.name}, ${item.address}, Agno, Pangasinan`;
    const publicMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

    return (
        <div className="min-h-screen pb-20 space-y-10">
            {/* Nav */}
            <div className="flex items-center justify-between">
                <Link href="/">
                    <Button variant="ghost" className="group flex items-center gap-2 font-black uppercase tracking-widest text-[9px] text-slate-500 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                        Back to Landing
                    </Button>
                </Link>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Tourist Spot Spotlight: <span className="text-blue-600 italic">{item.name}</span>
                </div>
            </div>

            {/* Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
                {/* Image Section */}
                <div className="lg:col-span-2">
                    <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-slate-200 dark:ring-white/5 bg-slate-100">
                        {item.imageUrl ? (
                            <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Camera className="w-16 h-16 text-slate-200" />
                            </div>
                        )}
                        <div className="absolute top-6 left-6">
                            <span className="px-5 py-2 bg-blue-600/90 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl border border-blue-400/30">
                                {item.category || "Must Visit"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/30">
                            <Compass className="w-3 h-3" />
                            Tourist Destination
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-[0.9]">
                            {item.name}
                        </h1>
                        <div className="flex items-center gap-2 text-slate-500">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-bold uppercase tracking-widest italic">{item.address}</span>
                        </div>
                    </div>

                    <p className="text-lg text-slate-600 dark:text-slate-400 font-medium italic leading-relaxed max-w-2xl border-l-4 border-blue-600 pl-6 py-2">
                        {item.description}
                    </p>

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] space-y-3 border border-slate-100 dark:border-white/5 transition-colors hover:border-blue-200 dark:hover:border-blue-900/50 group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                    <Wallet className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entrance Fee</h3>
                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic">{item.entranceFee || "Free"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] space-y-3 border border-slate-100 dark:border-white/5 transition-colors hover:border-blue-200 dark:hover:border-blue-900/50 group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                    <Clock className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Best Time to Visit</h3>
                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic">{item.bestTimeToVisit || "Year Round"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {item.contactNumber && (
                        <div className="space-y-4 pt-4">
                            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Inquiries & Contact</h3>
                            <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 dark:border-white/10 font-black uppercase tracking-widest text-[10px] flex items-center gap-4 shadow-sm hover:border-blue-600 hover:text-blue-600 transition-all">
                                <Phone className="w-4 h-4" />
                                {item.contactNumber}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Google Maps Section */}
            <div className="space-y-8 pt-10">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-6">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Location Map</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                            <Navigation className="w-3 h-3 text-blue-600" />
                            Navigate your way to {item.name}
                        </p>
                    </div>
                    {item.googleMapsUrl && (
                        <Link href={item.googleMapsUrl} target="_blank">
                            <Button className="bg-blue-600 text-white hover:bg-slate-900 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 px-8 h-12 shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1">
                                <Navigation className="w-4 h-4" />
                                Open in Google Maps
                            </Button>
                        </Link>
                    )}
                </div>
                
                <div className="h-[500px] w-full rounded-[3rem] overflow-hidden shadow-2xl ring-1 ring-slate-200 dark:ring-white/5 bg-slate-100 group relative">
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
                    <div className="absolute inset-0 pointer-events-none ring-inset ring-1 ring-white/10 rounded-[3rem]" />
                </div>
            </div>
        </div>
    );
}
