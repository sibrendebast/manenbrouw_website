import { Beer, Users, MapPin } from "lucide-react";
import Image from "next/image";

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
                            a kitchen has grown into a local microbrewery located in a shipping container. The brewery is dedicated to pushing
                            the boundaries of traditional brewing.
                        </p>
                        <p className="text-gray-700 mb-4 leading-relaxed">
                            We believe in quality over quantity, using only the finest
                            ingredients and taking the time to perfect each batch. From our
                            signature Fruited sours to our innovative Spiced Saisons,
                            every batch tells a story of creativity and craftsmanship.
                        </p>
                        <p className="text-gray-700 mb-4 leading-relaxed">
                            What makes us truly unique is our commitment to brewing each beer
                            only once. This philosophy stems from our love for creative freedom
                            and the true homebrewing spirit we fell in love with. We brew what
                            we want, when we want it. While a beer might return, there will
                            always be a new twist—keeping every batch exciting and unique.
                            We brew one batch per month, so if you don't want to miss our new
                            beers, follow us on social media or subscribe to our mailing list!
                        </p>
                    </div>
                    <div className="relative w-full max-w-sm mx-auto aspect-square border-2 border-black overflow-hidden">
                        <Image
                            src="/about/beer_assortment.jpg"
                            alt="Man & Brouw Beer Assortment"
                            width={3064}
                            height={3064}
                            className="object-cover w-full h-full"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="relative p-6 border-2 border-black overflow-hidden group min-h-[300px] flex flex-col justify-center">
                        <Image
                            src="/about/abrikozen.jpg"
                            alt="Fresh Apricots"
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/60"></div>
                        <div className="relative z-10">
                            <div className="bg-white w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm border-2 border-black">
                                <Beer className="h-8 w-8 text-brewery-green" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">Unique Flavors</h3>
                            <p className="text-gray-200">
                                We love experimenting with whole fruits, spices, and herbs.
                                But no matter the twist, the base of our beers is always
                                high-quality craft-malted local grains.
                            </p>
                        </div>
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
        </div >
    );
}
