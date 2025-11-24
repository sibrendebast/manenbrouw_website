import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-brewery-green text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pattern-grid-lg"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Crafted with Passion in Wilsele
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90">
            Discover unique, small-batch brews that push the boundaries of flavor.
            From Golden Stouts to Cider-Saison hybrids.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/shop"
              className="bg-white text-brewery-green font-bold py-3 px-8 hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg border-2 border-black"
            >
              Shop Our Beers
            </Link>
            <Link
              href="/about"
              className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 hover:bg-white/10 transition-all"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Beers Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-brewery-dark">
            New Arrivals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Beer 1 */}
            <div className="flex flex-col md:flex-row gap-8 items-center bg-gray-50 p-6 hover:shadow-xl transition-shadow border-2 border-black">
              <div className="relative w-full md:w-1/2 h-64 md:h-80 overflow-hidden border-2 border-black">
                <Image
                  src="https://www.manenbrouw.be/wp-content/uploads/2025/05/PXL_20250506_180954534-EDIT.jpg"
                  alt="Betoverende Becca"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="w-full md:w-1/2">
                <h3 className="text-2xl font-bold text-brewery-green mb-2">
                  Betoverende Becca
                </h3>
                <p className="text-sm font-semibold text-gray-500 mb-4">
                  Golden Stout • 5.8%
                </p>
                <p className="text-gray-600 mb-6">
                  A velvety Golden Stout enriched with coffee, cacao, vanilla, and
                  tonka beans. Silky smooth body with intense flavors.
                </p>
                <Link
                  href="/shop/betoverende-becca"
                  className="inline-flex items-center text-brewery-green font-bold hover:underline"
                >
                  View Details <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Beer 2 */}
            <div className="flex flex-col md:flex-row gap-8 items-center bg-gray-50 p-6 hover:shadow-xl transition-shadow border-2 border-black">
              <div className="relative w-full md:w-1/2 h-64 md:h-80 overflow-hidden border-2 border-black">
                <Image
                  src="https://www.manenbrouw.be/wp-content/uploads/2025/04/PXL_20250402_1732125882-scaled.jpg"
                  alt="Passionele Pommelien"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="w-full md:w-1/2">
                <h3 className="text-2xl font-bold text-brewery-green mb-2">
                  Passionele Pommelien
                </h3>
                <p className="text-sm font-semibold text-gray-500 mb-4">
                  Cider X Saison • 6.0%
                </p>
                <p className="text-gray-600 mb-6">
                  A unique blend of Cider and Saison. Local apples from Hageland
                  combined with a Saison brewed with local grains.
                </p>
                <Link
                  href="/shop/passionele-pommelien"
                  className="inline-flex items-center text-brewery-green font-bold hover:underline"
                >
                  View Details <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link
              href="/shop"
              className="inline-block border-2 border-brewery-green text-brewery-green font-bold py-3 px-8 hover:bg-brewery-green hover:text-white transition-colors"
            >
              View All Beers
            </Link>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-16 bg-brewery-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-brewery-dark">
            Follow us on Instagram
          </h2>
          <div className="max-w-6xl mx-auto">
            <div className='sk-instagram-feed' data-embed-id='25625827'></div>
            <Script src='https://widgets.sociablekit.com/instagram-feed/widget.js' strategy="lazyOnload" />
          </div>
        </div>
      </section>
    </div>
  );
}
