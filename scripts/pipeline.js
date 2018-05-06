// Launch this script on a monthly basis to retrieve new data and calculate correlations for the previous month

const Promise = require('promise');
const moment = require('moment');
const https = require('https');
const log = require('./../core/log');
const config = require('./../config/config.json');

log.info('The pipeline is launched');

// The start day is a one year ago date
const startDate = moment()
    .subtract(1, 'months')
    .subtract(1, 'years')
    .startOf('month')
    .format('YYYY-MM-DD');

// This is the last day of the last month
const endDate = moment()
    .subtract(1, 'months')
    .endOf('month')
    .format('YYYY-MM-DD');

// 6 months ago time
const time6 = moment()
    .subtract(6, 'months')
    .startOf('month');

// 3 months ago time
const time3 = moment()
    .subtract(3, 'months')
    .startOf('month');

// 1 month ago time
const time1 = moment()
    .subtract(1, 'months')
    .startOf('month');

// Find correlations for 4 timeframes: 1 year, 6 months, 3 and 1 month
// The algorithm is published here: https://www.geeksforgeeks.org/program-find-correlation-coefficient/
// The output is a json object with the processed data
function findCorrelations(parsedData){
    let btcSum12 = 0, btcSum6 = 0, btcSum3 = 0, btcSum1 = 0;
    let btcSum12_2 = 0, btcSum6_2 = 0, btcSum3_2 = 0, btcSum1_2 = 0;

    let ethSum12 = 0, ethSum6 = 0, ethSum3 = 0, ethSum1 = 0;
    let ethSum12_2 = 0, ethSum6_2 = 0, ethSum3_2 = 0, ethSum1_2 = 0;

    let btcEth12 = 0, btcEth6 = 0, btcEth3 = 0, btcEth1 = 0;

    let coef12 = 0, coef6 = 0, coef3 = 0, coef1 = 0;

    let structuredData = {};

    for (let i = 0; i < parsedData.length; i++){

        const symbol = parsedData[i].symbol;

        for (let j = 0; j < parsedData[i].data.length; j++){

            const hashKey = parsedData[i].data[j].date;
            const priceUsd = parsedData[i].data[j].price_usd;

            if (!(hashKey in structuredData)){
                structuredData[hashKey] = {}
            }

            structuredData[hashKey][symbol] = priceUsd;
        }
    }

    const hashDates = Object.keys(structuredData);

    for (let i = 0; i < hashDates.length; i++){

        if (Object.keys(structuredData[hashDates[i]]).length != 2){
            continue;
        }

        const currentTime = moment(hashDates[i], 'YYYY-MM-DD').format();
        const currentRecord = structuredData[hashDates[i]];

        btcSum12 += currentRecord.btc;
        btcSum12_2 += Math.pow(currentRecord.btc, 2);
        ethSum12 += currentRecord.eth;
        ethSum12_2 += Math.pow(currentRecord.eth, 2);
        btcEth12 += currentRecord.btc * currentRecord.eth;
        coef12 += 1;

        if (currentTime >= time6.format()){

            btcSum6 += currentRecord.btc;
            btcSum6_2 += Math.pow(currentRecord.btc, 2);
            ethSum6 += currentRecord.eth;
            ethSum6_2 += Math.pow(currentRecord.eth, 2);
            btcEth6 += currentRecord.btc * currentRecord.eth;
            coef6 += 1;

        }
        if (currentTime >= time3.format()){

            btcSum3 += currentRecord.btc;
            btcSum3_2 += Math.pow(currentRecord.btc, 2);
            ethSum3 += currentRecord.eth;
            ethSum3_2 += Math.pow(currentRecord.eth, 2);
            btcEth3 += currentRecord.btc * currentRecord.eth;
            coef3 += 1;

        }
        if (currentTime >= time1.format()){

            btcSum1 += currentRecord.btc;
            btcSum1_2 += Math.pow(currentRecord.btc, 2);
            ethSum1 += currentRecord.eth;
            ethSum1_2 += Math.pow(currentRecord.eth, 2);
            btcEth1 += currentRecord.btc * currentRecord.eth;
            coef1 += 1;

        }
    }

    const cor12 = (coef12 * btcEth12 - btcSum12 * ethSum12) / (Math.sqrt(coef12 * btcSum12_2 - Math.pow(btcSum12, 2)) * Math.sqrt(coef12 * ethSum12_2 - Math.pow(ethSum12, 2)));
    const cor6 = (coef6 * btcEth6 - btcSum6 * ethSum6) / (Math.sqrt(coef6 * btcSum6_2 - Math.pow(btcSum6, 2)) * Math.sqrt(coef6 * ethSum6_2 - Math.pow(ethSum6, 2)));
    const cor3 = (coef3 * btcEth3 - btcSum3 * ethSum3) / (Math.sqrt(coef3 * btcSum3_2 - Math.pow(btcSum3, 2)) * Math.sqrt(coef3 * ethSum3_2 - Math.pow(ethSum3, 2)));
    const cor1 = (coef1 * btcEth1 - btcSum1 * ethSum1) / (Math.sqrt(coef1 * btcSum1_2 - Math.pow(btcSum1, 2)) * Math.sqrt(coef1 * ethSum1_2 - Math.pow(ethSum1, 2)));

    const stream = [
        {
            "BTC/USD": "1 Month",
            "From": `${time1.format('YYYY-MM-DD')}`,
            "To": `${endDate}`,
            "ETH/USD": cor1
        },
        {
            "BTC/USD": "3 Months",
            "From": `${time3.format('YYYY-MM-DD')}`,
            "To": `${endDate}`,
            "ETH/USD": cor3
        },
        {
            "BTC/USD": "6 Months",
            "From": `${time6.format('YYYY-MM-DD')}`,
            "To": `${endDate}`,
            "ETH/USD": cor6
        },
        {
            "BTC/USD": "1 Year",
            "From": `${startDate}`,
            "To": `${endDate}`,
            "ETH/USD": cor12
        }
    ];

    log.info('Correlation is calculated');

    return Promise.resolve(stream);
}

