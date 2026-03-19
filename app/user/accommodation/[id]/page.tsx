import prisma from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MapPin, Phone, Globe, Navigation, Bed } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

export default async function AccommodationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const item = await prisma.accommodation.findUnique({
        where: { id }
    });

    if (!item || !item.isPublished) {
        notFound();
    }

    const amenities = item.amenities ? item.amenities.split(',').map(a => a.trim()) : [];

    // Map implementation without API key
    const mapQuery = item.latitude && item.longitude 
        ? `${item.latitude},${item.longitude}`
        : `${item.name}, ${item.address}, Mapandan, Pangasinan`;
    const publicMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

    return (
        <div className="min-h-screen pb-20 space-y-10">
            {/* Header / Nav */}
            <Breadcrumb>
                <BreadcrumbList className="font-black uppercase tracking-widest text-[10px]">
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/" className="transition-colors hover:text-blue-600">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/user/accommodation" className="transition-colors hover:text-blue-600">Accommodation Hub</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-blue-600">{item.name}</BreadcrumbPage>
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
                                <Bed className="w-16 h-16 text-slate-200" />
                            </div>
                        )}
                        <div className="absolute top-4 left-4">
                            <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">
                                {item.type || "Tuluyan"}
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
                        <div className="flex items-center gap-2 text-blue-600">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest italic">{item.address}</span>
                        </div>
                    </div>

                    <p className="text-base text-slate-500 dark:text-slate-400 font-medium italic leading-relaxed">
                        {item.description}
                    </p>

                    {/* Smaller Cards */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-[2rem] space-y-2 border border-slate-100 dark:border-white/5">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price Range</h3>
                            <p className="text-base font-black text-blue-600 italic">{item.priceRange || "Contact for price"}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Amenities</h3>
                        <div className="flex flex-wrap gap-2">
                            {amenities.map((amenity, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-lg text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                    {amenity}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Book & Inquire</h3>
                        <div className="flex flex-wrap gap-3">
                            {item.contactNumber && (
                                <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 dark:border-white/10 font-black uppercase tracking-widest text-[9px] flex items-center gap-3 shadow-sm">
                                    <Phone className="w-3.5 h-3.5" />
                                    {item.contactNumber}
                                </Button>
                            )}
                            {item.websiteUrl && (
                                <Link href={item.websiteUrl} target="_blank">
                                    <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 dark:border-white/10 font-black uppercase tracking-widest text-[9px] flex items-center gap-3 shadow-sm">
                                        <Globe className="w-3.5 h-3.5" />
                                        Website
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Shorter Map Section */}
            <div className="space-y-6 pt-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Location</h2>
                    {item.googleMapsUrl && (
                        <Link href={item.googleMapsUrl} target="_blank">
                            <Button className="bg-blue-600 text-white hover:bg-slate-900 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center gap-2 px-6 h-10 shadow-lg">
                                <Navigation className="w-3.5 h-3.5" />
                                Directions
                            </Button>
                        </Link>
                    )}
                </div>
                
                <div className="h-[400px] w-full rounded-[2.5rem] overflow-hidden shadow-xl ring-1 ring-slate-200 dark:ring-white/5 bg-slate-100">
                    <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={publicMapUrl}
                        allowFullScreen
                        loading="lazy"
                    ></iframe>
                </div>
            </div>
        </div>
    );
}
