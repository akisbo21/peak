import axios from 'axios';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";


const API_KEY = "DVY2OISS8SA4WRTO"; // @todo this should be an environment variable.
let cache = { data: null, expiresAt: null };

async function csvToJson(csv) {
    return csv
        .trim()
        .split('\r\n')
        .map(line => {
            const [symbol, name, exchange, assetType, ipoDate, delistingDate, status] = line.split(',');
            return {
                symbol,
                name,
                exchange,
                assetType,
                ipoDate,
                delistingDate,
                status
            };
        });
}

/**
 * Fallback to a local csv because alphavantage gives empty response after a while.
 */
async function loadLocalData() {
    return new Promise((resolve, reject) => {
        const fs = require('fs');
        const parse = require('csv-parser');

        const csvData = [];
        return fs.createReadStream(path.join(process.cwd(), 'src', 'assets', 'listing_status.csv'))
        .pipe(parse({delimiter: ':'}))
        .on('data', function(row) {
            csvData.push(row);
        })
        .on('end',function() {
            // console.log("End of csv file reading.");
            // console.log(csvData.length, csvData[0]);
            resolve(csvData);
        });
    });
}

async function fetchData() {
    if (cache.data && cache.expiresAt > Date.now()) {
        return cache.data;
    }

    return axios.get('https://www.alphavantage.co/query?function=LISTING_STATUS&datatype=json&apikey=' + API_KEY)
    .then(async function (response) {
        let csvData = response.data;
        let jsonData;
        // console.log("Csv data from alphavantage api:");
        // console.log(csvData);

        if (csvData.length) {
            jsonData = await csvToJson(csvData);
        }
        else {
            jsonData = await loadLocalData();
            // console.log("Locally loaded json data:");
            // console.log(jsonData.length, jsonData[0]);
        }

        cache = {
            data: jsonData,
            expiresAt: Date.now() + 60 * 60 * 1000 // caching for 60 minutes.
        };

        return cache.data;
    })
    .catch(function (error) {
        console.log(error);
    });
}



export default async function Home() {
    let data = await fetchData();
    data = data.slice(1);
    data = data.slice(0, 20);
    // console.log(data);
    // console.log(cache);


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



                {data.map((row, index) => (
                    <div
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
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}