function retrieveData(symbol){

    return new Promise(function(resolve, reject){

        log.info(`Fetching data of currency ${symbol} for the period from ${startDate} to ${endDate}`);

        const query = encodeURIComponent(
            `SELECT * FROM ${symbol} WHERE date >= '${startDate}' AND date <= '${endDate}' ORDER BY date DESC`
        );

        const options = {
            hostname: 'api.data.world',
            path: `/v0/sql/scuttlemonkey/coin-metrics?query=${query}`,
            headers: {
                'Authorization': `Bearer ${config.token}`
            }
        };

        // Query the source dataset with the historical data
        https.request(options, (res) => {

            let rawData = '';
            res.on('data', (d) => {
                rawData += d;
            });

            res.on('end', () => {
                log.info(`Data for currency ${symbol} are retrieved`);
                const parsedData = JSON.parse(rawData);
                const result = {
                    symbol: symbol,
                    data: parsedData
                };
                resolve(result);
            });

        })
        .on('error', (e) => {
            reject(`Couldn't retrieve data for currency ${symbol} on the request: ${e.message}`);
        })
        .end();
    });

};

function streamData(stream){

    return new Promise(function(resolve, reject){

        log.info('Streaming data to the dataset');

        const options = {
            hostname: 'api.data.world',
            path: `/v0/streams/${config.user_id}/${config.dataset_id}/stream-1`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.token}`,
                'Content-Type': 'application/json-l'
            }
        };

        // Stream processed data to the dataset with correlations
        let req = https.request(options, (res) => {

            let rawData = '';
            res.on('data', (d) => {
                rawData += d;
            });

            res.on('end', () => {
                if (rawData){
                    const parsedData = JSON.parse(rawData);
                    if (parsedData.code != 200){
                        return reject(`Couldn\'t stream data to stream-1 with error ${parsedData.message}`);
                    }
                }
                log.info('Data are successfully pushed');
                resolve();
            });

        })
        .on('error', (e) => {
            reject('Couldn\'t stream data to stream-1');
        });

        req.write(JSON.stringify(stream));
        req.end();
    });

}

Promise.all([retrieveData('btc'), retrieveData('eth')])
    .then(findCorrelations)
    .then(function(stream){
        return Promise.all(stream.map(streamData));
    })
    .catch(function(error) {
        log.error(error);
    });