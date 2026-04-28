import { Skeleton } from "@/components/ui/skeleton";

export function ServicesSkeleton() {
    return (
        <section className="pt-16 md:pt-20 pb-12 px-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col items-center mb-10 md:mb-16">
                <Skeleton className="h-4 w-32 rounded-full mb-4" />
                <Skeleton className="h-10 md:h-12 w-64 md:w-96 rounded-full" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="flex flex-col items-center p-6 space-y-4 rounded-[2rem] border border-slate-100">
                        <Skeleton className="w-16 h-16 rounded-2xl" />
                        <Skeleton className="h-4 w-3/4 rounded-full" />
                    </div>
                ))}
            </div>
        </section>
    );
}
