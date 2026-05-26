"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { getEvents, createEvent, deleteEvent, toggleEventHidden } from "@/app/actions/eventActions";
import { getEventTickets } from "@/app/actions/ticketActions";
import { Plus, Trash2, Upload, X, ArrowLeft, Calendar, MapPin, Users, Euro, Pencil, ChevronDown, ChevronUp, Eye, EyeOff, RefreshCw } from "lucide-react";
import { syncAllActiveEventsTicketCounts } from "@/app/actions/eventSyncActions";
import Image from "next/image";
import Link from "next/link";

const EMPTY_FORM = {
    title: "",
    description: "",
    date: "",
    location: "",
    isPaid: false,
    ticketPrice: "",
    capacity: "",
    image: "",
    ticketSalesStartDate: "",
    earlyBirdPrice: "",
    earlyBirdEndDate: "",
    ticketType: "INTERNAL" as "INTERNAL" | "EXTERNAL" | "AT_DOOR",
    externalTicketUrl: "",
};

export default function AdminEventsPage() {
    const { isAuthenticated } = useAdminStore();
    const [events, setEvents] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newEvent, setNewEvent] = useState({ ...EMPTY_FORM });
    const [uploading, setUploading] = useState(false);
    const [filterType, setFilterType] = useState("ALL"); // ALL, UPCOMING, PAST, HIDDEN
    const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [eventTickets, setEventTickets] = useState<Record<string, any[]>>({});
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const loadEvents = async () => {
        const data = await getEvents();
        const sorted = [...data].sort((a: any, b: any) => {
            if (a.isHidden && !b.isHidden) return 1;
            if (!a.isHidden && b.isHidden) return -1;
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        setEvents(sorted);
    };

    const handleSyncTickets = async () => {
        setSyncing(true);
        const result = await syncAllActiveEventsTicketCounts();
        if (result.success) {
            await loadEvents();
            alert("Ticket counts synced successfully based on paid orders.");
        } else {
            alert("Failed to sync ticket counts.");
        }
        setSyncing(false);
    };

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticated) {
            router.push("/admin/login");
        } else {
            loadEvents();
        }
    }, [isAuthenticated, router]);

    if (!mounted || !isAuthenticated) return null;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("files", e.target.files[0]);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.success && data.urls.length > 0) {
                setNewEvent((prev) => ({
                    ...prev,
                    image: data.urls[0],
                }));
            } else {
                alert("Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setNewEvent((prev) => ({
            ...prev,
            image: "",
        }));
    };

    const handleAddEvent = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = await createEvent({
            title: newEvent.title,
            description: newEvent.description,
            date: new Date(newEvent.date),
            location: newEvent.location,
            isPaid: newEvent.isPaid,
            ticketPrice: newEvent.isPaid ? parseFloat(newEvent.ticketPrice) : undefined,
            capacity: newEvent.capacity ? parseInt(newEvent.capacity) : undefined,
            image: newEvent.image || undefined,
            ticketSalesStartDate: newEvent.ticketSalesStartDate ? new Date(newEvent.ticketSalesStartDate) : undefined,
            earlyBirdPrice: newEvent.earlyBirdPrice ? parseFloat(newEvent.earlyBirdPrice) : undefined,
            earlyBirdEndDate: newEvent.earlyBirdEndDate ? new Date(newEvent.earlyBirdEndDate) : undefined,
            ticketType: newEvent.ticketType,
            externalTicketUrl: newEvent.externalTicketUrl || undefined,
        });

        if (result.success) {
            loadEvents();
            setNewEvent({ ...EMPTY_FORM });
            setShowForm(false);
        } else {
            alert("Failed to add event");
        }
    };

    const handleToggleTickets = async (eventId: string) => {
        if (expandedEventId === eventId) {
            setExpandedEventId(null);
        } else {
            setExpandedEventId(eventId);
            if (!eventTickets[eventId]) {
                const tickets = await getEventTickets(eventId);
                setEventTickets(prev => ({ ...prev, [eventId]: tickets }));
            }
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const filteredEvents = events.filter((event) => {
        if (filterType === "ALL") return true;
        if (filterType === "HIDDEN") return event.isHidden;
        
        const isPast = new Date(event.date).getTime() < Date.now();
        if (filterType === "UPCOMING") return !event.isHidden && !isPast;
        if (filterType === "PAST") return !event.isHidden && isPast;
        
        return true;
    });

    const filterOptions = [
        { label: "All", value: "ALL" },
        { label: "Upcoming", value: "UPCOMING" },
        { label: "Past", value: "PAST" },
        { label: "Hidden", value: "HIDDEN" },
    ];

    return (
        <div className="min-h-screen bg-gray-100 text-black">
            {/* Sticky header */}
            <div className="sticky top-0 z-10 bg-white border-b-2 border-black shadow-sm">
                <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
                    <Link href="/admin/dashboard" className="text-brewery-dark hover:text-brewery-green">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-xl font-black text-brewery-dark flex-1">Events</h1>
                    <span className="text-sm text-gray-400 font-semibold">{filteredEvents.length}</span>
                    <button
                        onClick={handleSyncTickets}
                        disabled={syncing}
                        className={`p-2 transition-colors border border-transparent rounded-full ${
                            syncing ? "text-gray-400" : "text-brewery-green hover:bg-green-50 hover:border-brewery-green"
                        }`}
                        title="Sync Tickets"
                    >
                        <RefreshCw className={`h-5 w-5 ${syncing ? "animate-spin" : ""}`} />
                    </button>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-1.5 bg-brewery-dark text-white px-4 py-2 font-bold text-sm border-2 border-black hover:bg-brewery-green transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Add
                    </button>
                </div>

                {/* Category/Status filter pills */}
                <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-1 scrollbar-hide max-w-2xl mx-auto">
                    {filterOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setFilterType(opt.value)}
                            className={`shrink-0 px-3 py-1.5 rounded-full border-2 text-xs font-bold transition-all ${
                                filterType === opt.value
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-600 border-gray-300 hover:border-black"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Event card list */}
            <div className="px-3 pt-4 pb-24 max-w-2xl mx-auto space-y-3">
                {filteredEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Calendar className="h-14 w-14 text-gray-300 mb-4" />
                        <p className="text-gray-500 font-semibold text-lg">No events found</p>
                    </div>
                ) : (
                    filteredEvents.map((event: any) => {
                        const imgSrc = !event.image ? "/logo.png" : event.image;
                        const isPast = new Date(event.date).getTime() < Date.now();

                        return (
                            <div key={event.id} className="space-y-2">
                                <div
                                    className={`bg-white border-2 border-black flex overflow-hidden ${
                                        event.isHidden ? "opacity-60" : ""
                                    }`}
                                >
                                    {/* Event image — fills card height */}
                                    <div className="relative w-28 self-stretch shrink-0 bg-gray-100">
                                        <Image src={imgSrc} alt={event.title} fill className="object-cover" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 px-3 py-2.5 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-black text-brewery-dark text-sm leading-tight truncate">
                                                    {event.title}
                                                </p>
                                                <span
                                                    className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                        event.isHidden
                                                            ? "bg-gray-100 text-gray-500"
                                                            : isPast
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-green-100 text-green-800"
                                                    }`}
                                                >
                                                    {event.isHidden ? "Hidden" : isPast ? "Past" : "Upcoming"}
                                                </span>
                                            </div>

                                            <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-snug">
                                                {event.description}
                                            </p>

                                            <div className="mt-2 space-y-0.5">
                                                <div className="flex items-center text-xs text-gray-700">
                                                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-brewery-green shrink-0" />
                                                    <span className="truncate">{formatDate(event.date)}</span>
                                                </div>
                                                <div className="flex items-center text-xs text-gray-700">
                                                    <MapPin className="h-3.5 w-3.5 mr-1.5 text-brewery-green shrink-0" />
                                                    <span className="truncate">{event.location}</span>
                                                </div>
                                                {event.capacity && (
                                                    <div className="flex items-center text-xs text-gray-700">
                                                        <Users className="h-3.5 w-3.5 mr-1.5 text-brewery-green shrink-0" />
                                                        <span>
                                                            {event.ticketsSold} / {event.capacity} sold
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Pricing + actions */}
                                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                                            <div className="flex flex-col">
                                                <span className="font-black text-brewery-dark text-sm leading-none">
                                                    {event.isPaid ? `€${event.ticketPrice?.toFixed(2)}` : "FREE"}
                                                </span>
                                                {event.isPaid && (
                                                    <span className="text-[9px] text-gray-400 font-semibold uppercase mt-0.5">
                                                        {event.ticketType?.toLowerCase().replace("_", " ")}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex gap-1.5">
                                                <Link
                                                    href={`/admin/events/${event.id}`}
                                                    className="p-2 bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={async () => {
                                                        await toggleEventHidden(event.id, !event.isHidden);
                                                        loadEvents();
                                                    }}
                                                    className={`p-2 border transition-colors ${
                                                        event.isHidden
                                                            ? "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                                                            : "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100"
                                                    }`}
                                                    title={event.isHidden ? "Show" : "Hide"}
                                                >
                                                    {event.isHidden ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (confirm("Delete this event?")) {
                                                            await deleteEvent(event.id);
                                                            loadEvents();
                                                        }
                                                    }}
                                                    className="p-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Collapsible Ticket Buyers */}
                                {event.isPaid && event.ticketsSold > 0 && (
                                    <div className="bg-white border-2 border-black p-3 space-y-2 mt-[-8px]">
                                        <button
                                            onClick={() => handleToggleTickets(event.id)}
                                            className="flex items-center justify-between w-full font-bold text-xs text-brewery-dark hover:text-brewery-green transition-colors"
                                        >
                                            <span>Tickets Sold ({event.ticketsSold})</span>
                                            {expandedEventId === event.id ? (
                                                <ChevronUp className="h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4" />
                                            )}
                                        </button>

                                        {expandedEventId === event.id && (
                                            <div className="mt-2 space-y-1.5 pt-2 border-t border-gray-100">
                                                {eventTickets[event.id] ? (
                                                    eventTickets[event.id].length > 0 ? (
                                                        eventTickets[event.id].map((ticket: any) => (
                                                            <div
                                                                key={ticket.id}
                                                                className={`flex justify-between items-center p-2 bg-gray-50 border text-xs ${
                                                                    ticket.order?.status === "paid"
                                                                        ? "border-gray-200"
                                                                        : "border-red-200 opacity-75"
                                                                }`}
                                                            >
                                                                <div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <p className="font-semibold text-black">
                                                                            {ticket.buyerName}
                                                                        </p>
                                                                        {ticket.order?.status !== "paid" && (
                                                                            <span className="text-[8px] bg-red-100 text-red-600 px-1 py-0.2 font-bold uppercase border border-red-200">
                                                                                {ticket.order?.status || "unpaid"}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-gray-500 font-medium text-[10px]">
                                                                        {ticket.buyerEmail}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right shrink-0">
                                                                    <p className="font-bold text-brewery-green">
                                                                        {ticket.quantity}{" "}
                                                                        {ticket.quantity === 1 ? "tkt" : "tkts"}
                                                                    </p>
                                                                    <p className="text-[10px] text-gray-500">
                                                                        €{ticket.totalPrice.toFixed(2)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-500 text-xs text-center py-2">
                                                            No ticket purchases yet.
                                                        </p>
                                                    )
                                                ) : (
                                                    <p className="text-gray-500 text-xs text-center py-2 animate-pulse">
                                                        Loading...
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Event Modal Bottom Sheet */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />

                    {/* Sheet */}
                    <div className="relative bg-white border-t-2 sm:border-2 border-black w-full sm:max-w-lg sm:max-h-[90vh] max-h-[92vh] overflow-y-auto z-10">
                        {/* Sheet header */}
                        <div className="sticky top-0 bg-white border-b-2 border-black flex items-center justify-between px-4 py-3 z-10">
                            <h2 className="font-black text-lg text-brewery-dark flex items-center gap-2">
                                <Plus className="h-5 w-5" /> Add New Event
                            </h2>
                            <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-full">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleAddEvent} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Title</label>
                                <input
                                    required
                                    type="text"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    className="w-full px-3 py-2.5 border-2 border-black focus:outline-none focus:border-brewery-green text-base"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1">Description</label>
                                <textarea
                                    required
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    className="w-full px-3 py-2.5 border-2 border-black focus:outline-none focus:border-brewery-green h-24 text-base resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-bold mb-1">Date & Time</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                        className="w-full px-3 py-2.5 border-2 border-black focus:outline-none focus:border-brewery-green text-base"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-1">Location</label>
                                    <input
                                        required
                                        type="text"
                                        value={newEvent.location}
                                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                        className="w-full px-3 py-2.5 border-2 border-black focus:outline-none focus:border-brewery-green text-base"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center py-1">
                                <input
                                    type="checkbox"
                                    id="isPaid"
                                    checked={newEvent.isPaid}
                                    onChange={(e) => setNewEvent({ ...newEvent, isPaid: e.target.checked })}
                                    className="h-5 w-5 text-brewery-green focus:ring-brewery-green border-2 border-black rounded"
                                />
                                <label
                                    htmlFor="isPaid"
                                    className="ml-2 block text-sm font-bold text-black select-none"
                                >
                                    Paid Event
                                </label>
                            </div>

                            {newEvent.isPaid && (
                                <div className="space-y-4 pt-4 border-t-2 border-black border-dashed">
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Ticket Type</label>
                                        <select
                                            value={newEvent.ticketType}
                                            onChange={(e) =>
                                                setNewEvent({
                                                    ...newEvent,
                                                    ticketType: e.target.value as any,
                                                })
                                            }
                                            className="w-full px-3 py-2.5 border-2 border-black focus:outline-none focus:border-brewery-green text-base"
                                        >
                                            <option value="INTERNAL">Sold on This Website</option>
                                            <option value="EXTERNAL">Sold on External Website</option>
                                            <option value="AT_DOOR">Tickets at the Door</option>
                                        </select>
                                    </div>

                                    {newEvent.ticketType === "EXTERNAL" && (
                                        <div>
                                            <label className="block text-sm font-bold mb-1">External Ticket URL</label>
                                            <input
                                                required
                                                type="url"
                                                placeholder="https://..."
                                                value={newEvent.externalTicketUrl}
                                                onChange={(e) =>
                                                    setNewEvent({ ...newEvent, externalTicketUrl: e.target.value })
                                                }
                                                className="w-full px-3 py-2.5 border-2 border-black focus:outline-none focus:border-brewery-green text-base"
                                            />
                                        </div>
                                    )}

                                    {newEvent.ticketType === "INTERNAL" && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold mb-1">Ticket Price (€)</label>
                                                <input
                                                    required={newEvent.isPaid && newEvent.ticketType === "INTERNAL"}
                                                    type="number"
                                                    step="0.01"
                                                    value={newEvent.ticketPrice}
                                                    onChange={(e) =>
                                                        setNewEvent({ ...newEvent, ticketPrice: e.target.value })
                                                    }
                                                    className="w-full px-3 py-2.5 border-2 border-black focus:outline-none focus:border-brewery-green text-base"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold mb-1">
                                                    Tickets Available From (Optional)
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    value={newEvent.ticketSalesStartDate}
                                                    onChange={(e) =>
                                                        setNewEvent({
                                                            ...newEvent,
                                                            ticketSalesStartDate: e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-3 py-2.5 border-2 border-black focus:outline-none focus:border-brewery-green text-base"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-sm font-bold mb-1">
                                                        Early-Bird Price (€, Optional)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={newEvent.earlyBirdPrice}
                                                        onChange={(e) =>
                                                            setNewEvent({
                                                                ...newEvent,
                                                                earlyBirdPrice: e.target.value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2.5 border-2 border-black focus:outline-none focus:border-brewery-green text-base"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold mb-1">
                                                        Early-Bird Deadline (Optional)
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        value={newEvent.earlyBirdEndDate}
                                                        onChange={(e) =>
                                                            setNewEvent({
                                                                ...newEvent,
                                                                earlyBirdEndDate: e.target.value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2.5 border-2 border-black focus:outline-none focus:border-brewery-green text-base"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold mb-1">Capacity (Optional)</label>
                                <input
                                    type="number"
                                    value={newEvent.capacity}
                                    onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                                    className="w-full px-3 py-2.5 border-2 border-black focus:outline-none focus:border-brewery-green text-base"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1">Event Image (Optional)</label>
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-black border-dashed cursor-pointer bg-gray-50 hover:bg-gray-100">
                                    <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                        <Upload className="w-6 h-6 mb-1 text-black" />
                                        <span className="text-sm text-black font-bold">
                                            {uploading ? "Uploading..." : "Tap to upload"}
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                    />
                                </label>
                                {newEvent.image && (
                                    <div className="relative h-20 w-full border border-black mt-2">
                                        <Image src={newEvent.image} alt="Preview" fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full bg-brewery-dark text-white font-black py-3.5 border-2 border-black hover:bg-brewery-green transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-base"
                            >
                                {uploading ? "Uploading..." : "Add Event"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}