const Promise = require('promise');
const log = require ('./../core/log');
const moment = require('moment');
const https = require('https');
const config = require('./../config/config.json');

// Validate the user's input
function validate(forYear, forMonth){

    forYear = parseInt(forYear);
    forMonth = parseInt(forMonth);

    const currentYear = parseInt(moment().format('YYYY'));

    if (currentYear < forYear || 2000 > forYear){
        return Promise.reject('A year parameter is out of range, should be 2000 <= forYear <= currentYear');
    }

    if (forMonth > 12 || forMonth < 1){
        return Promise.reject('A month parameter is out of range, should be 1 <= forMonth <= 12');
    }

    return Promise.resolve();
}

// Retrieve processed data for the requested month
function queryData(forYear, forMonth){
    // Data can be stored and retrieved from cache in order to increase the performance and eliminate the third-party
    return new Promise(function(resolve, reject){

        const queryDate = moment(`${forYear}${forMonth}`, 'YYYYM')
            .endOf('month')
            .format('YYYY-MM-DD');

        log.info(`Query historical data for ${queryDate}`);

        const query = encodeURIComponent(
            `SELECT * FROM stream_1 WHERE to = '${queryDate}' ORDER BY btc_usd DESC`
        );

        const options = {
            hostname: 'api.data.world',
            path: `/v0/sql/${config.user_id}/${config.dataset_id}?query=${query}`,
            headers: {
                'Authorization': `Bearer ${config.token}`
            }
        };

        https.request(options, (res) => {

            let rawData = '';
            res.on('data', (d) => {
                rawData += d;
            });

            res.on('end', () => {
                log.info(`Data for ${queryDate} are retrieved`);
                resolve(rawData);
            });

        })
        .on('error', (e) => {
            reject(`Couldn't query historical data for ${queryDate}: ${e.message}`);
        })
        .end();
    });
}

module.exports = {
    validate,
    queryData
};