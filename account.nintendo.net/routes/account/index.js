let routes = require('express').Router(),
    database = require('../../db'),
    debug = require('../../debugger'),
    route_debugger = new debug('Account Route');

route_debugger.success('Loading \'account\' API routes');
/**
 * [GET]
 * Replacement for: https://id.nintendo.net/account/email-confirmation
 * Description: Verifies a user email via token
 */
routes.get('/email-confirmation', async (request, response) => {
    let _GET = request.query;

    if (!_GET.token) {
        return response.send('ERROR: Invalid token');
    }

    let user = await database.user_collection.findOne({
        'sensitive.email_confirms.token': _GET.token
    });

    if (!user) {
        return response.send('ERROR: Invalid token');
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

    response.send(```
    It has been confirmed that you can receive e-mails from Pretenod.<br>
    The confirmation process is now complete.
    ```);
});

module.exports = routes;