let routes = require('express').Router(),
    helpers = require('../../helpers'),
    constants = require('../../constants'),
    database = require('../../db'),
    mailer = require('../../mailer'),
    RateLimit = require('express-rate-limit'),
    json2xml = require('json2xml'),
    bcrypt = require('bcryptjs'),
    moment = require('moment'),
    moment_timezone = require('moment-timezone'),
    puid = require('puid'),
    fs = require('fs-extra'),
    debug = require('../../debugger'),
    route_debugger = new debug('People Route'.green);

route_debugger.log('Loading \'people\' API routes');

/**
 * [POST]
 * Replacement for: https://account.nintendo.net/v1/api/people/
 * Description: Registers a user
 */
routes.post('/', new RateLimit({
    // THIS RATELIMIT IS PUT IN TO PLACE AS A TEMP SOLUTION TO BOT SPAM.
    // WE CANNOT 1:1 CLONE THE CHECKS AND ERRORS FROM THIS ENDPOINT.
    // THIS IS BECAUSE NINTENDO SEEMS TO VALIDATE A CONSOLES IDENTIFICATION HEADERS AGAINST AN
    // INTERNAL DATABASE TO VERIFY A CONSOLE IS LEGITIMATE.
    // THEY THEN SEEM TO DO FURTHER CHECKS USING THE CONSOLE IDENTIFICATION WHICH I HAVE NOT FIGURED
    // OUT YET. BECAUSE OF THIS, ALL CUSTOM SERVERS WILL INHERENTLY BE LESS SECURE.

    windowMs: 1*30*1000,
    max: 1,
    message: json2xml({
        errors: {
            error: {
                cause: 'Bad Request',
                code: '1600',
                message: 'Unable to process request'
            }
        }
    })
}), async (request, response) => {
    response.set('Server', 'Nintendo 3DS (http)');
    response.set('X-Nintendo-Date', new Date().getTime());
    response.set('Content-Type', 'application/xml;charset=UTF-8');

    let user_data = request.body,
        headers = request.headers;

    let account_exists = await database.user_collection.findOne({
        user_id: user_data.user_id
    });

    if (account_exists) {
        let error = {
            errors: {
                error: {
                    cause: 'userId',
                    code: '0100',
                    message: 'Account ID already exists'
                }
            }
        }

        return response.send(json2xml(error));
    }

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


    let pid = await helpers.generatePID(),
        password = bcrypt.hashSync(helpers.generateNintendoHashedPWrd(user_data.password, pid), 10),
        create_date = moment().format('YYYY-MM-DDTHH:MM:SS'),
        mii_hash = new puid(true).generate(),
        email_code = await helpers.generateEmailCode(),
        email_token = await helpers.generateEmailToken();

    let document = {
        accounts: [ // WTF even is this??
            {
                account: {
                    attributes: [
                        {
                            attribute: {
                                id: helpers.generateRandID(8), // THIS IS A PLACE HOLDER
                                name: 'environment',
                                updated_by: 'USER',
                                value: 'PROD'
                            }
                        }
                    ],
                    domain: 'ESHOP.NINTENDO.NET',
                    type: 'INTERNAL',
                    username: helpers.generateRandID(9) // THIS IS A PLACE HOLDER
                }  
            }
        ],
        device_attributes: user_data.device_attributes,
        active_flag: 'Y', // No idea what this is or what it's used for, but it seems to be Boolean based
        birth_date: user_data.birth_date,
        country: user_data.country,
        create_date: create_date,
        gender: user_data.gender,
        language: user_data.language,
        updated: create_date,
        marketing_flag: user_data.marketing_flag,
        off_device_flag: user_data.off_device_flag,
        pid: pid,
        email: {
            address: user_data.email,
            id: helpers.generateRandID(8), // THIS IS A PLACE HOLDER
            parent: user_data.parent,
            primary: user_data.primary,
            reachable: 'N',
            type: user_data.type,
            updated_by: 'INTERNAL WS', // Uhhhh.....
            validated: user_data.validated
        },
        mii: {
            status: 'COMPLETED', // idk man, idk
            data: user_data.mii.data,
            id: helpers.generateRandID(10), // THIS IS A PLACE HOLDER
            mii_hash: mii_hash,
            mii_images: [
                {
                    mii_image: {
                        cached_url: constants.URL_ENDPOINTS.mii + mii_hash + '_standard.tga',
                        id: helpers.generateRandID(10), // THIS IS A PLACE HOLDER
                        url: constants.URL_ENDPOINTS.mii + mii_hash + '_standard.tga',
                        type: 'standard'
                    }
                }
            ],
            name: user_data.mii.name,
            primary: user_data.mii.primary,
        },
        region: user_data.region,
        tz_name: user_data.tz_name,
        user_id: user_data.user_id,
        user_id_flat: user_data.user_id.toLowerCase(),
        utc_offset: (moment.tz(user_data.tz_name).utcOffset() * 60),
        sensitive: {
            tokens: {
                refresh: '',
                access: {
                    ttl: '',
                    token: ''
                },
            },
            email_confirms: {
                token: email_token,
                code: email_code,
            },
            password: password,
            linked_devices: {
                wiiu: {
                    serial: headers['x-nintendo-serial-number'],
                    id: headers['x-nintendo-device-id'],
                    certificate: headers['x-nintendo-device-cert']
                }
            },
            service_agreement: user_data.agreement,
            parental_consent: user_data.parental_consent,
        }
    }

    // At this point we would take `user_data.mii.data`, unpack/decode it and then generate a Mii image
    // using that Mii data. Then save the image as a TGA and upload to the Mii image server.
    // I have not yet cracked the Mii data format. All that I know is that it is base64 encoded.

    await database.user_collection.insert(document);

    mailer.send(
        user_data.email,
        '[Prentendo Network] Please confirm your e-mail address',
        `Hello,

        Your Prentendo Network ID activation is almost complete.  Please click the link below to confirm your e-mail address and complete the activation process.
        
        http://account.prentendo.cc/account/email-confirmation?token=` + email_token + `
        
        If you are unable to connect to the above URL, please enter the following confirmation code on the device to which your Prentendo Network ID is linked.
        
        &lt;&lt;Confirmation code: ` + email_code + `&gt;&gt;`
    )

    response.send(json2xml({
        person: {
            pid: pid
        }
    }));
});

