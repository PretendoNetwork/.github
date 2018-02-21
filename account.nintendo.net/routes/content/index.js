let routes = require('express').Router(),
    path = require('path'),
    helpers = require('../../helpers'),
    constants = require('../../constants'),
    fs = require('fs-extra'),
    json2xml = require('json2xml');

const VALID_REGIONS = [
    'US', 'JP', 'GB', 'DE', 'FR'
];

const VALID_LANGUAGES = [
    'en'
];

/**
 * [GET]
 * Replacement for: https://account.nintendo.net/v1/api/content/time_zones/REGION/LANGUAGE
 * Description: Sends the client an XML list of timezones
 */
routes.get('/time_zones/:region/:language', (request, response) => {
    response.set('Content-Type', 'text/xml');
    response.set('Server', 'Nintendo 3DS (http)');
    response.set('X-Nintendo-Date', new Date().getTime());

    let headers = request.headers,
        region = request.params.region,
        language = request.params.language;

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

    if (!VALID_REGIONS.contains(region)
        || !VALID_LANGUAGES.contains(language)
        || !fs.pathExistsSync(path.join(__dirname, 'storage', 'timezones', region, language + '.xml'))) {
        let error = {
            errors: {
                error: {
                    code: '0000',
                    message: 'Unknown error'
                }
            }
        }

        return response.send(json2xml(error));
    }

    response.sendFile(path.join(__dirname, 'storage', 'timezones', region, language + '.xml'));
});


/**
 * [GET]
 * Replacement for: https://account.nintendo.net/v1/api/content/agreements/TYPE/REGION/VERSION
 * Description: Sends the client requested agreement
 */
routes.get('/agreements/:type/:region/:version', (request, response) => {
    response.set('Content-Type', 'text/xml');
    response.set('Server', 'Nintendo 3DS (http)');
    response.set('X-Nintendo-Date', new Date().getTime());

    let headers = request.headers,
        type = request.params.type,
        region = request.params.region,
        version = request.params.version,
        _GET = request.query;

    // for some reason, the 3ds won't work if you have this.
    // TODO: fix this for the 3ds
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

    // For some reason this gave me trouble??
    // For some reason using this check will throw an error in the WiiU
    /*if (
        !headers['x-nintendo-device-id'] ||
        !constants.REGEX.HEADER_FORMATS.DEVICE_ID.test(headers['x-nintendo-device-id'])
    ) {
        let error = {
            errors: {
                error: {
                    code: '0002',
                    message: 'deviceId format is invalid'
                }
            }
        }

        return response.send(json2xml(error));
    }*/


    if (!headers['x-nintendo-serial-number']) {
        let error = {
            errors: {
                error: {
                    code: '0002',
                    message: 'serialNumber format is invalid'
                }
            }
        }

        return response.send(json2xml(error));
    }


    if (!headers['x-nintendo-platform-id']) {
        let error = {
            errors: {
                error: {
                    code: '0002',
                    message: 'platformId format is invalid'
                }
            }
        }

        return response.send(json2xml(error));
    }


    if (!headers['x-nintendo-region']) {
        let error = {
            errors: {
                error: {
                    cause: 'X-Nintendo-Region',
                    code: '0002',
                    message: 'X-Nintendo-Region format is invalid'
                }
            }
        }

        return response.send(json2xml(error));
    }


    if (!constants.REGEX.HEADER_FORMATS.REGION.test(headers['x-nintendo-region'])) {
        let error = {
            errors: {
                error: {
                    cause: 'Bad Request',
                    code: '1600',
                    message: 'Unable to process request'
                }
            }
        }

        return response.send(json2xml(error));
    }


    if (
        !headers['x-nintendo-system-version'] ||
        !constants.REGEX.HEADER_FORMATS.SYSTEM_VERSION.test(headers['x-nintendo-system-version'])
    ) {
        let error = {
            errors: {
                error: {
                    code: '0002',
                    message: 'version format is invalid'
                }
            }
        }

        return response.send(json2xml(error));
    }


    if (headers['x-nintendo-system-version'] < constants.MINIMUN_SYSTEM_VERSION) {
        let error = {
            errors: {
                error: {
                    code: '0011',
                    message: 'System update is required'
                }
            }
        }

        return response.send(json2xml(error));
    }


    if (!VALID_REGIONS.contains(region)) {
        let error = {
            errors: {
                error: {
                    code: '0000',
                    message: 'Unknown error'
                }
            }
        }

        return response.send(json2xml(error));
    }


    if (!fs.pathExistsSync(path.join(__dirname, 'storage', 'agreements', type, region, version + '.xml'))) {
        let error = {
            errors: {
                error: {
                    code: '1101',
                    message: 'No stored agreement found for this country: ' + region + ' type: ' + type + ' and version: ' + version
                }
            }
        }

        return response.send(json2xml(error));
    }


    /*
    // ALSO NEED TO FIGURE OUT WHEN TO THROW ERROR 1102:
    let error = {
        errors: {
            error: {
                code: '1102',
                message: 'No privacy policy found for this country ' + region + ' version ' + version
            }
        }
    }

    return response.send(json2xml(error));

    // SEEMS TO BE RELATED TO THE `X-Nintendo-Region` HEADER.
    // SETTING `X-Nintendo-Region` TO 4 (and `:region` is `US`) WHEN `:type` IS `Nintendo-Network-EULA` THROWS ERROR 1102
    */

    response.sendFile(path.join(__dirname, 'storage', 'agreements', type, region, version + '.xml'));
});

module.exports = routes;

Array.prototype.contains = function(el) { // polyfill custom Array method
    return this.indexOf(el) > -1;
}
