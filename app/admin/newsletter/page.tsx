import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Mail, FileText, Send, Calendar, Building2, Users, User } from "lucide-react";
import CopyEmailsButton from "./CopyEmailsButton";
import DeleteNewsletterButton from "./DeleteNewsletterButton";
import SubscribersTable from "./SubscribersTable";
import AddSubscriberForm from "./AddSubscriberForm";
import { getNewsletters } from "@/app/actions/newsletterActions";

export const dynamic = 'force-dynamic';

export default async function AdminNewsletterPage() {
    const subscribers = await prisma.newsletterSubscriber.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });

    const newsletters = await getNewsletters();
    const emails = subscribers.map((s: any) => s.email);

    return (
        <div className="min-h-screen bg-gray-50 py-12 text-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Dashboard Header */}
                <div className="mb-8">
                    <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center text-brewery-dark hover:text-brewery-green font-bold mb-4 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                    </Link>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h1 className="text-4xl font-bold text-brewery-dark flex items-center">
                            <Mail className="h-10 w-10 mr-4" />
                            Nieuwsbrieven
                        </h1>
                        <div className="flex flex-wrap items-center gap-3">
                            <Link 
                                href="/admin/newsletter/compose"
                                className="bg-brewery-dark text-white px-5 py-2.5 font-bold hover:bg-brewery-green transition-colors flex items-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                                <Mail className="h-4 w-4 mr-2" />
                                Nieuwsbrief Opstellen
                            </Link>
                            <CopyEmailsButton emails={emails} />
                        </div>
                    </div>
                </div>

                {/* Add Subscriber Box on top */}
                <AddSubscriberForm />

                {/* Split Dashboard Panels */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Panel: Subscribers List (7 cols) */}
                    <div className="lg:col-span-7 bg-white border-2 border-black p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
                            <h2 className="text-2xl font-bold text-brewery-dark flex items-center gap-2">
                                <Mail className="h-6 w-6" />
                                Abonnees
                            </h2>
                            <span className="bg-brewery-dark text-white px-3 py-1 font-bold text-sm border border-black">
                                Totaal: {subscribers.length}
                            </span>
                        </div>

                        {subscribers.length === 0 ? (
                            <div className="py-12 text-center">
                                <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Nog geen abonnees</h3>
                                <p className="text-gray-500">
                                    Zodra mensen zich inschrijven op je nieuwsbrief, verschijnen ze hier.
                                </p>
                            </div>
                        ) : (
                            <SubscribersTable subscribers={subscribers} />
                        )}
                    </div>

                    {/* Right Panel: Newsletters (Concepten & Historiek) (5 cols) */}
                    <div className="lg:col-span-5 bg-white border-2 border-black p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
                            <h2 className="text-2xl font-bold text-brewery-dark flex items-center gap-2">
                                <FileText className="h-6 w-6" />
                                Concepten & Historiek
                            </h2>
                            <span className="bg-gray-100 text-brewery-dark px-3 py-1 font-bold text-sm border border-black">
                                Totaal: {newsletters.length}
                            </span>
                        </div>

                        {newsletters.length === 0 ? (
                            <div className="py-12 text-center text-gray-500">
                                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Nog geen nieuwsbrieven</h3>
                                <p className="text-sm">
                                    Nieuwsbrieven die je opslaat als concept of verstuurt, verschijnen hier.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                                {newsletters.map((newsletter: any) => {
                                    const isDraft = newsletter.status === 'DRAFT';
                                    const isCommercialTarget = newsletter.targetAudience === 'COMMERCIAL';
                                    const isRegularTarget = newsletter.targetAudience === 'NON_COMMERCIAL';

                                    return (
                                        <div key={newsletter.id} className="border-2 border-black p-4 bg-gray-50 hover:bg-white transition-colors flex flex-col justify-between gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <span className={`text-xs font-bold px-2 py-0.5 border border-black uppercase tracking-wider shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                                                        isDraft 
                                                            ? 'bg-amber-100 text-amber-800' 
                                                            : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        {isDraft ? 'Concept' : 'Verzonden'}
                                                    </span>

                                                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 border border-black shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                                                        isCommercialTarget
                                                            ? 'bg-emerald-100 text-emerald-900 border-emerald-800'
                                                            : isRegularTarget
                                                            ? 'bg-blue-100 text-blue-900 border-blue-800'
                                                            : 'bg-gray-200 text-gray-800'
                                                    }`}>
                                                        {isCommercialTarget ? (
                                                            <>
                                                                <Building2 className="h-3 w-3 text-emerald-700" />
                                                                <span>Zakelijk</span>
                                                            </>
                                                        ) : isRegularTarget ? (
                                                            <>
                                                                <User className="h-3 w-3 text-blue-700" />
                                                                <span>Particulier</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Users className="h-3 w-3 text-gray-600" />
                                                                <span>Alle abonnees</span>
                                                            </>
                                                        )}
                                                    </span>
                                                </div>

                                                <h3 className="font-bold text-lg text-brewery-dark line-clamp-2 leading-tight mb-2">
                                                    {newsletter.title}
                                                </h3>
                                                
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>
                                                        {isDraft ? 'Bewerkt: ' : 'Verzonden: '}
                                                        {formatDate(newsletter.updatedAt)}
                                                    </span>
                                                </div>

                                                {!isDraft && (
                                                    <div className="flex items-center gap-1.5 text-xs text-brewery-green font-bold mt-1">
                                                        <Send className="h-3.5 w-3.5" />
                                                        <span>
                                                            Verzonden naar {newsletter.sentCount || 0} abonnees {isCommercialTarget ? '(Zakelijk)' : isRegularTarget ? '(Particulier)' : ''}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                                                <Link
                                                    href={`/admin/newsletter/compose?id=${newsletter.id}`}
                                                    className="bg-white hover:bg-gray-100 border border-black px-3 py-1 text-sm font-bold shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all inline-flex items-center gap-1"
                                                >
                                                    {isDraft ? 'Bewerken' : 'Bekijken'}
                                                </Link>
                                                <DeleteNewsletterButton id={newsletter.id} status={newsletter.status} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
}
