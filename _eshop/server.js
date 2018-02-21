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
    GEISHA: require('./routes/geisha'),
}

// START APPLICATION

// Create router
app.use(morgan('dev'));
app.use(express.static(__dirname + '/public'));
router.use(express.json());
router.use(express.urlencoded({
    extended: true
}));

app.get('/', (request, response) => {
    response.end('<script>document.location.href="/test"</script>')
});

app.get('/test', (request, response) => {
    console.log(request.headers);
    response.end('t')
});

// Create subdomain
app.use(subdomain('geisha-wup.cdn', router));

// Setup routes
router.use('/geisha', ROUTES.GEISHA);


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

router.use('/geisha/js/minified/:js', (request, response) => {
    console.log(request.headers);
    return;
});
router.use('/geisha/js/:js', (request, response) => {
    console.log(request.headers);
    return;
});
router.use('/geisha/css/:css', (request, response) => {
    console.log(request.headers);
    return;
});

// Starts the server
app.listen(port, () => {
    console.log('Server'.blue + ' started '.green.bold + 'on port '.blue + new String(port).yellow);
});