/**
 * [GET]
 * Replacement for: https://account.nintendo.net/v1/api/people/:username
 * Description: Checks if username already in use
 */
routes.get('/:username', async (request, response) => {
    response.set('Content-Type', 'text/xml');
    response.set('Server', 'Nintendo 3DS (http)');
    response.set('X-Nintendo-Date', new Date().getTime());

    let username = request.params.username,
        headers = request.headers;

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

    let user_exists = await helpers.doesUserExist(username);

    if (user_exists) {
        response.status(400);
        response.send();
    }
    
    response.status(200);
    response.end();
});

/**
 * [GET]
 * Replacement for: https://account.nintendo.net/v1/api/people/@me/profile
 * Description: Gets profile data
 */
routes.get('/@me/profile', async (request, response) => {
    response.set('Content-Type', 'text/xml');
    response.set('Server', 'Nintendo 3DS (http)');
    response.set('X-Nintendo-Date', new Date().getTime());

    let headers = request.headers;

    if (
        !headers['authorization']
    ) {
        let error = {
            errors: {
                error: {
                    cause: 'access_token',
                    code: '0002',
                    message: 'Invalid access token'
                }
            }
        }

        return response.send(json2xml(error));
    }
	
    let user = await helpers.getUser(headers['authorization'].replace('Bearer ',''));

    if (!user) {
        let error = {
            errors: {
                error: {
                    cause: 'access_token',
                    code: '0002',
                    message: 'Invalid access token'
                }
            }
        }

        return response.send(json2xml(error));
    }

    let account = helpers.mapUser(user);
    
    return response.send(json2xml(account));
});


/**
 * [PUT]
 * Replacement for: https://account.nintendo.net/v1/api/people/@me/miis/@primary
 * Description: Updates user Mii
 */
