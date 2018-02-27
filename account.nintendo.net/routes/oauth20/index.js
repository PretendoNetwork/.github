let routes = require('express').Router(),
    json2xml = require('json2xml'),
    bcrypt = require('bcryptjs'),
    database = require('../../db'),
    helpers = require('../../helpers'),
    constants = require('../../constants'),
    debug = require('../../debugger'),
    route_debugger = new debug('oAuth Route'.green);

route_debugger.log('Loading \'oauth20\' API routes');

/**
 * [GET]
 * Replacement for: https://account.nintendo.net/v1/api/oauth20/access_token/generate
 * Description: Unknown use
 */
routes.all('/access_token/generate', async (request, response) => {
    let POST = request.body;
    
    if (
        !POST ||
        !POST.grant_type ||
        !['password', 'refresh_token'].includes(POST.grant_type)
    ) {
        let error = {
            errors: {
                error: {
                    cause: 'grant_type',
                    code: '0004',
                    message: 'Invalid Grant Type'
                }
            }
        }

        return response.send(json2xml(error));
    }

    if (POST.grant_type == 'password') {
        if (!POST.user_id || !POST.password) {
            let error = {
                errors: {
                    error: {
                        cause: 'grant_type',
                        code: '0004',
                        message: 'Invalid Grant Type'
                    }
                }
            }
    
            return response.send(json2xml(error));
        }

        let user = await database.user_collection.findOne({
            user_id: POST.user_id
        });

        if (!user) {
            let error = {
                errors: {
                    error: {
                        code: '0113',
                        message: 'Unauthorized device'
                    }
                }
            }

            return response.send(json2xml(error));
        }

        if (!POST.password_type || POST.password_type.toLowerCase() !== 'hash') {
            POST.password = helpers.generateNintendoHashedPWrd(POST.password, user.pid);
        }

        if (!bcrypt.compareSync(POST.password, user.sensitive.password)) {
            let error = {
                errors: {
                    error: {
                        code: '0106',
                        message: 'Invalid account ID or password.'
                    }
                }
            }

            return response.send(json2xml(error));
        }
        
        let access_token = helpers.generateAccessToken({
            pid: user.pid,
            token_salt: helpers.generateRandID(100)
        });
		//let access_token = user.pid

        let refresh_token = helpers.generateRefreshToken({
            pid: user.pid,
            token_salt: helpers.generateRandID(100)
        });

        user.sensitive.tokens.refresh = refresh_token;
        user.sensitive.tokens.access.token = access_token;
        user.sensitive.tokens.access.ttl = Math.floor((Date.now() / 1000) + 3600);

        await database.user_collection.update({
            pid: user.pid
        }, {
            $set: {
                sensitive: user.sensitive
            }
        });
        
        response.send(json2xml({
            OAuth20: {
                access_token: {
                    token: access_token,
                    refresh_token: refresh_token,
                    expires_in: 3600,
                }
            }
        }));
    } else if (POST.grant_type == 'refresh_token') {
        if (!POST.refresh_token) {
            let error = {
                errors: {
                    error: {
                        cause: 'refresh_token',
                        code: '0106',
                        message: 'Invalid Refresh Token'
                    }
                }
            }

            return response.send(json2xml(error));
        }

        let user = database.user_collection.findOne({
            sensitive: {
                tokens: {
                    refresh: POST.refresh_token
                }
            }
        });

        if (!user || user.sensitive.tokens.refresh !== POST.refresh_token) {
            let error = {
                errors: {
                    error: {
                        cause: 'refresh_token',
                        code: '0106',
                        message: 'Invalid Refresh Token'
                    }
                }
            }

            return response.send(json2xml(error));
        }

        let access_token = helpers.generateAccessToken({
            pid: user.pid,
            token_salt: helpers.generateRandID(100)
        });

        let refresh_token = helpers.generateRefreshToken({
            pid: user.pid,
            token_salt: helpers.generateRandID(100)
        });

        user.sensitive.tokens.refresh = refresh_token;
        user.sensitive.tokens.access.token = access_token;
        user.sensitive.tokens.access.ttl = Math.floor((Date.now() / 1000) + 3600);

        await database.user_collection.update({
            sensitive: {
                tokens: {
                    refresh: POST.refresh_token
                }
            }
        }, {
            $set: {
                sensitive: user.sensitive
            }
        });

        
        response.send(json2xml({
            OAuth20: {
                access_token: {
                    token: access_token,
                    refresh_token: refresh_token,
                    expires_in: 3600,
                }
            }
        }));
    }

});

module.exports = routes;