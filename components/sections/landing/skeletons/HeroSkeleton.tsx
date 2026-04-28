import { Skeleton } from "@/components/ui/skeleton";

export function HeroSkeleton() {
    return (
        <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-slate-950">
            {/* Background Skeleton */}
            <div className="absolute inset-0 z-0 bg-slate-900 animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70 z-10" />
            </div>

            {/* Content Skeletons */}
            <div className="relative z-20 max-w-7xl mx-auto px-6 text-center w-full flex flex-col items-center space-y-6 md:space-y-10">
                <div className="space-y-3 md:space-y-4 flex flex-col items-center">
                    {/* Tagline */}
                    <Skeleton className="h-6 w-32 md:w-48 rounded-full bg-white/20" />
                    {/* Title */}
                    <div className="space-y-4 flex flex-col items-center">
                        <Skeleton className="h-16 sm:h-20 md:h-28 w-[280px] sm:w-[400px] md:w-[600px] rounded-3xl bg-white/20" />
                        <Skeleton className="h-16 sm:h-20 md:h-28 w-[200px] sm:w-[300px] md:w-[400px] rounded-3xl bg-white/20" />
                    </div>
                </div>

                {/* Button */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Skeleton className="h-12 md:h-16 w-48 md:w-56 rounded-full bg-white/20" />
                </div>
            </div>

            {/* Navigation Controls (Arrows) */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 hidden md:flex justify-between px-4 md:px-10 pointer-events-none">
                <Skeleton className="w-14 h-14 rounded-full bg-white/20" />
                <Skeleton className="w-14 h-14 rounded-full bg-white/20" />
            </div>

            {/* Slide Indicators (Dots) */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex gap-3">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-1.5 w-3 bg-white/30 rounded-full" />
                ))}
            </div>

            {/* Bottom Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-slate-950 to-transparent z-20" />
        </section>
    );
}
