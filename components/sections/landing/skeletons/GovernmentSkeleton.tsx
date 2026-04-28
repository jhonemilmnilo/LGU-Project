import { Skeleton } from "@/components/ui/skeleton";

export function GovernmentSkeleton() {
    return (
        <section className="pt-8 md:pt-24 pb-12 md:pb-8 px-6 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col items-center justify-center space-y-4 mb-10 md:mb-20">
                <Skeleton className="h-4 w-32 rounded-full" />
                <Skeleton className="h-10 md:h-12 w-64 md:w-96 rounded-full" />
                <Skeleton className="h-4 w-48 rounded-full" />
                <div className="flex gap-4 mt-8">
                    <Skeleton className="h-10 w-32 rounded-2xl" />
                    <Skeleton className="h-10 w-32 rounded-2xl" />
                </div>
            </div>

            <div className="flex flex-col items-center space-y-6 md:space-y-10">
                {/* Leader Card */}
                <div className="flex flex-col items-center space-y-6">
                    <Skeleton className="w-48 h-48 md:w-56 md:h-56 rounded-full" />
                    <div className="space-y-2 flex flex-col items-center">
                        <Skeleton className="h-8 w-48 rounded-full" />
                        <Skeleton className="h-4 w-32 rounded-full" />
                    </div>
                </div>

                {/* Council Members */}
                <div className="flex flex-wrap justify-center gap-x-6 md:gap-x-10 gap-y-10 md:gap-y-12 w-full pt-4 md:pt-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="flex flex-col items-center space-y-4 w-[140px] sm:w-[160px] md:w-[180px]">
                            <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full" />
                            <div className="space-y-2 flex flex-col items-center w-full">
                                <Skeleton className="h-4 w-3/4 rounded-full" />
                                <Skeleton className="h-3 w-1/2 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
