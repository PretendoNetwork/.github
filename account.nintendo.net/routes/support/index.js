let routes = require('express').Router(),
    helpers = require('../../helpers'),
    constants = require('../../constants'),
	database = require('../../db'),
    dns = require('dns'),
    json2xml = require('json2xml'),
    debug = require('../../debugger'),
    route_debugger = new debug('Support Route'.green);

route_debugger.log('Loading \'support\' API routes');

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

/**
 * [PUT]
 * Replacement for: https://account.nintendo.net/v1/api/support/email_confirmation/:USERPID/:CONFIRMCODE
 * Description: Confirms an email
 */
routes.put('/email_confirmation/:pid/:code', async (request, response) => {
    response.set('Content-Type', 'text/xml');
    response.set('Server', 'Nintendo 3DS (http)');
    response.set('X-Nintendo-Date', new Date().getTime());

    let user = await database.user_collection.findOne({
        pid: Number(request.params.pid)
    });
	
	if (!user) {
        let error = {
            errors: {
                error: {
                    code: '0130',
                    message: 'PID has not been registered yet'
                }
            }
        }
		return response.send(json2xml(error));
    }
	
	if (user.sensitive.email_confirms.code !== request.params.code) {
        let error = {
            errors: {
                error: {
                    code: '0116',
                    message: 'Missing or invalid verification code'
                }
            }
        }

		return response.send(json2xml(error));
	}
    
    user.email.reachable = 'Y';
    user.email.validated = 'Y';

    await database.user_collection.update({
        pid: user.pid
    }, {
        $set: {
            email: user.email
        }
    });

    user.sensitive.email_confirms.token = null;
    user.sensitive.email_confirms.code = null;

    await database.user_collection.update({
        pid: user.pid
    }, {
        $set: {
            sensitive: user.sensitive
        }
    });

    response.send(json2xml({
        email: null
    }));
	
});

module.exports = routes;
