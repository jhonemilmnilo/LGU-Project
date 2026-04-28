import { Skeleton } from "@/components/ui/skeleton";

export function LGUProjectsSkeleton() {
    return (
        <section className="pt-16 md:pt-20 pb-12 px-6 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-0.5" />
                        <Skeleton className="h-3 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-10 md:h-12 w-64 rounded-full" />
                </div>
                <Skeleton className="h-10 w-32 rounded-full" />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-[2rem] border border-slate-100 overflow-hidden flex flex-col">
                        <Skeleton className="w-full h-48 rounded-none" />
                        <div className="p-6 space-y-4 flex-1">
                            <Skeleton className="h-3 w-20 rounded-full" />
                            <Skeleton className="h-6 w-full rounded-full" />
                            <Skeleton className="h-4 w-3/4 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
