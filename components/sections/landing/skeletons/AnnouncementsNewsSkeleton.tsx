import { Skeleton } from "@/components/ui/skeleton";

export function AnnouncementsNewsSkeleton() {
    return (
        <section className="pt-16 md:pt-24 pb-12 px-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                {/* Announcements Column */}
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4 mb-8">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <Skeleton className="h-8 w-48 rounded-full" />
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                        ))}
                    </div>
                </div>

                {/* News Column */}
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4 mb-8">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <Skeleton className="h-8 w-48 rounded-full" />
                    </div>
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4">
                                <Skeleton className="w-24 h-24 rounded-2xl flex-shrink-0" />
                                <div className="space-y-2 flex-1 py-2">
                                    <Skeleton className="h-4 w-3/4 rounded-full" />
                                    <Skeleton className="h-3 w-1/2 rounded-full" />
                                    <Skeleton className="h-2 w-full rounded-full mt-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
