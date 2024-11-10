import axios from 'axios';
import { NextResponse } from 'next/server';

const API_KEY = process.env.ALPHAVANTAGE_API_KEY || "DVY2OISS8SA4WRTO";

async function fetchData(ticker: string) {
    try {
        const response = await axios.get(
            `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${API_KEY}`
        );
        const jsonData = response.data;
        console.log("JSON data from Alpha Vantage API:", jsonData);
        return jsonData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw new Error("Data fetch failed");
    }
}

// api/details/{ticker}
export async function GET(request: Request, { params }: { params: { ticker: string } }) {
    const { ticker } = params;

    try {
        const data = await fetchData(ticker);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}