"use client";

import { useEffect, useState } from "react";
import Link from 'next/link'

export default function Home() {
    const [list, setData] = useState([]);
    const [offset, setVisibleItems] = useState(20);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/list');
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
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



                {list.slice(0, offset).map((row, index) => (
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
