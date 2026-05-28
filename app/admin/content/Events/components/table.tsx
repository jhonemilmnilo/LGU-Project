"use client";

import { useEvents, Event } from "../providers/EventsProvider";
import Image from "next/image";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff, MapPin, Calendar, Map } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toggleEventStatus, deleteEvent } from "@/app/admin/actions";
import { toast } from "sonner";
import { formatDate } from "@/app/admin/content/Tourism/utils/date_and_time"; // Reusing utility

export function EventsTable() {
    const { events, searchTerm, setEditingData, setIsAddModalOpen, selectedCategory } = useEvents();

    const filteredEvents = events.filter((event: Event) => {
        const matchesSearch =
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.venueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.address.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await toggleEventStatus(id, !currentStatus);
            toast.success(currentStatus ? "Event hidden successfully." : "Event published successfully.");
        } catch {
            toast.error("Failed to update status. Please try again.");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
            try {
                await deleteEvent(id);
                toast.success("Event deleted successfully.");
            } catch {
                toast.error("Failed to delete event. Please try again.");
            }
        }
    };

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-slate-50 dark:bg-[#1a1f2e]">
                    <TableRow className="border-b dark:border-[#2a3040]">
                        <TableHead className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider h-14">Event Details</TableHead>
                        <TableHead className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider h-14">Schedule</TableHead>
                        <TableHead className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider h-14">Venue / Location</TableHead>
                        <TableHead className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider h-14">Status</TableHead>
                        <TableHead className="text-right font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider h-14 px-6">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredEvents.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-64 text-center">
                                <div className="flex flex-col items-center justify-center text-slate-400">
                                    <Calendar className="w-12 h-12 mb-3 opacity-20" />
                                    <p className="text-lg font-bold">No events found, pal.</p>
                                    <p className="text-sm">Try searching for something else.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredEvents.map((event) => (
                            <TableRow key={event.id} className="group border-b dark:border-[#2a3040] hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                <TableCell className="py-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border-2 border-white dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                            {event.imageUrl ? (
                                                <Image src={event.imageUrl} alt={event.title} layout="fill" objectFit="cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Calendar className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-base font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{event.title}</p>
                                            <Badge variant="secondary" className="mt-1 font-bold text-[10px] uppercase bg-primary/10 dark:bg-primary/40 text-primary dark:text-blue-300 border-none rounded">
                                                {event.category}
                                            </Badge>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center text-sm font-bold text-slate-700 dark:text-slate-300">
                                            <span className="w-16 text-slate-400 font-medium">Start:</span> {formatDate(event.startDate)}
                                        </div>
                                        <div className="flex items-center text-sm font-bold text-slate-700 dark:text-slate-300">
                                            <span className="w-16 text-slate-400 font-medium">End:</span> {formatDate(event.endDate)}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex items-start space-x-2">
                                        <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{event.venueName}</p>
                                            <p className="text-xs text-slate-500 font-medium">{event.address}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <Badge className={`font-black uppercase tracking-wider rounded-md text-[10px] py-1 px-2.5 shadow-sm ${event.isPublished
                                        ? "bg-emerald-500 text-white border-none"
                                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-none"
                                        }`}>
                                        {event.isPublished ? "Published" : "Hidden"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-4 text-right px-6">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 group-hover:bg-white dark:group-hover:bg-white/10 transition-colors shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                                                <MoreHorizontal className="h-5 w-5 text-slate-500 group-hover:text-primary transition-colors" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 overflow-hidden bg-white dark:bg-[#151b2b] border-slate-200 dark:border-[#2a3040] shadow-2xl rounded-xl p-1.5 ring-1 ring-slate-200 dark:ring-white/5">
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setEditingData(event);
                                                    setIsAddModalOpen(true);
                                                }}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-primary/10 dark:hover:bg-primary/20 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-bold transition-all duration-200"
                                            >
                                                <Edit className="w-4 h-4" /> Edit Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleToggleStatus(event.id, event.isPublished)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold transition-all duration-200"
                                            >
                                                {event.isPublished ? (
                                                    <><EyeOff className="w-4 h-4" /> Set as Hidden</>
                                                ) : (
                                                    <><Eye className="w-4 h-4" /> Set as Public</>
                                                )}
                                            </DropdownMenuItem>
                                            {event.googleMapsUrl && (
                                                <DropdownMenuItem
                                                    onClick={() => window.open(event.googleMapsUrl as string, "_blank")}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-primary/10 dark:hover:bg-primary/20 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-bold transition-all duration-200"
                                                >
                                                    <Map className="w-4 h-4" /> View on Map
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator className="bg-slate-100 dark:bg-[#2a3040] my-1" />
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(event.id)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-bold transition-all duration-200"
                                            >
                                                <Trash2 className="w-4 h-4" /> Delete Event
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
