import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import DeleteSubscriberButton from "./DeleteSubscriberButton";
import CopyEmailsButton from "./CopyEmailsButton";

export const dynamic = 'force-dynamic';

export default async function AdminNewsletterPage() {
    const subscribers = await prisma.newsletterSubscriber.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });

    const emails = subscribers.map(s => s.email);

    return (
        <div className="min-h-screen bg-gray-50 py-12 text-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center text-brewery-dark hover:text-brewery-green font-bold mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                    </Link>
                    <div className="flex justify-between items-center">
                        <h1 className="text-4xl font-bold text-brewery-dark flex items-center">
                            <Mail className="h-10 w-10 mr-4" />
                            Newsletter Subscribers
                        </h1>
                        <div className="flex items-center gap-4">
                            <CopyEmailsButton emails={emails} />
                            <div className="bg-white px-4 py-2 border-2 border-black font-bold">
                                Total: {subscribers.length}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-black overflow-hidden">
                    {subscribers.length === 0 ? (
                        <div className="p-12 text-center">
                            <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No subscribers yet</h3>
                            <p className="text-gray-500">
                                When people subscribe to your newsletter, they will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Email Address
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Subscribed At
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {subscribers.map((subscriber: { id: string; email: string; createdAt: Date }) => (
                                        <tr key={subscriber.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {subscriber.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(subscriber.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <DeleteSubscriberButton id={subscriber.id} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