routes.put('/@me/miis/@primary', async (request, response) => {
    response.set('Content-Type', 'text/xml');
    response.set('Server', 'Nintendo 3DS (http)');
    response.set('X-Nintendo-Date', new Date().getTime());

    let headers = request.headers,
        _PUT = request.body;

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
        !headers['authorization']
    ) {
        let error = {
            errors: {
                error: {
                    cause: 'access_token',
                    code: '0002',
                    message: 'Invalid access token'
                }
            }
        }

        return response.send(json2xml(error));
    }
	
    let user = await helpers.getUser(headers['authorization'].replace('Bearer ',''));

    if (!user) {
        let error = {
            errors: {
                error: {
                    cause: 'access_token',
                    code: '0002',
                    message: 'Invalid access token'
                }
            }
        }

        return response.send(json2xml(error));
    }

    user.mii.data = _PUT.data;
    user.mii.name = _PUT.name;
    user.mii.primary = _PUT.data;

    await database.user_collection.update({
        pid: user.pid
    }, {
        $set: {
            mii: user.mii
        }
    });

    response.status(200);
    response.end();
});

/**
 * [GET]
 * Replacement for: https://account.nintendo.net/v1/api/people/@me/devices/owner
 * Description: Gets user profile, seems to be the same as https://account.nintendo.net/v1/api/people/@me/profile
 */
routes.get('/@me/devices/owner', async (request, response) => {
    response.set('Content-Type', 'text/xml');
    response.set('Server', 'Nintendo 3DS (http)');
    response.set('X-Nintendo-Date', new Date().getTime());

    let headers = request.headers;

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

    
    let errors = [];

    if (!headers['x-nintendo-email']) {
        errors.push({
            error: {
                cause: 'X-Nintendo-EMail',
                code: '1105',
                message: 'Email address, username, or password, is not valid'
            }
        });
    }

    if (
        !headers['authorization'] ||
        !headers['authorization'].startsWith('Basic ')
    ) {
        errors.push({
            error: {
                cause: 'Authorization',
                code: '0002',
                message: 'Authorization format is invalid'
            }
        });
    }

    if (errors.length > 0) {
        return response.send(json2xml({
            errors: errors
        }));
    }

    let user = await helpers.getUserBasic(headers['authorization'].replace('Basic ', ''), headers['x-nintendo-email']);

    if (!user) {
        let error = {
            errors: {
                error: {
                    code: '1105',
                    message: 'Email address, username, or password, is not valid'
                }
            }
        }

        return response.send(json2xml(error));
    }

    console.log(user)

    let account = helpers.mapUser(user);
    
    return response.send(json2xml(account));

});

/**
 * [POST]
 * Replacement for: https://account.nintendo.net/v1/api/people/@me/devices
 * Description: Gets user profile, seems to be the same as https://account.nintendo.net/v1/api/people/@me/profile
 */
routes.post('/@me/devices', async (request, response) => {
    response.set('Content-Type', 'text/xml');
    response.set('Server', 'Nintendo 3DS (http)');
    response.set('X-Nintendo-Date', new Date().getTime());

    let headers = request.headers,
        _POST = request.body;

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

    
    let errors = [];

    if (!headers['x-nintendo-email']) {
        errors.push({
            error: {
                cause: 'X-Nintendo-EMail',
                code: '1105',
                message: 'Email address, username, or password, is not valid'
            }
        });
    }

    if (
        !headers['authorization'] ||
        !headers['authorization'].startsWith('Basic ')
    ) {
        errors.push({
            error: {
                cause: 'Authorization',
                code: '0002',
                message: 'Authorization format is invalid'
            }
        });
    }

    if (errors.length > 0) {
        return response.send(json2xml({
            errors: errors
        }));
    }

    let user = await helpers.getUserBasic(headers['authorization'].replace('Basic ', ''), headers['x-nintendo-email']);

    if (!user) {
        let error = {
            errors: {
                error: {
                    code: '1105',
                    message: 'Email address, username, or password, is not valid'
                }
            }
        }

        return response.send(json2xml(error));
    }

    user.device_attributes = _POST;

    await database.user_collection.update({
        pid: user.pid
    }, {
        $set: {
            device_attributes: user.device_attributes
        }
    });

    let account = helpers.mapUser(user);
    
    return response.send(json2xml(account));
});

