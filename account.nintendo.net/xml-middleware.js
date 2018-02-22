let http = require('http'),
    XML = require('pixl-xml');

module.exports = middleware;

function middleware() {
    return XMLMiddleware;

    function XMLMiddleware(request, response, next) {
        if (request.method == 'POST' || request.method == 'PUT') {
            let headers = request.headers,
                body = '';
            
            if (
                !headers['content-type'] ||
                headers['content-type'].toLowerCase() !== 'application/xml'
            ) {
                return next();
            }

            request.setEncoding('utf-8');
            request.on('data', (chunk) => {
                body += chunk;
            });

            request.on('end', () => {
                try {
                    request.body = XML.parse(body);
                } catch (error) {
                    return next();
                }

                next();
            });
        } else {
            next();
        }
    }
}