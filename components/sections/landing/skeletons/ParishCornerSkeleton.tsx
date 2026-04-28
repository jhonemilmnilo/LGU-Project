import { Skeleton } from "@/components/ui/skeleton";

export function ParishCornerSkeleton() {
    return (
        <section className="pt-16 md:pt-20 pb-12 px-6 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col items-center mb-10 md:mb-16">
                <Skeleton className="h-4 w-32 rounded-full mb-4" />
                <Skeleton className="h-10 md:h-12 w-64 md:w-96 rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {/* Left Side: Image/Info */}
                <div className="space-y-6">
                    <Skeleton className="w-full aspect-video rounded-[2rem]" />
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-3/4 rounded-full" />
                        <Skeleton className="h-4 w-full rounded-full" />
                        <Skeleton className="h-4 w-5/6 rounded-full" />
                    </div>
                </div>

                {/* Right Side: Schedules */}
                <div className="space-y-4">
                    <Skeleton className="h-8 w-48 rounded-full mb-6" />
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex justify-between items-center p-4 border border-slate-100 rounded-2xl">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24 rounded-full" />
                                <Skeleton className="h-3 w-32 rounded-full" />
                            </div>
                            <Skeleton className="h-8 w-24 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
