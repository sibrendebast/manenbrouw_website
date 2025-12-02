"use client";

import { useEffect, useState } from "react";
import { getEvents } from "@/app/actions/eventActions";
import Image from "next/image";
import { Calendar, MapPin, Users, Euro, Clock, ShoppingCart, Check } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);
    const addTicket = useCartStore((state) => state.addTicket);

    useEffect(() => {
        setMounted(true);
        const loadEvents = async () => {
            const data = await getEvents();
            setEvents(data);
        };
        loadEvents();
    }, []);

    if (!mounted) return null;

    const now = new Date();

    // Separate upcoming and past events
    const upcomingEvents = events.filter((event: any) => new Date(event.date) >= now);
    const pastEvents = events.filter((event: any) => new Date(event.date) < now);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    };

    const EventCard = ({ event, isPast = false }: { event: any; isPast?: boolean }) => {
        const isSoldOut = event.capacity && event.ticketsSold >= event.capacity;
        const [ticketQuantity, setTicketQuantity] = useState(1);
        const [isAdded, setIsAdded] = useState(false);

        const handleAddTickets = () => {
            addTicket(event, ticketQuantity);
            setIsAdded(true);
            setTimeout(() => {
                setIsAdded(false);
            }, 2000);
        };

        return (
            <div className="bg-white border-2 border-black overflow-hidden hover:shadow-xl transition-shadow">
                {event.image && (
                    <div className="relative aspect-video w-full bg-gray-100">
                        <Image
                            src={event.image}
                            alt={event.title}
                            fill
                            className="object-cover"
                        />
                        {isPast && (
                            <div className="absolute top-4 right-4 bg-gray-600 text-white px-4 py-2 font-bold border-2 border-white">
                                PAST EVENT
                            </div>
                        )}
                        {!isPast && isSoldOut && (
                            <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 font-bold border-2 border-white">
                                SOLD OUT
                            </div>
                        )}
                    </div>
                )}
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-bold text-brewery-dark">
                            {event.title}
                        </h3>
                        {event.isPaid && !isPast && (
                            <span className="text-2xl font-bold text-brewery-green whitespace-nowrap ml-4">
                                €{event.ticketPrice?.toFixed(2)}
                            </span>
                        )}
                        {!event.isPaid && !isPast && (
                            <span className="bg-brewery-green text-white px-3 py-1 text-sm font-bold border-2 border-black whitespace-nowrap ml-4">
                                FREE
                            </span>
                        )}
                    </div>

                    <p className="text-gray-700 mb-6 leading-relaxed">
                        {event.description}
                    </p>

                    <div className="space-y-3 text-sm text-gray-800 mb-6">
                        <div className="flex items-center">
                            <Calendar className="h-5 w-5 mr-3 text-brewery-green flex-shrink-0" />
                            <span className="font-semibold">{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center">
                            <MapPin className="h-5 w-5 mr-3 text-brewery-green flex-shrink-0" />
                            <span>{event.location}</span>
                        </div>
                        {event.capacity && (
                            <div className="flex items-center">
                                <Users className="h-5 w-5 mr-3 text-brewery-green flex-shrink-0" />
                                <span>
                                    {event.ticketsSold} / {event.capacity} {event.isPaid ? 'tickets sold' : 'attendees'}
                                </span>
                            </div>
                        )}
                    </div>

                    {!isPast && event.isPaid && !isSoldOut && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-bold text-black">Tickets:</label>
                                <div className="flex items-center border-2 border-black">
                                    <button
                                        onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                                        className="px-3 py-1 hover:bg-gray-100 transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="px-4 font-bold">{ticketQuantity}</span>
                                    <button
                                        onClick={() => setTicketQuantity(ticketQuantity + 1)}
                                        className="px-3 py-1 hover:bg-gray-100 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={handleAddTickets}
                                disabled={isAdded}
                                className={`w-full flex items-center justify-center font-bold py-3 px-6 transition-colors border-2 border-black ${isAdded
                                    ? 'bg-green-500 text-white'
                                    : 'bg-brewery-dark text-white hover:bg-opacity-90'
                                    }`}
                            >
                                {isAdded ? (
                                    <>
                                        <Check className="h-5 w-5 mr-2" /> Added to Cart!
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                    {!isPast && !event.isPaid && !isSoldOut && (
                        <button
                            className="w-full bg-brewery-green text-white font-bold py-3 px-6 hover:bg-opacity-90 transition-colors border-2 border-black"
                            disabled
                        >
                            Register (Coming Soon)
                        </button>
                    )}
                    {!isPast && isSoldOut && (
                        <button
                            className="w-full bg-gray-300 text-gray-500 font-bold py-3 px-6 border-2 border-gray-400 cursor-not-allowed"
                            disabled
                        >
                            Sold Out
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-brewery-dark mb-4">Events</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Join us for tastings, brewery tours, and special events at Man & Brouw
                    </p>
                </div>

                {/* Upcoming Events */}
                {upcomingEvents.length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-brewery-dark mb-8">Upcoming Events</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {upcomingEvents.map((event: any) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    </div>
                )}

                {/* No Upcoming Events Message */}
                {upcomingEvents.length === 0 && (
                    <div className="text-center py-16 bg-gray-50 border-2 border-black mb-16">
                        <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-brewery-dark mb-2">
                            No Upcoming Events
                        </h2>
                        <p className="text-gray-600 max-w-md mx-auto">
                            We don't have any events scheduled at the moment. Check back soon or follow us on social media for announcements!
                        </p>
                    </div>
                )}

                {/* Past Events */}
                {pastEvents.length > 0 && (
                    <div>
                        <h2 className="text-3xl font-bold text-brewery-dark mb-8">Past Events</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-75">
                            {pastEvents.map((event: any) => (
                                <EventCard key={event.id} event={event} isPast={true} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