/**
 * [GET]
 * Replacement for: https://account.nintendo.net/v1/api/people/@me/devices
 * Description: Returns only user devices
 */
routes.get('/@me/devices', async (request, response) => {
    response.set('Content-Type', 'text/xml');
    response.set('Server', 'Nintendo 3DS (http)');
    response.set('X-Nintendo-Date', new Date().getTime());

    let headers = request.headers;

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
        !headers['authorization']
    ) {
        let error = {
            errors: {
                error: {
                    cause: 'access_token',
                    code: '0002',
                    message: 'Invalid access token'
                }
            }
        }

        return response.send(json2xml(error));
    }
	
    let user = await helpers.getUser(headers['authorization'].replace('Bearer ',''));

    if (!user) {
        let error = {
            errors: {
                error: {
                    cause: 'access_token',
                    code: '0002',
                    message: 'Invalid access token'
                }
            }
        }
		return response.send(json2xml(error));
    }

    response.send(json2xml({
        devices: [
            {
                device: {
                    device_id: headers['x-nintendo-device-id'],
                    language: headers['accept-language'],
                    updated: moment().format('YYYY-MM-DDTHH:MM:SS'),
                    pid: user.pid,
                    platform_id: headers['x-nintendo-platform-id'],
                    region: headers['x-nintendo-region'],
                    serial_number: headers['x-nintendo-serial-number'],
                    status: 'ACTIVE',
                    system_version: headers['x-nintendo-system-version'],
                    type: 'RETAIL',
                    updated_by: 'USER'
                }
            }
        ]
    }));
});


/**
 * [PUT]
 * Replacement for: https://account.nintendo.net/v1/api/people/@me/devices/@current/inactivate
 * Description: Deactivates a user from a console
 */
// THIS CURRENTLY DOES NOT UNLINK A USER. THIS IS BECAUSE PRETENDO ACCOUNTS ARE NOT TIED TO CONSOLES
// WE ONLY RETURN WHAT THE CONSOLE EXPECTS TO PREVENT CRASHES
routes.put('/@me/devices/@current/inactivate', async (request, response) => {
    response.set('Server', 'Nintendo 3DS (http)');
    response.set('X-Nintendo-Date', new Date().getTime());

    let headers = request.headers;

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
        !headers['authorization']
    ) {
        let error = {
            errors: {
                error: {
                    cause: 'access_token',
                    code: '0002',
                    message: 'Invalid access token'
                }
            }
        }

        return response.send(json2xml(error));
    }
	
    let user = await helpers.getUser(headers['authorization'].replace('Bearer ',''));

    if (!user) {
        let error = {
            errors: {
                error: {
                    cause: 'access_token',
                    code: '0002',
                    message: 'Invalid access token'
                }
            }
        }
		return response.send(json2xml(error));
    }

    response.status(200);
    response.end();
});

/**
 * [POST]
 * Replacement for: https://account.nintendo.net/v1/api/people/@me/deletion
 * Description: Deletes a NNID
 */
routes.post('/@me/deletion', async (request, response) => {
    response.set('Content-Type', 'text/xml');
    response.set('Server', 'Nintendo 3DS (http)');
    response.set('X-Nintendo-Date', new Date().getTime());

    let headers = request.headers;

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
        !headers['authorization']
    ) {
        let error = {
            errors: {
                error: {
                    cause: 'access_token',
                    code: '0002',
                    message: 'Invalid access token'
                }
            }
        }

        return response.send(json2xml(error));
    }
	
    let user = await helpers.getUser(headers['authorization'].replace('Bearer ',''));

    if (!user) {
        let error = {
            errors: {
                error: {
                    cause: 'access_token',
                    code: '0002',
                    message: 'Invalid access token'
                }
            }
        }
		return response.send(json2xml(error));
    }

    await database.user_collection.remove({
        pid: user.pid
    }, true);

    response.status(200);
    response.end();
});


module.exports = routes;
