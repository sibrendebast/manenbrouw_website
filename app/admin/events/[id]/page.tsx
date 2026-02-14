"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { getEvent, updateEvent } from "@/app/actions/eventActions";
import { ArrowLeft, Save, Upload, X, LogOut, MapPin, Users, Euro } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { isAuthenticated, logout } = useAdminStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [event, setEvent] = useState({
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

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticated) {
            router.push("/admin/login");
            return;
        }

        const loadEvent = async () => {
            try {
                const data = await getEvent(id);
                if (data) {
                    const eventDate = new Date(data.date);
                    // Format for datetime-local input: YYYY-MM-DDTHH:mm
                    const localDate = new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * 60000)
                        .toISOString()
                        .slice(0, 16);

                    // Helper function to format datetime for input
                    const formatDatetime = (date: any) => {
                        if (!date) return "";
                        const d = new Date(date);
                        return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                            .toISOString()
                            .slice(0, 16);
                    };

                    setEvent({
                        title: data.title,
                        description: data.description,
                        date: localDate,
                        location: data.location,
                        isPaid: data.isPaid,
                        ticketPrice: data.ticketPrice?.toString() || "",
                        capacity: data.capacity?.toString() || "",
                        image: data.image || "",
                        ticketSalesStartDate: formatDatetime(data.ticketSalesStartDate),
                        earlyBirdPrice: data.earlyBirdPrice?.toString() || "",
                        earlyBirdEndDate: formatDatetime(data.earlyBirdEndDate),
                    });
                } else {
                    alert("Event not found");
                    router.push("/admin/events");
                }
            } catch (error) {
                console.error("Failed to load event", error);
                alert("Failed to load event");
            } finally {
                setLoading(false);
            }
        };

        loadEvent();
    }, [isAuthenticated, router, id]);

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
                setEvent((prev) => ({
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
        setEvent((prev) => ({
            ...prev,
            image: "",
        }));
    };

    const handleUpdateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const result = await updateEvent(id, {
                title: event.title,
                description: event.description,
                date: new Date(event.date),
                location: event.location,
                isPaid: event.isPaid,
                ticketPrice: event.isPaid ? parseFloat(event.ticketPrice) : undefined,
                capacity: event.capacity ? parseInt(event.capacity) : undefined,
                image: event.image || undefined,
                ticketSalesStartDate: event.ticketSalesStartDate ? new Date(event.ticketSalesStartDate) : undefined,
                earlyBirdPrice: event.earlyBirdPrice ? parseFloat(event.earlyBirdPrice) : undefined,
                earlyBirdEndDate: event.earlyBirdEndDate ? new Date(event.earlyBirdEndDate) : undefined,
            });

            if (result.success) {
                alert("Event updated successfully");
                router.push("/admin/events");
                router.refresh();
            } else {
                alert("Failed to update event");
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("Failed to update event");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/admin/login");
    };

    if (!mounted || !isAuthenticated) return null;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brewery-green"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 text-black">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <Link
                            href="/admin/events"
                            className="flex items-center text-brewery-dark hover:text-brewery-green font-bold mb-4"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" /> Back to Events
                        </Link>
                        <h1 className="text-4xl font-bold text-brewery-dark">
                            Edit Event
                        </h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center text-red-600 hover:text-red-800 font-bold"
                    >
                        <LogOut className="h-5 w-5 mr-2" /> Logout
                    </button>
                </div>

                <div className="bg-white p-8 border-2 border-black shadow-lg">
                    <form onSubmit={handleUpdateEvent} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold mb-1 text-black">Title</label>
                            <input
                                required
                                type="text"
                                value={event.title}
                                onChange={(e) =>
                                    setEvent({ ...event, title: e.target.value })
                                }
                                className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-1 text-black">
                                Description
                            </label>
                            <textarea
                                required
                                value={event.description}
                                onChange={(e) =>
                                    setEvent({
                                        ...event,
                                        description: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:border-brewery-green h-32"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold mb-1 text-black">
                                    Date & Time
                                </label>
                                <div className="relative">
                                    <input
                                        required
                                        type="datetime-local"
                                        value={event.date}
                                        onChange={(e) =>
                                            setEvent({ ...event, date: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1 text-black">
                                    Location
                                </label>
                                <div className="relative">
                                    <input
                                        required
                                        type="text"
                                        value={event.location}
                                        onChange={(e) =>
                                            setEvent({ ...event, location: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                    />
                                    <MapPin className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center p-4 bg-gray-50 border border-gray-200">
                            <input
                                type="checkbox"
                                id="isPaid"
                                checked={event.isPaid}
                                onChange={(e) =>
                                    setEvent({ ...event, isPaid: e.target.checked })
                                }
                                className="h-5 w-5 text-brewery-green focus:ring-brewery-green border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="isPaid" className="ml-3 block font-bold text-black cursor-pointer">
                                This is a paid event (Requires tickets)
                            </label>
                        </div>

                        {event.isPaid && (
                            <div className="space-y-6 p-4 bg-gray-50 border border-t-0 border-gray-200 -mt-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold mb-1 text-black">
                                            Ticket Price (€)
                                        </label>
                                        <div className="relative">
                                            <input
                                                required={event.isPaid}
                                                type="number"
                                                step="0.01"
                                                value={event.ticketPrice}
                                                onChange={(e) =>
                                                    setEvent({ ...event, ticketPrice: e.target.value })
                                                }
                                                className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                            />
                                            <Euro className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1 text-black">
                                            Capacity Limit (Optional)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={event.capacity}
                                                onChange={(e) =>
                                                    setEvent({ ...event, capacity: e.target.value })
                                                }
                                                className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                            />
                                            <Users className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold mb-1 text-black">
                                            Tickets Available From (Optional)
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={event.ticketSalesStartDate}
                                            onChange={(e) =>
                                                setEvent({ ...event, ticketSalesStartDate: e.target.value })
                                            }
                                            className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">When tickets become available for purchase</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1 text-black">
                                            Early-Bird Price (€, Optional)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={event.earlyBirdPrice}
                                                onChange={(e) =>
                                                    setEvent({ ...event, earlyBirdPrice: e.target.value })
                                                }
                                                className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                            />
                                            <Euro className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Discounted price for early purchasers</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-1 text-black">
                                        Early-Bird Deadline (Optional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={event.earlyBirdEndDate}
                                        onChange={(e) =>
                                            setEvent({ ...event, earlyBirdEndDate: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Deadline for early-bird discount</p>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold mb-1 text-black">
                                Event Image
                            </label>
                            <p className="text-xs text-gray-500 mb-2">Upload a cover image for the event.</p>

                            <div className="flex items-center justify-center w-full">
                                <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed cursor-pointer hover:bg-gray-100 ${!event.image ? 'border-gray-300 bg-gray-50' : 'border-brewery-green bg-green-50'}`}>
                                    {event.image ? (
                                        <div className="relative h-full w-full">
                                            <Image
                                                src={event.image}
                                                alt="Event cover"
                                                fill
                                                className="object-contain p-2"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-10 transition-all group">
                                                <div className="flex flex-col items-center justify-center">
                                                    <p className="sr-only">Change image</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-10 h-10 mb-3 text-gray-400" />
                                            <p className="text-sm text-gray-500 font-semibold">
                                                {uploading ? "Uploading..." : "Click to upload event image"}
                                            </p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                    />
                                </label>
                            </div>

                            {event.image && (
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="mt-2 text-sm text-red-600 hover:text-red-800 font-semibold flex items-center"
                                >
                                    <X className="h-4 w-4 mr-1" /> Remove Image
                                </button>
                            )}
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Link
                                href="/admin/events"
                                className="w-1/3 text-center bg-gray-200 text-black font-bold py-3 px-4 hover:bg-gray-300 transition-colors border-2 border-black"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="w-2/3 bg-brewery-green text-white font-bold py-3 px-4 hover:bg-opacity-90 transition-colors border-2 border-black disabled:opacity-50 flex justify-center items-center"
                                disabled={saving || uploading}
                            >
                                <Save className="h-5 w-5 mr-2" />
                                {saving ? "Saving Changes..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
