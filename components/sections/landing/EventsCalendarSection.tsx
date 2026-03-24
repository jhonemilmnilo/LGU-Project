"use client";

import * as React from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Event {
    id: string;
    title: string;
    description: string | null;
    category: string;
    startDate: Date;
    endDate: Date;
    venueName: string;
    imageUrl: string | null;
}

interface EventsCalendarSectionProps {
    events: Event[];
}

import { useBarangay } from "../../providers/BarangayProvider";

export function EventsCalendarSection({ events }: EventsCalendarSectionProps) {
    const { selectedBarangay } = useBarangay();

    const filteredEvents = React.useMemo(() => {
        if (selectedBarangay === "All") return events;
        return events.filter((e: any) => e.barangay === selectedBarangay);
    }, [events, selectedBarangay]);

    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [selectedDate, setSelectedDate] = React.useState(new Date());

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
            formattedDate = format(day, "d");
            const cloneDay = day;
            const hasEvents = filteredEvents.some(event => isSameDay(new Date(event.startDate), cloneDay));
            
            const isToday = isSameDay(day, new Date());
            
            days.push(
                <div
                    key={day.toString()}
                    className={cn(
                        "relative h-12 sm:h-16 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 rounded-xl group",
                        !isSameMonth(day, monthStart) ? "text-slate-300 dark:text-slate-700" : "text-slate-900 dark:text-white",
                        isSameDay(day, selectedDate) ? "bg-primary text-white shadow-xl shadow-primary/30 scale-105 z-10" : "hover:bg-slate-50 dark:hover:bg-white/5",
                        isToday && !isSameDay(day, selectedDate) && "ring-2 ring-primary ring-offset-2 dark:ring-offset-[#0f1117]"
                    )}
                    onClick={() => setSelectedDate(cloneDay)}
                >
                    <span className={cn(
                        "text-xs sm:text-sm font-black italic tracking-tighter",
                        isToday && !isSameDay(day, selectedDate) ? "text-primary" : ""
                    )}>{formattedDate}</span>
                    {hasEvents && !isSameDay(day, selectedDate) && (
                        <div className="absolute bottom-1.5 w-1 h-1 bg-primary rounded-full animate-pulse" />
                    )}
                    {hasEvents && isSameDay(day, selectedDate) && (
                        <div className="absolute bottom-1.5 w-1 h-1 bg-white rounded-full" />
                    )}
                </div>
            );
            day = addDays(day, 1);
        }
        rows.push(
            <div className="grid grid-cols-7 gap-1" key={day.toString()}>
                {days}
            </div>
        );
        days = [];
    }

    const selectedEvents = filteredEvents.filter(event => isSameDay(new Date(event.startDate), selectedDate));

    return (
        <section id="events" className="py-12 px-6 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-16">
                
                {/* Left Side: Calendar */}
                <div className="flex-1 space-y-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-primary">
                            <CalendarIcon className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Town Calendar</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">
                            Upcoming <span className="text-primary">Events</span>
                        </h2>
                    </div>

                    <div className="bg-white dark:bg-[#0f1117] rounded-[2rem] p-6 border border-slate-200 dark:border-[#2a3040] shadow-2xl shadow-primary/5 ring-1 ring-slate-200 dark:ring-white/5 max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                                {format(currentDate, "MMMM yyyy")}
                            </h3>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-xl border-slate-200 dark:border-[#2a3040]">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-xl border-slate-200 dark:border-[#2a3040]">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 mb-4">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                                <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {d}
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            {rows}
                        </div>
                    </div>
                </div>

                {/* Right Side: Event Details */}
                <div className="w-full lg:w-[450px] space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Selected Date</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                                {format(selectedDate, "MMM dd, yyyy")}
                            </h3>
                        </div>
                        <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    <ScrollArea 
                        className="h-[560px] pr-4" 
                        viewportClassName="snap-y snap-mandatory"
                    >
                        <div className="flex flex-col gap-1 pr-3">
                            <AnimatePresence mode="wait">
                            {selectedEvents.length > 0 ? (
                                selectedEvents.map((event, idx) => (
                                    <Link key={event.id} href={`/user/events/${event.id}`} className="block snap-start mb-2 last:mb-0">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="group bg-slate-50 dark:bg-white/5 rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden"
                                        >
                                            <div className="relative z-10 space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <span className="px-3 py-1 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                                                        {event.category}
                                                    </span>
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight group-hover:text-primary transition-colors">
                                                        {event.title}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic line-clamp-2">
                                                        {event.description}
                                                    </p>
                                                </div>
                                                <div className="pt-4 border-t border-slate-200 dark:border-white/5 flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                                                        <Clock className="w-3 h-3 text-primary" />
                                                        {format(new Date(event.startDate), "hh:mm a")} - {format(new Date(event.endDate), "hh:mm a")}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                                                        <MapPin className="w-3 h-3 text-primary" />
                                                        {event.venueName}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                                        </motion.div>
                                    </Link>
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[3rem]"
                                >
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <CalendarIcon className="w-8 h-8 text-slate-200" />
                                    </div>
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic leading-tight">
                                        No scheduled events<br/>on this date.
                                    </p>
                                </motion.div>
                            )}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>
                    
                    <Link href="/user/events">
                        <Button className="w-full py-4 h-auto bg-primary hover:opacity-90 text-white font-black uppercase tracking-widest text-[10px] rounded-[2rem] transition-all shadow-xl shadow-primary/25 active:scale-95 flex items-center justify-center gap-3 group">
                            <CalendarIcon className="w-4 h-4" />
                            View Full Calendar
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
