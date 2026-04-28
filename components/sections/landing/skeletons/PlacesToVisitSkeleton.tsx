import { Skeleton } from "@/components/ui/skeleton";

export function PlacesToVisitSkeleton() {
    return (
        <section className="pt-8 md:pt-12 pb-8 md:pb-12 px-6 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="space-y-4 mb-6 md:mb-10 w-full max-w-sm">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-10 md:h-12 w-full rounded-full" />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mt-6 md:mt-10 lg:mt-12">
                {/* Active double-wide card */}
                <Skeleton className="col-span-2 h-[180px] md:h-[280px] rounded-2xl md:rounded-[2rem] w-full" />
                {/* Regular card */}
                <Skeleton className="col-span-1 h-[180px] md:h-[280px] rounded-2xl md:rounded-[2rem] w-full hidden md:block" />
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center gap-3 mt-8 md:mt-12">
                <Skeleton className="h-2 w-10 rounded-full" />
                <Skeleton className="h-2 w-3 rounded-full" />
                <Skeleton className="h-2 w-3 rounded-full" />
            </div>
            
            {/* Button */}
            <div className="flex justify-center mt-8 md:mt-12">
                <Skeleton className="h-12 w-full md:w-[400px] rounded-full" />
            </div>
        </section>
    );
}
