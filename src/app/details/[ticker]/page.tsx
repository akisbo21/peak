"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function DetailsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    const pathname = usePathname();
    const router = useRouter();

    const ticker = pathname.split('/')[2];

    useEffect(() => {
        if (!ticker) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/details/${ticker}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const result = await response.json();
                setData(result);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred');
                }
            }
            finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [ticker]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!data) {
        return <div>No data available for {ticker}</div>;
    }

    const { 'Meta Data': metaData, 'Time Series (Daily)': timeSeries } = data;

    return (
        <div id="details-page" className="max-w-4xl mx-auto p-6">
            <button onClick={() => router.back()} className="bg-blue-500 text-white py-2 px-4 rounded">
                Back
            </button>

            <div className="bg-gray-100 shadow-lg rounded-lg p-6 flex flex-col space-y-4">
                <h1 className="text-2xl font-bold text-gray-900">Details for {ticker}</h1>

                <div className="space-y-2">
                    <div className="text-sm text-gray-600 font-semibold">Last Refreshed: {metaData['4. Output Size']}</div>
                    <div className="text-sm text-gray-600 font-semibold">Time Zone: {metaData['5. Time Zone']}</div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mt-6">Time Series (Daily)</h2>
                <div className="space-y-2">
                    {Object.keys(timeSeries).map(date => (
                        <div key={date} className="bg-white p-4 rounded-lg shadow-md">
                            <div className="text-gray-800 font-semibold">Date: {date}</div>
                            <div className="text-gray-600">Open: {timeSeries[date]['1. open']}</div>
                            <div className="text-gray-600">High: {timeSeries[date]['2. high']}</div>
                            <div className="text-gray-600">Low: {timeSeries[date]['3. low']}</div>
                            <div className="text-gray-600">Close: {timeSeries[date]['4. close']}</div>
                            <div className="text-gray-600">Volume: {timeSeries[date]['5. volume']}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
