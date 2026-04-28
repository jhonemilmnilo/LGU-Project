import { Skeleton } from "@/components/ui/skeleton";

export function EmergencyReportSkeleton() {
    return (
        <section className="pt-16 md:pt-20 pb-12 px-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Contact List */}
                <div className="w-full lg:w-1/3 space-y-6">
                    <Skeleton className="h-8 w-48 rounded-full mb-6" />
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-4 rounded-2xl border border-red-100 flex items-center gap-4">
                            <Skeleton className="w-12 h-12 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4 rounded-full" />
                                <Skeleton className="h-5 w-full rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Map/Form Area */}
                <div className="flex-1">
                    <Skeleton className="w-full h-[400px] lg:h-full rounded-[2rem]" />
                </div>
            </div>
        </section>
    );
}
