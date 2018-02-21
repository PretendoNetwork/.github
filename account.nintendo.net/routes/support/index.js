let routes = require('express').Router(),
    helpers = require('../../helpers'),
    constants = require('../../constants'),
    dns = require('dns'),
    json2xml = require('json2xml');

/**
 * [POST]
 * Replacement for: https://account.nintendo.net/v1/api/support/validate/email
 * Description: Validates an email by attempting to ping it's mail server
 */
routes.post('/validate/email', async (request, response) => {
    response.set('Content-Type', 'text/xml');
    response.set('Server', 'Nintendo 3DS (http)');
    response.set('X-Nintendo-Date', new Date().getTime());

    let POST = request.body,
        headers = request.headers
        email = POST.email;

    if (
        !headers['x-nintendo-client-id'] ||
        !headers['x-nintendo-client-secret'] ||
        !constants.VALID_CLIENT_ID_SECRET_PAIRS[headers['x-nintendo-client-id']] ||
        headers['x-nintendo-client-secret'] !== constants.VALID_CLIENT_ID_SECRET_PAIRS[headers['x-nintendo-client-id']]
    ) {
        let error = {
            errors: {
                error: {
                    cause: 'client_id',
                    code: '0004',
                    message: 'API application invalid or incorrect application credentials'
                }
            }
        }

        return response.send(json2xml(error));
    }

    if (
        !headers['content-type'] ||
        headers['content-type'].toLowerCase() !== 'application/x-www-form-urlencoded'
    ) {
        let error = {
            errors: {
                error: {
                    code: '2001',
                    message: 'Internal server error'
                }
            }
        }

        return response.send(json2xml(error));
    }

    if (!email) {
        let error = {
            errors: {
                error: {
                    cause: 'email',
                    code: '0103',
                    message: 'Email format is invalid'
                }
            }
        }

        return response.send(json2xml(error));
    }

    let domain = email.split('@')[1];

    console.log(email, domain);

    dns.resolveMx(domain, (error, addr) => {
        if (error) {
            let error = {
                errors: {
                    error: {
                        code: '1126',
                        message: 'The domain "' + domain + '" is not accessible.'
                    }
                }
            }

            return response.send(json2xml(error));
        }

        response.status(200);
        response.end();
    });

});

module.exports = routes;
