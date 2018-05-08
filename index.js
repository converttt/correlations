// A web server
// Available interfaces are described in api api/swagger.yaml
// Logs are written to stdout and can be streamed to any monitoring tools like Zabbix ot ELK

const http = require('http');
const log = require('./core/log');
const fs = require('fs');
const app = require('connect')();
const swaggerTools = require('swagger-tools');
const jsyaml = require('js-yaml');
const config = require('./config/config.json');

const serverPort = config.server_port;

// swaggerRouter configuration
const options = {
    controllers: './controllers',
    useStubs: process.env.NODE_ENV === 'development' // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
const spec = fs.readFileSync('./api/swagger.yaml', 'utf8');
const swaggerDoc = jsyaml.safeLoad(spec);

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {

    // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
    app.use(middleware.swaggerMetadata());

    // Validate Swagger requests
    app.use(middleware.swaggerValidator());

    // Route validated requests to appropriate controller
    app.use(middleware.swaggerRouter(options));

    // Serve the Swagger documents and Swagger UI
    app.use(middleware.swaggerUi());

    // Start the server
    http.createServer(app).listen(serverPort, function () {
        log.info(`Your server is listening on port ${serverPort} (http://localhost:${serverPort})`);
        log.info(`Swagger-ui is available on http://localhost:${serverPort}/docs`);
    });

});
