"use client";

import { useEffect, useState } from "react";
import Link from 'next/link'

type ListItem = {
    symbol: string;
    name: string;
    exchange: string;
    assetType: string;
    ipoDate: string;
    status: string;
};


export default function Home() {
    const [list, setData] = useState<ListItem[]>([]);
    const [offset, setVisibleItems] = useState(20);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");


    const fetchData = async () => {
        try {
            const response = await fetch('/api/list');
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            let result = await response.json();
            result = result.slice(1); // Slice out header.
            setData(result);
        }
        catch (err) {
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

    const handleScroll = () => {
        const bottom = window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight;
        if (bottom) {
            setVisibleItems(prev => prev + 20);
        }
    };

    useEffect(() => {
        fetchData();
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (

    <div id="list-page">
        <div>
            <div className="max-w-4xl mx-auto space-y-4">
                <input
                    type="text"
                    placeholder="Search by symbol"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-4 border border-blue-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500"
                />

                <div className="text-gray-600 text-sm mb-4">
                    <b>{list.filter(row => row.symbol.toLowerCase().includes(searchTerm.toLowerCase())).length}</b> results found
                </div>

                <div className="bg-gray-100 shadow-lg rounded-lg p-6 flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 md:space-x-4">
                    <div className="flex-1">
                        <div className="text-xl font-bold text-gray-900 text-center md:text-left border-b-2 border-gray-300 pb-2">Symbol</div>
                        <div className="text-sm text-gray-600 font-semibold text-center md:text-left">Name</div>
                    </div>
                    <div className="flex-1 text-gray-700 text-sm font-semibold">Exchange</div>
                    <div className="flex-1 text-gray-700 text-sm font-semibold">Asset type</div>
                    <div className="flex-1 text-gray-700 text-sm font-semibold">IPO date</div>
                    <div className="flex-1 text-gray-700 text-sm font-semibold">Status</div>
                </div>



                { list.filter(row => row.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
                    .slice(0, offset)
                    .map((row, index) => (
                    <Link href={`/details/${row.symbol}`}
                        key={index}
                        className="bg-white shadow-md rounded-lg p-6 flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 md:space-x-4">
                        <div className="flex-1">
                            <div className="text-lg font-semibold text-gray-800 text-center md:text-left">{row.symbol}</div>
                            <div className="text-sm text-gray-500">{row.name}</div>
                        </div>
                        <div className="flex-1 text-gray-700 text-sm">{row.exchange}</div>
                        <div className="flex-1 text-gray-700 text-sm">{row.assetType}</div>
                        <div className="flex-1 text-gray-700 text-sm">{row.ipoDate}</div>
                        <div className="flex-1 text-gray-700 text-sm font-medium">{row.status}</div>
                    </Link>
                ))}

                {offset < list.length && (
                    <div className="text-center py-4">Loading more...</div>
                )}
            </div>
        </div>
    </div>
  );
}
