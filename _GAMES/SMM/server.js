//////////////////////////////////////////////////////////////////
///                                                            ///
///                        Dependencies                        ///
///                                                            ///
//////////////////////////////////////////////////////////////////

let port = 80,
    path = require('path'),
    express = require('express'),
    subdomain = require('express-subdomain'),
    colors = require('colors'),
    morgan = require('morgan'),
    app = express(),
    router = express.Router();

// API routes
const ROUTES = {
    PICKUP: require('./routes/pickup'),
    PLAYLIST: require('./routes/playlist'),
}


// START APPLICATION

// Create router
app.use(morgan('dev'));
router.use(express.json());
router.use(express.urlencoded({
    extended: true
}));

// Create subdomain
app.use(subdomain('wup-ama.app', router));

// Setup routes
router.use('/v1/api/pickup', ROUTES.PICKUP); // pickup API route
router.use('/v1/api/playlist', ROUTES.PLAYLIST); // playlist API route


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