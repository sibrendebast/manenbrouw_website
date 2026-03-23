"use client";

import { useEffect, useState } from "react";
import { getEvents } from "@/app/actions/eventActions";
import Image from "next/image";
import { Calendar, MapPin, Users, Clock, ShoppingCart, Check } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useI18n } from "@/lib/i18n-context";
import PageHeader from "@/components/ui/PageHeader";

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const addTicket = useCartStore((state) => state.addTicket);
    const { t } = useI18n();

    useEffect(() => {
        setMounted(true);
        const loadEvents = async () => {
            try {
                const data = await getEvents();
                setEvents(data.filter((e: any) => !e.isHidden));
            } finally {
                setLoading(false);
            }
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
        const now = new Date();
        const isSoldOut = event.capacity && event.ticketsSold >= event.capacity;
        const [ticketQuantity, setTicketQuantity] = useState(1);
        const [isAdded, setIsAdded] = useState(false);
        const ticketsAvailable = event.capacity ? Math.max(0, event.capacity - event.ticketsSold) : Infinity;

        // Check if tickets are available for sale yet
        const ticketSalesStartDate = event.ticketSalesStartDate ? new Date(event.ticketSalesStartDate) : null;
        const ticketsNotYetAvailable = ticketSalesStartDate && now < ticketSalesStartDate;

        // Check if early-bird pricing applies
        const earlyBirdEndDate = event.earlyBirdEndDate ? new Date(event.earlyBirdEndDate) : null;
        const isEarlyBird = event.earlyBirdPrice && earlyBirdEndDate && now < earlyBirdEndDate;
        const currentPrice = isEarlyBird ? event.earlyBirdPrice : event.ticketPrice;

        const handleAddTickets = () => {
            // Pass the event with the current price
            const eventWithCurrentPrice = {
                ...event,
                ticketPrice: currentPrice
            };
            addTicket(eventWithCurrentPrice, ticketQuantity);
            setIsAdded(true);
            setTimeout(() => {
                setIsAdded(false);
            }, 2000);
        };

        return (
            <div className="bg-white border-2 border-black overflow-hidden hover:shadow-xl transition-shadow flex flex-col md:flex-row">
                {event.image && (
                    <div className="relative h-64 md:h-auto md:w-1/3 w-full bg-gray-100 flex-shrink-0">
                        <Image
                            src={event.image}
                            alt={event.title}
                            fill
                            className="object-cover"
                        />
                        {isPast && (
                            <div className="absolute top-4 right-4 bg-gray-600 text-white px-4 py-2 font-bold border-2 border-white">
                                {t("events.pastEvent")}
                            </div>
                        )}
                        {!isPast && isSoldOut && (
                            <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 font-bold border-2 border-white">
                                {t("events.soldOut")}
                            </div>
                        )}
                    </div>
                )}
                <div className={`p-6 flex flex-col justify-between flex-grow ${!event.image ? 'w-full' : ''}`}>
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-bold text-brewery-dark">
                                {event.title}
                            </h3>
                            {event.isPaid && !isPast && event.ticketType === "INTERNAL" && (
                                <div className="flex flex-col items-end ml-4">
                                    <span className="text-2xl font-bold text-brewery-green whitespace-nowrap">
                                        €{currentPrice?.toFixed(2)}
                                    </span>
                                    {isEarlyBird && (
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm line-through text-gray-500">
                                                €{event.ticketPrice?.toFixed(2)}
                                            </span>
                                            <span className="text-xs bg-yellow-400 text-black px-2 py-1 font-bold border border-black mt-1">
                                                Early Bird
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                            {!event.isPaid && !isPast && (
                                <span className="bg-brewery-green text-white px-3 py-1 text-sm font-bold border-2 border-black whitespace-nowrap ml-4">
                                    {t("events.free")}
                                </span>
                            )}
                        </div>

                        <p className="text-gray-700 mb-6 leading-relaxed whitespace-pre-wrap">
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
                                    <span className={event.isPaid && (event.capacity - event.ticketsSold) / event.capacity <= 0.2 && (event.capacity - event.ticketsSold) > 0 ? "text-red-500 font-bold" : ""}>
                                        {event.isPaid ? (
                                            (event.capacity - event.ticketsSold) / event.capacity <= 0.2 && (event.capacity - event.ticketsSold) > 0
                                                ? t("events.almostSoldOut")
                                                : t("events.ticketsAvailable")
                                        ) : (
                                            `${Math.max(0, event.capacity - event.ticketsSold)} ${t("events.attendees")}`
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="md:self-start w-full md:w-auto mt-4 md:mt-0">
                        {!isPast && event.isPaid && ticketsNotYetAvailable && (
                            <div className="w-full bg-blue-50 border-2 border-blue-300 p-4">
                                <p className="text-sm font-bold text-blue-900 mb-1">Tickets not yet available</p>
                                <p className="text-xs text-blue-700">
                                    Tickets will be available from: {formatDate(ticketSalesStartDate!)}
                                </p>
                            </div>
                        )}
                        {!isPast && event.isPaid && !ticketsNotYetAvailable && !isSoldOut && (
                            <div className="space-y-3">
                                {event.ticketType === "INTERNAL" ? (
                                    <>
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
                                                    onClick={() => setTicketQuantity(Math.min(ticketsAvailable, ticketQuantity + 1))}
                                                    className="px-3 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={ticketQuantity >= ticketsAvailable}
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
                                                    <Check className="h-5 w-5 mr-2" /> {t("common.success")}!
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingCart className="h-5 w-5 mr-2" /> {t("shop.addToCart")}
                                                </>
                                            )}
                                        </button>
                                    </>
                                ) : event.ticketType === "EXTERNAL" ? (
                                    <a
                                        href={event.externalTicketUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center bg-brewery-green text-white font-bold py-3 px-6 hover:bg-opacity-90 transition-colors border-2 border-black text-center"
                                    >
                                        {t("events.buyTickets")}
                                    </a>
                                ) : (
                                    <div className="w-full bg-gray-50 border-2 border-black p-4 text-center">
                                        <p className="font-bold text-brewery-dark">{t("events.atDoor")}</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {!isPast && isSoldOut && (
                            <button
                                className="w-full bg-gray-300 text-gray-500 font-bold py-3 px-6 border-2 border-gray-400 cursor-not-allowed"
                                disabled
                            >
                                {t("events.soldOut")}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white min-h-screen pb-16">
            <PageHeader 
                title={t("events.title")} 
                subtitle={t("events.subtitle")} 
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">

                {/* Upcoming Events */}
                {upcomingEvents.length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-brewery-dark mb-8">{t("events.upcoming")}</h2>
                        <div className="flex flex-col gap-8">
                            {upcomingEvents.map((event: any) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    </div>
                )}

                {/* No Upcoming Events Message */}
                {!loading && upcomingEvents.length === 0 && (
                    <div className="text-center py-16 bg-gray-50 border-2 border-black mb-16">
                        <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-brewery-dark mb-2">
                            {t("events.noEvents")}
                        </h2>
                        <p className="text-gray-600 max-w-md mx-auto">
                            {t("events.noEventsMessage")}
                        </p>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brewery-green mx-auto mb-4"></div>
                        <p className="text-gray-600">{t("common.loading") || "Loading events..."}</p>
                    </div>
                )}

                {/* Past Events */}
                {pastEvents.length > 0 && (
                    <div>
                        <h2 className="text-3xl font-bold text-brewery-dark mb-8">{t("events.past")}</h2>
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
