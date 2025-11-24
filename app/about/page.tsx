import { Beer, Users, MapPin } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="bg-white min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-brewery-dark mb-4">
                        About Man & Brouw
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Brewing with passion, experimenting with flavor, and sharing the love
                        for craft beer in Wilsele.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-20">
                    <div>
                        <h2 className="text-3xl font-bold text-brewery-green mb-6">
                            Our Story
                        </h2>
                        <p className="text-gray-700 mb-4 leading-relaxed">
                            Man & Brouw started as a passion project between friends who shared a
                            love for unique, flavorful beers. What began as small experiments in
                            a garage has grown into a local microbrewery dedicated to pushing
                            the boundaries of traditional brewing.
                        </p>
                        <p className="text-gray-700 mb-4 leading-relaxed">
                            We believe in quality over quantity, using only the finest
                            ingredients and taking the time to perfect each recipe. From our
                            signature Golden Stouts to our innovative Cider-Saison hybrids,
                            every bottle tells a story of creativity and craftsmanship.
                        </p>
                    </div>
                    <div className="bg-gray-100 h-80 flex items-center justify-center border-2 border-black">
                        {/* Placeholder for brewery image */}
                        <Beer className="h-24 w-24 text-gray-300" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-6 bg-brewery-light border-2 border-black">
                        <div className="bg-white w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm border-2 border-black">
                            <Beer className="h-8 w-8 text-brewery-green" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Unique Flavors</h3>
                        <p className="text-gray-600">
                            We experiment with bold ingredients like coffee, cacao, and tonka
                            beans to create unforgettable taste experiences.
                        </p>
                    </div>
                    <div className="p-6 bg-brewery-light border-2 border-black">
                        <div className="bg-white w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm border-2 border-black">
                            <Users className="h-8 w-8 text-brewery-green" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Community</h3>
                        <p className="text-gray-600">
                            We are proud to be part of the Wilsele community and love sharing
                            our passion with locals and visitors alike.
                        </p>
                    </div>
                    <div className="p-6 bg-brewery-light border-2 border-black">
                        <div className="bg-white w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm border-2 border-black">
                            <MapPin className="h-8 w-8 text-brewery-green" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Local Roots</h3>
                        <p className="text-gray-600">
                            Located at Aarschotsesteenweg 179, 3012 Wilsele. Come visit us and
                            taste the difference!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
