import { Calendar, MapPin, Clock } from "lucide-react";

export default function EventsPage() {
    const events = [
        {
            id: 1,
            title: "Summer Beer Fest",
            date: "June 15, 2025",
            time: "14:00 - 22:00",
            location: "Man & Brouw Brewery",
            description:
                "Join us for a day of sun, music, and great beer! We'll be tapping our new summer releases and serving delicious food from local food trucks.",
        },
        {
            id: 2,
            title: "Brewing Workshop",
            date: "July 10, 2025",
            time: "10:00 - 16:00",
            location: "Man & Brouw Brewery",
            description:
                "Learn the art of brewing from our master brewers. This hands-on workshop covers everything from grain to glass. Lunch and tasting included.",
        },
        {
            id: 3,
            title: "Tap Takeover: The Capital",
            date: "August 5, 2025",
            time: "18:00 - 23:00",
            location: "The Capital, Leuven",
            description:
                "We're taking over the taps at The Capital! Come taste our full range of beers and meet the team.",
        },
    ];

    return (
        <div className="bg-white min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-brewery-dark mb-4">
                        Upcoming Events
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Join us for tastings, workshops, and festivals.
                    </p>
                </div>

                <div className="space-y-8 max-w-4xl mx-auto">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="bg-white border-2 border-black p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6"
                        >
                            <div className="flex-shrink-0 bg-brewery-green/10 p-4 flex flex-col items-center justify-center w-full md:w-32 text-center border-2 border-black">
                                <span className="text-brewery-green font-bold text-xl block">
                                    {event.date.split(",")[0].split(" ")[1]}
                                </span>
                                <span className="text-brewery-dark font-bold text-3xl block">
                                    {event.date.split(",")[0].split(" ")[0]}
                                </span>
                            </div>
                            <div className="flex-grow">
                                <h3 className="text-2xl font-bold text-brewery-dark mb-2">
                                    {event.title}
                                </h3>
                                <p className="text-gray-600 mb-4">{event.description}</p>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-2" />
                                        {event.time}
                                    </div>
                                    <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        {event.location}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-center md:justify-end">
                                <button className="bg-brewery-dark text-white font-bold py-2 px-6 hover:bg-opacity-90 transition-colors w-full md:w-auto border-2 border-black">
                                    RSVP
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
