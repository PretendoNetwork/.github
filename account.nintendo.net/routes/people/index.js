let routes = require('express').Router(),
    helpers = require('../../helpers'),
    constants = require('../../constants'),
    database = require('../../db'),
    mailer = require('../../mailer'),
    RateLimit = require('express-rate-limit'),
    randtoken = require('rand-token'),
    json2xml = require('json2xml'),
    bcrypt = require('bcryptjs'),
    moment = require('moment'),
    moment_timezone = require('moment-timezone'),
    puid = require('puid'),
    fs = require('fs-extra');

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
        email_code = helpers.generateRandID(6),
        email_token = randtoken.generate(32);

    console.log(helpers.generateNintendoHashedPWrd(user_data.password, pid));
    console.log(password);

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
            email_confims: {
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

    /*mailer.send(
        user_data.email,
        '[Prentendo Network] Please confirm your e-mail address',
        `Hello,

        Your Prentendo Network ID activation is almost complete.  Please click the link below to confirm your e-mail address and complete the activation process.
        
        id.prentendo.cc/account/email-confirmation?token=` + email_token + `
        
        If you are unable to connect to the above URL, please enter the following confirmation code on the device to which your Prentendo Network ID is linked.
        
        <<Confirmation code: ` + email_code + `>>`
    )*/

    console.log(pid)

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
                    cause: 'bad token',
                    code: '0004',
                    message: 'Bad access token received; token: ' + headers['authorization']
                }
            }
        }
		return response.send(json2xml(error));
    }

    let accounts = [];
    let device_attributes = [];

    user.accounts.forEach(account => {
        account = account.account
        let attributes = [];

        account.attributes.forEach(attribute => {
            attribute = attribute.attribute;
            attributes.push({
                attribute: {
                    id: attribute.id,
                    name: attribute.name,
                    updated_by: attribute.updated_by,
                    value: attribute.value,
                }
            });
        });

        accounts.push({
            account: {
                attributes: attributes,
                domain: account.domain,
                type: account.type,
                username: account.username
            }
        })
    });

    user.device_attributes.device_attribute.forEach(device_attribute => {
        let attribute = {
            name: device_attribute.name,
            value: device_attribute.value,
        };

        if (device_attribute.created_date) {
            attribute.created_date = device_attribute.created_date;
        }

        device_attributes.push({
            device_attribute: attribute
        });
    });

    let person = {
        person: {
            accounts: accounts,
            device_attributes: device_attributes,
            active_flag: user.active_flag,
            birth_date: user.birth_date,
            country: user.country,
            create_date: user.create_date,
            gender: user.gender,
            language: user.language,
            updated: user.updated,
            marketing_flag: user.marketing_flag,
            off_device_flag: user.off_device_flag,
            pid: user.pid,
            email: {
                address: user.email.address.address,
                id: user.email.id,
                parent: user.email.address.parent,
                primary: user.email.address.primary,
                reachable: user.email.reachable,
                type: user.email.address.type,
                updated_by: user.email.updated_by,
                validated: user.email.address.validated,
                validated_date: user.updated
            },
            mii: {
                status: user.mii.status,
                data: user.mii.data,
                id: user.mii.id,
                mii_hash: user.mii.mii_hash,
                mii_images: {
                    mii_image: {
                        cached_url: 'https://mii-secure.account.nintendo.net/1flcdk3hks29a_standard.tga',
                        id: user.mii.mii_images[0].mii_image.id,
                        url: 'https://mii-secure.account.nintendo.net/1flcdk3hks29a_standard.tga',
                        type: user.mii.mii_images[0].mii_image.type
                    }
                },
                name: user.mii.name,
                primary: user.mii.primary
            },
            region: user.region,
            tz_name: user.tz_name,
            user_id: user.user_id,
            utc_offset: user.utc_offset
        }
    }
    
    return response.send(json2xml(person));
});


/**
 * [POST]
 * Replacement for: https://account.nintendo.net/v1/api/people/@me/miis/@primary
 * Description: Updates user Mii
 */
routes.post('/@me/miis/@primary', async (request, response) => {
    response.set('Content-Type', 'text/xml');
    response.set('Server', 'Nintendo 3DS (http)');
    response.set('X-Nintendo-Date', new Date().getTime());

    let headers = request.headers;

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

    let headers = request.headers;

});

/**
 * [GET]
 * Replacement for: https://account.nintendo.net/v1/api/people/@me/devices
 * Description: Returns only user devices
 */
routes.get('/@me/devices', async (request, response) => {
    //response.set('Content-Type', 'text/xml');
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
                    cause: 'bad token',
                    code: '0004',
                    message: 'Bad access token received; token: ' + headers['authorization']
                }
            }
        }
		return response.send(json2xml(error));
    }

    response.send(JSON.stringify(user));
});


module.exports = routes;
