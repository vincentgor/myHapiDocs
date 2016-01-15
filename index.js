'use strict';

var app = require('express')();
var fs = require('fs');
var jsyaml = require('js-yaml');
var swaggerTools = require('swagger-tools');
var SwaggerExpress = require('swagger-express-mw');

var setting = require("./config/setting.js")

module.exports = app; // for testing

var config = {
    appRoot: __dirname // required config
};

var serverPort = setting.port;

// swaggerRouter configuration
var options = {
    controllers: './api/controllers',
    useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
// var swaggerDoc = require('./api/swagger/swagger.json');
var spec = fs.readFileSync('./api/swagger/swagger.yaml', 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);



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


    SwaggerExpress.create(config, function(err, swaggerExpress) {

        if (err) { throw err; }

        var port = process.env.PORT || serverPort;

        // install middleware
        swaggerExpress.register(app);

        // Start the server
        app.listen(port, function () {
            console.log('Your server is listening on port %d (' + setting.hostname + ':%d)', port, port);
        });

        if (swaggerExpress.runner.swagger.paths['/hello']) {
            console.log('try this:\ncurl ' + setting.hostname + ':' + port + '/hello?name=Scott');
        }

    });

});
