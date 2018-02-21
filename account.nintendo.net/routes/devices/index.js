let routes = require('express').Router(),
    path = require('path'),
    helpers = require('../../helpers'),
    constants = require('../../constants'),
    fs = require('fs-extra'),
    json2xml = require('json2xml');

/**
 * [GET]
 * Replacement for: https://account.nintendo.net/v1/api/devices/@current/status
 * Description: Unknown use
 */
routes.get('/@current/status', (request, response) => {
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
    }

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

    if (
        !headers['x-nintendo-system-version'] &&
        !headers['x-nintendo-country']
    ) {
        let error = {
            errors: [
                {
                    error: {
                        cause: 'X-Nintendo-Country',
                        code: '0002',
                        message: 'X-Nintendo-Country format is invalid'
                    }  
                },
                {
                    error: {
                        cause: 'X-Nintendo-System-Version',
                        code: '0002',
                        message: 'X-Nintendo-System-Version format is invalid'
                    }
                }
            ]
        }

        return response.send(json2xml(error));
    }

    if (!headers['x-nintendo-system-version']) {
        let error = {
            errors: {
                error: {
                    cause: 'X-Nintendo-System-Version',
                    code: '0002',
                    message: 'X-Nintendo-System-Version format is invalid'
                }
            }
        }

        return response.send(json2xml(error));
    }

    if (!headers['x-nintendo-country']) {
        let error = {
            errors: {
                error: {
                    cause: 'X-Nintendo-Country',
                    code: '0002',
                    message: 'X-Nintendo-Country format is invalid'
                }
            }
        }

        return response.send(json2xml(error));
    }

    if (
        !headers['x-nintendo-device-type'] ||
        headers['x-nintendo-device-type'] !== '2'
    ) {
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

    return response.send(json2xml({device: null}));
});

module.exports = routes;