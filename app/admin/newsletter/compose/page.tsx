"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Eye, Plus, Trash2 } from "lucide-react";
import { 
    NewsletterPayload, 
    NewsletterStory, 
    NewsletterStockRow, 
    getProductsForNewsletter, 
    generateNewsletterHtml, 
    sendNewsletterPreview, 
    sendNewsletterToAll 
} from "@/app/actions/newsletterActions";

export default function ComposeNewsletterPage() {
    const [payload, setPayload] = useState<NewsletterPayload>({
        title: `Nieuwsbrief ${new Date().toLocaleString('nl-BE', { month: 'long', year: 'numeric' })}`,
        introHeading: "Hello World!",
        introBody: "Welkom bij onze nieuwsbrief! Via deze weg willen we jullie op de hoogte houden van onze nieuwste brouwsels en onze huidige voorraad.\n\nWil je iets bestellen? Antwoord dan gewoon op deze mail!",
        storiesHeading: "🎉 Nieuwtjes! 🎉",
        stories: [],
        stockHeading: "🍺 Onze Huidige Stock 🍺",
        stockRows: [],
        outroHeading: "🍺 Cheers 🍺",
        outroBody: "Om te bestellen, beantwoord gewoon deze email met welke bieren je zou willen en hoeveel. Daarna bevestigen we en sturen we de offerte op.\n\nCheers,\nSibren & Tom\nHet Man & Brouw team\n\nAarschotsesteenweg 179\n3012 Wilsele\n\nWil je deze nieuwsbrief niet meer ontvangen? Antwoord dan \"unsubscribe\" op deze mail."
    });

    const [htmlPreview, setHtmlPreview] = useState("");
    const [products, setProducts] = useState<any[]>([]);
    const [isSendingPreview, setIsSendingPreview] = useState(false);
    const [isSendingAll, setIsSendingAll] = useState(false);
    const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Fetch products on mount
    useEffect(() => {
        getProductsForNewsletter().then(data => {
            setProducts(data);
        }).catch(err => console.error("Failed to load products:", err));
    }, []);

    // Update preview HTML when payload changes
    useEffect(() => {
        const timer = setTimeout(() => {
            generateNewsletterHtml(payload).then(html => setHtmlPreview(html));
        }, 500); // debounce
        return () => clearTimeout(timer);
    }, [payload]);

    // Apply HTML to iframe
    useEffect(() => {
        if (iframeRef.current && htmlPreview) {
            const doc = iframeRef.current.contentDocument;
            if (doc) {
                doc.open();
                doc.write(htmlPreview);
                doc.close();
            }
        }
    }, [htmlPreview]);

    const handlePayloadChange = (field: keyof NewsletterPayload, value: any) => {
        setPayload(prev => ({ ...prev, [field]: value }));
    };

    const addStory = () => {
        const newStory: NewsletterStory = {
            id: Date.now().toString(),
            heading: "Nieuw Verhaal",
            body: "Voer hier je tekst in...",
            imageUrl: "",
            linkUrl: "",
            linkLabel: "Meer info"
        };
        handlePayloadChange("stories", [...payload.stories, newStory]);
    };

    const updateStory = (id: string, field: keyof NewsletterStory, value: string) => {
        handlePayloadChange("stories", payload.stories.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const removeStory = (id: string) => {
        handlePayloadChange("stories", payload.stories.filter(s => s.id !== id));
    };

    const toggleProductStock = (product: any) => {
        const exists = payload.stockRows.find(r => r.id === product.id);
        if (exists) {
            handlePayloadChange("stockRows", payload.stockRows.filter(r => r.id !== product.id));
        } else {
            let firstImage = '';
            if (product.images) {
                try {
                    const parsed = JSON.parse(product.images);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        firstImage = parsed[0];
                    }
                } catch (e) {
                    firstImage = product.images.split(',')[0] || '';
                }
            }

            // Remove square brackets or quotes if they remained
            firstImage = firstImage.replace(/[\[\]"]/g, '');

            if (firstImage && !firstImage.startsWith('http://') && !firstImage.startsWith('https://')) {
                if (typeof window !== 'undefined') {
                    firstImage = `${window.location.origin}${firstImage.startsWith('/') ? '' : '/'}${firstImage}`;
                }
            }

            const newRow: NewsletterStockRow = {
                id: product.id,
                name: product.name,
                description: `${product.style || ''}, ${product.abv || ''}%`,
                imageUrl: firstImage,
                bottlePrice: product.inStock ? `€${product.price.toFixed(2)}` : 'SOLD OUT'
            };
            handlePayloadChange("stockRows", [...payload.stockRows, newRow]);
        }
    };

    const updateStockRow = (id: string, field: keyof NewsletterStockRow, value: string) => {
        handlePayloadChange("stockRows", payload.stockRows.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const onSendPreview = async () => {
        setIsSendingPreview(true);
        setMessage(null);
        const res = await sendNewsletterPreview(payload);
        if (res.success) {
            setMessage({ type: 'success', text: 'Testmail verzonden naar info@manenbrouw.be!' });
        } else {
            setMessage({ type: 'error', text: `Fout bij verzenden: ${res.error}` });
        }
        setIsSendingPreview(false);
    };

    const onSendAll = async () => {
        if (!confirm("Weet je zeker dat je deze nieuwsbrief naar ALLE abonnees wilt sturen?")) return;
        
        setIsSendingAll(true);
        setMessage(null);
        const res = await sendNewsletterToAll(payload);
        if (res.success) {
            setMessage({ type: 'success', text: `Nieuwsbrief succesvol verzonden naar ${res.sentCount} abonnees!` });
        } else {
            setMessage({ type: 'error', text: `Fout bij verzenden: ${res.error}` });
        }
        setIsSendingAll(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 text-black">
            <div className="max-w-[98%] mx-auto px-4 h-[calc(100vh-4rem)] flex flex-col">
                
                {/* Header Actions */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/newsletter" className="text-gray-500 hover:text-brewery-dark transition-colors">
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                        <h1 className="text-3xl font-bold text-brewery-dark">Nieuwsbrief Ontwerper</h1>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={onSendPreview}
                            disabled={isSendingPreview || isSendingAll}
                            className="flex items-center gap-2 bg-white text-brewery-dark border-2 border-brewery-dark px-4 py-2 font-bold hover:bg-gray-50 disabled:opacity-50"
                        >
                            <Eye className="h-4 w-4" />
                            {isSendingPreview ? 'Verzenden...' : 'Testmail'}
                        </button>
                        <button 
                            onClick={onSendAll}
                            disabled={isSendingPreview || isSendingAll}
                            className="flex items-center gap-2 bg-brewery-dark text-white px-4 py-2 font-bold hover:bg-brewery-green disabled:opacity-50"
                        >
                            <Send className="h-4 w-4" />
                            {isSendingAll ? 'Verzenden...' : 'Verstuur naar alle abonnees'}
                        </button>
                    </div>
                </div>

                {message && (
                    <div className={`mb-6 p-4 border-l-4 ${message.type === 'success' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                {/* Split Pane */}
                <div className="flex-1 flex gap-6 min-h-0">
                    
                    {/* Left Pane: Editor */}
                    <div className="w-[35%] bg-white border-2 border-black p-6 overflow-y-auto">
                        
                        <div className="space-y-8">
                            {/* General Settings */}
                            <section>
                                <h2 className="text-xl font-bold border-b pb-2 mb-4">Algemeen</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">E-mail Onderwerp / Titel</label>
                                        <input 
                                            type="text" 
                                            value={payload.title} 
                                            onChange={e => handlePayloadChange('title', e.target.value)}
                                            className="w-full border p-2"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Intro Section */}
                            <section>
                                <h2 className="text-xl font-bold border-b pb-2 mb-4">Introductie</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">Intro Heading</label>
                                        <input 
                                            type="text" 
                                            value={payload.introHeading} 
                                            onChange={e => handlePayloadChange('introHeading', e.target.value)}
                                            className="w-full border p-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">Intro Tekst</label>
                                        <textarea 
                                            value={payload.introBody} 
                                            onChange={e => handlePayloadChange('introBody', e.target.value)}
                                            className="w-full border p-2 h-32"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Stories Section */}
                            <section>
                                <h2 className="text-xl font-bold border-b pb-2 mb-4">Verhalen / Nieuwtjes</h2>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold mb-1">Verhalen Heading</label>
                                    <input 
                                        type="text" 
                                        value={payload.storiesHeading} 
                                        onChange={e => handlePayloadChange('storiesHeading', e.target.value)}
                                        className="w-full border p-2"
                                    />
                                </div>

                                <div className="space-y-6">
                                    {payload.stories.map((story, index) => (
                                        <div key={story.id} className="border p-4 bg-gray-50 relative">
                                            <button 
                                                onClick={() => removeStory(story.id)}
                                                className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                            <h3 className="font-bold mb-4">Verhaal {index + 1}</h3>
                                            
                                            <div className="space-y-3">
                                                <input 
                                                    type="text" 
                                                    placeholder="Titel"
                                                    value={story.heading} 
                                                    onChange={e => updateStory(story.id, 'heading', e.target.value)}
                                                    className="w-full border p-2"
                                                />
                                                <textarea 
                                                    placeholder="Tekst..."
                                                    value={story.body} 
                                                    onChange={e => updateStory(story.id, 'body', e.target.value)}
                                                    className="w-full border p-2 h-24"
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder="Afbeelding URL (optioneel)"
                                                    value={story.imageUrl} 
                                                    onChange={e => updateStory(story.id, 'imageUrl', e.target.value)}
                                                    className="w-full border p-2"
                                                />
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Link URL (optioneel)"
                                                        value={story.linkUrl} 
                                                        onChange={e => updateStory(story.id, 'linkUrl', e.target.value)}
                                                        className="w-full border p-2 flex-1"
                                                    />
                                                    <input 
                                                        type="text" 
                                                        placeholder="Link Label"
                                                        value={story.linkLabel} 
                                                        onChange={e => updateStory(story.id, 'linkLabel', e.target.value)}
                                                        className="w-full border p-2 w-32"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    onClick={addStory}
                                    className="mt-4 flex items-center gap-2 text-brewery-dark font-bold hover:underline"
                                >
                                    <Plus className="h-4 w-4" /> Voeg verhaal toe
                                </button>
                            </section>

                            {/* Stock Section */}
                            <section>
                                <h2 className="text-xl font-bold border-b pb-2 mb-4">Stock Lijst</h2>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold mb-1">Stock Heading</label>
                                    <input 
                                        type="text" 
                                        value={payload.stockHeading} 
                                        onChange={e => handlePayloadChange('stockHeading', e.target.value)}
                                        className="w-full border p-2"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-semibold mb-2">Selecteer Bieren:</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {products.map(product => {
                                                const isSelected = payload.stockRows.some(r => r.id === product.id);
                                                return (
                                                    <label key={product.id} className="flex items-center gap-2 cursor-pointer p-2 border hover:bg-gray-50">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isSelected}
                                                            onChange={() => toggleProductStock(product)}
                                                            className="w-4 h-4 text-brewery-dark border-gray-300 rounded focus:ring-brewery-dark"
                                                        />
                                                        <span className="text-sm truncate">{product.name}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {payload.stockRows.length > 0 && (
                                        <div className="mt-6">
                                            <p className="text-sm font-semibold mb-2">Geselecteerde Bieren (Aanpassen):</p>
                                            <div className="space-y-2">
                                                {payload.stockRows.map(row => (
                                                    <div key={row.id} className="flex items-center gap-2 p-2 border bg-gray-50">
                                                        <span className="font-semibold text-sm w-1/3 truncate">{row.name}</span>
                                                        <input 
                                                            type="text"
                                                            value={row.description}
                                                            onChange={e => updateStockRow(row.id, 'description', e.target.value)}
                                                            className="border p-1 text-sm flex-1"
                                                            placeholder="Beschrijving"
                                                        />
                                                        <input 
                                                            type="text"
                                                            value={row.bottlePrice}
                                                            onChange={e => updateStockRow(row.id, 'bottlePrice', e.target.value)}
                                                            className="border p-1 text-sm w-24 text-right"
                                                            placeholder="Prijs (Fles)"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Outro Section */}
                            <section>
                                <h2 className="text-xl font-bold border-b pb-2 mb-4">Afsluiting</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">Outro Heading</label>
                                        <input 
                                            type="text" 
                                            value={payload.outroHeading} 
                                            onChange={e => handlePayloadChange('outroHeading', e.target.value)}
                                            className="w-full border p-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">Outro Tekst</label>
                                        <textarea 
                                            value={payload.outroBody} 
                                            onChange={e => handlePayloadChange('outroBody', e.target.value)}
                                            className="w-full border p-2 h-48"
                                        />
                                    </div>
                                </div>
                            </section>

                        </div>
                    </div>

                    {/* Right Pane: Preview */}
                    <div className="w-[65%] border-2 border-black bg-gray-200 overflow-hidden flex flex-col">
                        <div className="bg-gray-800 text-white text-xs py-1 px-3 flex justify-between">
                            <span>Preview</span>
                            <span>{payload.title}</span>
                        </div>
                        <iframe 
                            ref={iframeRef}
                            className="w-full flex-1 bg-white"
                            title="Newsletter Preview"
                            sandbox="allow-same-origin"
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}
