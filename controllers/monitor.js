const log = require ('./../core/log');

function get(req, res){
    log.info ('Received GET /monitor');
    res.statusCode = 200;
    log.info (`Responding with ${ res.statusCode }`);
    res.end ('OK');
};

module.exports = {
    get
};