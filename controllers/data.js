const log = require ('./../core/log');
var data = require('./../services/dataService');

function getData(req, res){
    const getDate = req.swagger.params['date'].value;

    log.info(`Received GET /v0/data?date=${getDate}`);

    data.validate(getDate)
        .then(function(){
            return data.queryData(getDate);
        })
        .then(function(rawData){
            log.info (`Responding with 200`);
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(rawData);
        })
        .catch(function(error){
            log.info (`Responding with 400: ${error}`);
            res.statusCode = 400;
            res.end(JSON.stringify({error: `${error}`}));
        });
}

module.exports = {
    getData
};