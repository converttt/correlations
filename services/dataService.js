const Promise = require('promise');
const log = require ('./../core/log');
const moment = require('moment');
const https = require('https');
const config = require('./../config/config.json');

// Validate the user's input
// getDate - string, format: YYYYMM
function validate(getDate){

    const m = moment(getDate, 'YYYYMM');
    const current = moment().startOf('month');

    if (!m.isValid()){
        return Promise.reject('The date is invalid');
    }

    if (m.unix() >= current.unix()){
        return Promise.reject('The date should be in the past');
    }

    const year = parseInt(m.format('YYYY'));
    const currentYear = parseInt(current.format('YYYY'));

    if (currentYear < year || 2017 > year){
        return Promise.reject('A year parameter is out of range, should be 2017 <= forYear <= currentYear');
    }

    return Promise.resolve();
}

// Retrieve processed data for the requested date
function queryData(getDate){
    // Data can be stored and retrieved from cache in order to increase the performance
    return new Promise(function(resolve, reject){

        const queryDate = moment(`${getDate}`, 'YYYYM')
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