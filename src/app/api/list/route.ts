import axios from 'axios';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

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

// api/list
export async function GET() {
    return new Response(JSON.stringify(await fetchData()), {
        headers: { "Content-Type": "application/json" },
    });
}