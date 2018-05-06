const log = require ('./../core/log');
var data = require('./../services/dataService');

function getData(req, res){
    const forYear = req.swagger.params['forYear'].value;
    const forMonth = req.swagger.params['forMonth'].value;

    log.info(`Received GET /v0/data?forYear=${forYear}&forMonth=${forMonth}`);

    data.validate(forYear, forMonth)
        .then(function(){
            return data.queryData(forYear, forMonth);
        })
        .then(function(rawData){
            log.info (`Responding with 200`);
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(rawData);
        })
        .catch(function(error){
            log.info (`Responding with 400: ${error}`);
            res.statusCode = 400;
            res.end(error);
        });
}

module.exports = {
    getData
};