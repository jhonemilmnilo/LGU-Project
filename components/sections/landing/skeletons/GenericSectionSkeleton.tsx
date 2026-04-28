import { Skeleton } from "@/components/ui/skeleton";

export function GenericSectionSkeleton() {
    return (
        <section className="pt-16 md:pt-24 pb-12 px-6 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="space-y-4 mb-6 md:mb-10 w-full max-w-sm">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-10 md:h-12 w-full rounded-full" />
            </div>

            {/* Content List */}
            <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col md:flex-row gap-6 p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <Skeleton className="w-full md:w-48 h-48 rounded-2xl" />
                        <div className="flex-1 space-y-4 py-4">
                            <Skeleton className="h-4 w-24 rounded-full" />
                            <Skeleton className="h-6 w-3/4 rounded-full" />
                            <Skeleton className="h-4 w-full rounded-full" />
                            <Skeleton className="h-4 w-5/6 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
