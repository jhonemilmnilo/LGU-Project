import { Skeleton } from "@/components/ui/skeleton";

export function DiningLodgingSkeleton() {
    return (
        <section className="pt-8 md:pt-12 pb-8 md:pb-12 px-6 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div className="space-y-4 w-full max-w-sm">
                    <Skeleton className="h-3 w-24 rounded-full" />
                    <Skeleton className="h-10 md:h-12 w-full rounded-full" />
                </div>
                <div className="flex gap-2 items-end">
                    <Skeleton className="h-10 w-32 rounded-full" />
                    <Skeleton className="h-10 w-32 rounded-full" />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 mt-6 md:mt-10 lg:mt-12">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col space-y-4">
                        <Skeleton className="aspect-[4/3] rounded-2xl md:rounded-[2rem] w-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-3/4 rounded-full" />
                            <Skeleton className="h-4 w-1/2 rounded-full" />
                            <Skeleton className="h-3 w-1/4 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
