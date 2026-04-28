import { Skeleton } from "@/components/ui/skeleton";

export function EventsCalendarSkeleton() {
    return (
        <section className="pt-16 md:pt-24 pb-12 px-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Left Side: Events List */}
                <div className="flex-1 space-y-6">
                    <div className="space-y-4 max-w-sm mb-8">
                        <Skeleton className="h-3 w-24 rounded-full" />
                        <Skeleton className="h-10 md:h-12 w-full rounded-full" />
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-3xl border border-slate-100">
                                <Skeleton className="w-16 h-16 rounded-2xl" />
                                <div className="flex-1 space-y-2 py-1">
                                    <Skeleton className="h-5 w-3/4 rounded-full" />
                                    <Skeleton className="h-3 w-1/2 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Right Side: Calendar */}
                <div className="w-full lg:w-[450px]">
                    <Skeleton className="w-full h-[400px] rounded-[2rem]" />
                </div>
            </div>
        </section>
    );
}
