//////////////////////////////////////////////////////////////////
///                                                            ///
///                        Dependencies                        ///
///                                                            ///
//////////////////////////////////////////////////////////////////

let port = 8080,
    path = require('path'),
    express = require('express'),
    subdomain = require('express-subdomain'),
    XMLMiddleware = require('./xml-middleware'),
    colors = require('colors'),
    morgan = require('morgan'),
    app = express(),
    testing_env = true,
    router = express.Router();

// API routes
const ROUTES = {
    CONTENT: require('./routes/content'),
    DEVICES: require('./routes/devices'),
    PEOPLE: require('./routes/people'),
    SUPPORT: require('./routes/support'),
    OAUTH20: require('./routes/oauth20'),
    PROVIDER: require('./routes/provider'),
    ADMIN: require('./routes/admin'),
    ROOT: require('./routes/root')
}

// START APPLICATION
app.set('etag', false);

// Create router
app.use(morgan('dev'));
router.use(express.json());
router.use(XMLMiddleware());
router.use(express.urlencoded({
    extended: true
}));

// Create subdomain
if (testing_env === false) {
  app.use(subdomain('account', router));
} else {
  app.use(router)
}

// Setup routes
router.use('/v1/api/content', ROUTES.CONTENT);   // content API routes
router.use('/v1/api/devices', ROUTES.DEVICES);   // device API routes
router.use('/v1/api/people', ROUTES.PEOPLE);     // people API routes
router.use('/v1/api/support', ROUTES.SUPPORT);   // support API routes
router.use('/v1/api/oauth20', ROUTES.OAUTH20);   // OAuth API routes
router.use('/v1/api/provider', ROUTES.PROVIDER); // OAuth API routes
router.use('/v1/api/admin', ROUTES.ADMIN);       // admin API routes (not sure what these do in general)
router.use('/v1/api', ROUTES.ROOT);              // root routes


// 404 handler
router.use((request, response) => {
    response.status(404);
    response.send();
});

// non-404 error handler
router.use((error, request, response) => {
    let status = error.status || 500;
    response.status(status);
    response.json({
        app: 'api',
        status: status,
        error: error.message
    });
});

// Starts the server
app.listen(port, () => {
    console.log('Server'.blue + ' started '.green.bold + 'on port '.blue + new String(port).yellow);
});
