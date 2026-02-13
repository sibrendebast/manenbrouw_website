"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { getEvents, createEvent, deleteEvent, toggleEventHidden } from "@/app/actions/eventActions";
import { getEventTickets } from "@/app/actions/ticketActions";
import { Plus, Trash2, LogOut, Upload, X, ArrowLeft, Calendar, MapPin, Users, Euro, Edit, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AdminEventsPage() {
    const { isAuthenticated, logout } = useAdminStore();
    const [events, setEvents] = useState<any[]>([]);
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [uploading, setUploading] = useState(false);
    // const [editingId, setEditingId] = useState<string | null>(null); // Removed
    const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
    const [eventTickets, setEventTickets] = useState<Record<string, any[]>>({});

    // Form State
    const [newEvent, setNewEvent] = useState({
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
    });

    const loadEvents = async () => {
        const data = await getEvents();
        // Sort: Hidden events at the bottom
        // Sort: Hidden events at the bottom
        // Create a copy before sorting to avoid mutating read-only array from server action
        const sorted = [...data].sort((a: any, b: any) => {
            if (a.isHidden && !b.isHidden) return 1;
            if (!a.isHidden && b.isHidden) return -1;
            // Then by date
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        setEvents(sorted);
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
        });

        if (result.success) {
            loadEvents();
            setNewEvent({
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
            });
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

    const handleLogout = () => {
        logout();
        router.push("/admin/login");
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

    return (
        <div className="min-h-screen bg-gray-50 py-12 text-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <Link
                            href="/admin/dashboard"
                            className="flex items-center text-brewery-dark hover:text-brewery-green font-bold mb-4"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" /> Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-bold text-brewery-dark">
                            Events Management
                        </h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center text-red-600 hover:text-red-800 font-bold"
                    >
                        <LogOut className="h-5 w-5 mr-2" /> Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Event Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 border-2 border-black shadow-lg sticky top-24">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Plus className="h-6 w-6 mr-2" /> Add New Event
                            </h2>
                            <form onSubmit={handleAddEvent} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1 text-black">Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={newEvent.title}
                                        onChange={(e) =>
                                            setNewEvent({ ...newEvent, title: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-1 text-black">
                                        Description
                                    </label>
                                    <textarea
                                        required
                                        value={newEvent.description}
                                        onChange={(e) =>
                                            setNewEvent({
                                                ...newEvent,
                                                description: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:border-brewery-green h-24"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-1 text-black">
                                        Date & Time
                                    </label>
                                    <input
                                        required
                                        type="datetime-local"
                                        value={newEvent.date}
                                        onChange={(e) =>
                                            setNewEvent({ ...newEvent, date: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-1 text-black">
                                        Location
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={newEvent.location}
                                        onChange={(e) =>
                                            setNewEvent({ ...newEvent, location: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isPaid"
                                        checked={newEvent.isPaid}
                                        onChange={(e) =>
                                            setNewEvent({ ...newEvent, isPaid: e.target.checked })
                                        }
                                        className="h-4 w-4 text-brewery-green focus:ring-brewery-green border-gray-300 rounded"
                                    />
                                    <label htmlFor="isPaid" className="ml-2 block text-sm font-bold text-black">
                                        Paid Event (Requires Tickets)
                                    </label>
                                </div>

                                {newEvent.isPaid && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold mb-1 text-black">
                                                Ticket Price (€)
                                            </label>
                                            <input
                                                required={newEvent.isPaid}
                                                type="number"
                                                step="0.01"
                                                value={newEvent.ticketPrice}
                                                onChange={(e) =>
                                                    setNewEvent({ ...newEvent, ticketPrice: e.target.value })
                                                }
                                                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-1 text-black">
                                                Tickets Available From (Optional)
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={newEvent.ticketSalesStartDate}
                                                onChange={(e) =>
                                                    setNewEvent({ ...newEvent, ticketSalesStartDate: e.target.value })
                                                }
                                                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">When tickets become available for purchase</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-1 text-black">
                                                Early-Bird Price (€, Optional)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={newEvent.earlyBirdPrice}
                                                onChange={(e) =>
                                                    setNewEvent({ ...newEvent, earlyBirdPrice: e.target.value })
                                                }
                                                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Discounted price for early purchasers</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-1 text-black">
                                                Early-Bird Deadline (Optional)
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={newEvent.earlyBirdEndDate}
                                                onChange={(e) =>
                                                    setNewEvent({ ...newEvent, earlyBirdEndDate: e.target.value })
                                                }
                                                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Deadline for early-bird discount</p>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-bold mb-1 text-black">
                                        Capacity (Optional)
                                    </label>
                                    <input
                                        type="number"
                                        value={newEvent.capacity}
                                        onChange={(e) =>
                                            setNewEvent({ ...newEvent, capacity: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-1 text-black">
                                        Event Image (Optional)
                                    </label>
                                    <div className="flex items-center justify-center w-full">
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-black border-dashed cursor-pointer bg-gray-50 hover:bg-gray-100">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-8 h-8 mb-2 text-black" />
                                                <p className="text-sm text-black font-semibold">
                                                    {uploading
                                                        ? "Uploading..."
                                                        : "Click to upload image"}
                                                </p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                disabled={uploading}
                                            />
                                        </label>
                                    </div>
                                    {newEvent.image && (
                                        <div className="relative h-20 w-full border border-black mt-2">
                                            <Image
                                                src={newEvent.image}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                            />
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

                                <div className="space-y-2">
                                    <button
                                        type="submit"
                                        className="w-full bg-brewery-dark text-white font-bold py-3 px-4 hover:bg-opacity-90 transition-colors border-2 border-black"
                                        disabled={uploading}
                                    >
                                        {uploading ? "Uploading..." : "Add Event"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Event List */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold mb-6">Current Events</h2>
                        {events.length === 0 ? (
                            <div className="bg-white p-8 border-2 border-black text-center">
                                <p className="text-gray-500">No events yet. Create your first event!</p>
                            </div>
                        ) : (
                            events.map((event: any) => (
                                <div key={event.id} className="space-y-4"> {/* Use a new container div for the whole event item + tickets section */}
                                    <div
                                        className="bg-white p-6 border-2 border-black flex flex-col sm:flex-row gap-6 items-start"
                                    >
                                        {/* Event Details Content (Image, Text, Buttons) */}
                                        {event.image && (
                                            <div className="relative h-32 w-32 flex-shrink-0 border-2 border-black">
                                                <Image
                                                    src={event.image}
                                                    alt={event.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-grow">
                                            {/* ... event title, description, details ... */}
                                            <h3 className="text-xl font-bold text-brewery-dark mb-2">
                                                {event.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-3">
                                                {event.description}
                                            </p>
                                            <div className="space-y-1 text-sm text-black">
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-2 text-brewery-green" />
                                                    {formatDate(event.date)}
                                                </div>
                                                <div className="flex items-center">
                                                    <MapPin className="h-4 w-4 mr-2 text-brewery-green" />
                                                    {event.location}
                                                </div>
                                                {event.capacity && (
                                                    <div className="flex items-center">
                                                        <Users className="h-4 w-4 mr-2 text-brewery-green" />
                                                        {event.ticketsSold} / {event.capacity} tickets sold
                                                    </div>
                                                )}
                                                {event.isPaid && (
                                                    <div className="flex items-center">
                                                        <Euro className="h-4 w-4 mr-2 text-brewery-green" />
                                                        €{event.ticketPrice?.toFixed(2)} per ticket
                                                    </div>
                                                )}
                                                {!event.isPaid && (
                                                    <div className="inline-block bg-brewery-green text-white px-2 py-1 text-xs font-bold">
                                                        FREE EVENT
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/admin/events/${event.id}`}
                                                className="p-3 text-brewery-green hover:bg-green-50 border-2 border-transparent hover:border-brewery-green transition-all rounded-none flex items-center justify-center"
                                                title="Edit Event"
                                            >
                                                <Edit className="h-6 w-6" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    await toggleEventHidden(event.id, !event.isHidden);
                                                    loadEvents();
                                                }}
                                                className={`p-3 border-2 border-transparent transition-all rounded-none flex items-center justify-center ${event.isHidden
                                                    ? "text-gray-400 hover:text-gray-600 hover:bg-gray-50 hover:border-gray-400"
                                                    : "text-indigo-600 hover:bg-indigo-50 hover:border-indigo-600"
                                                    }`}
                                                title={event.isHidden ? "Show Event" : "Hide Event"}
                                            >
                                                {event.isHidden ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (confirm("Are you sure you want to delete this event?")) {
                                                        await deleteEvent(event.id);
                                                        loadEvents();
                                                    }
                                                }}
                                                className="p-3 text-red-600 hover:bg-red-50 border-2 border-transparent hover:border-red-600 transition-all rounded-none flex items-center justify-center"
                                                title="Remove Event"
                                            >
                                                <Trash2 className="h-6 w-6" />
                                            </button>
                                        </div>
                                    </div>
                                    {/* --- Ticket Buyers Section (Now inside the event container div) --- */}
                                    {
                                        event.isPaid && event.ticketsSold > 0 && (
                                            <div className="w-full bg-white p-6 border-2 border-black border-t-0 -mt-4 pt-8"> {/* Added styling and removed erroneous border-t-2 */}
                                                <button
                                                    onClick={() => handleToggleTickets(event.id)}
                                                    className="flex items-center justify-between w-full text-left font-bold text-brewery-dark hover:text-brewery-green transition-colors"
                                                >
                                                    <span>Ticket Buyers ({event.ticketsSold})</span>
                                                    {expandedEventId === event.id ? (
                                                        <ChevronUp className="h-5 w-5" />
                                                    ) : (
                                                        <ChevronDown className="h-5 w-5" />
                                                    )}
                                                </button>

                                                {expandedEventId === event.id && (
                                                    <div className="mt-4 space-y-2">
                                                        {/* ... Ticket Buyers List ... */}
                                                        {eventTickets[event.id] ? (
                                                            eventTickets[event.id].length > 0 ? (
                                                                eventTickets[event.id].map((ticket: any) => (
                                                                    <div
                                                                        key={ticket.id}
                                                                        className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200"
                                                                    >
                                                                        <div>
                                                                            <p className="font-semibold text-black">{ticket.buyerName}</p>
                                                                            <p className="text-sm text-gray-600">{ticket.buyerEmail}</p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="text-sm font-bold text-brewery-green">
                                                                                {ticket.quantity} {ticket.quantity === 1 ? 'ticket' : 'tickets'}
                                                                            </p>
                                                                            <p className="text-xs text-gray-500">
                                                                                €{ticket.totalPrice.toFixed(2)}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-gray-500 text-sm">No ticket purchases yet.</p>
                                                            )
                                                        ) : (
                                                            <p className="text-gray-500 text-sm">Loading...</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    }
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}