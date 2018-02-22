let constants = require('./constants'), 
    database = require('./db'),
    pythonStruct = require('python-struct'),
    bcrypt = require('bcryptjs'),
    randtoken = require('rand-token'),
    crypto = require('crypto');

async function generatePID() {
    // Quick, dirty fix for PIDs
    let pid = Math.floor(Math.random() * (4294967295 - 1000000000) + 1000000000);

    let does_pid_inuse = await database.user_collection.findOne({
        pid: pid
    });

    if (does_pid_inuse) {
        return await generatePID();
    }

    return pid;
}

function generateRandID(length = 10) {
    let id = '';

    for (var i=0;i<length;i++) {
        id += constants.PID_SORT_LIST.charAt(Math.floor(Math.random() * constants.PID_SORT_LIST.length));
    }

    return id;
}

async function generateEmailToken() {
    let token = randtoken.generate(32);

    let user = await database.user_collection.findOne({
        'sensitive.email_confirms.token': token
    });
    
    if (user) {
        return await generateEmailToken();
    }

    return token;
}

async function generateEmailCode() {
    let code = generateRandID(6);

    let user = await database.user_collection.findOne({
        'sensitive.email_confirms.code': code
    });
    
    if (user) {
        return await generateEmailCode();
    }

    return code;
}

function generateNintendoHashedPWrd(password, pid) {
    let buff1 = pythonStruct.pack('<I', pid);
    let buff2 = Buffer.from(password).toString('ascii');

    let unpacked = new Buffer(bufferToHex(buff1) + '\x02eCF' + buff2, 'ascii'),
        hashed = crypto.createHash('sha256').update(unpacked).digest().toString('hex');

    return hashed;
}

function bufferToHex(buff) {
    let result = '',
        arr = buff.toString('hex').match(/.{1,2}/g);
    for (var i=0;i<arr.length;i++) {
        let char = arr[i],
            char_code = char.charCodeAt();
        result += String.fromCharCode(parseInt(char, 16));
    }
    result.replace(/\\/g, '&#92;');
    return result;
}

async function doesUserExist(username) {
    let user = await database.user_collection.findOne({
        username: username.toLowerCase()
    });
    
    if (user) {
        return true;
    }

    return false;
}

async function getUser(token) {
    let user = await database.user_collection.findOne({
        'sensitive.tokens.access.token': token
    });
    
    if (user) {
        return user;
    }

    return null;
}

async function getUserBasic(token, email) {
    let unpacked_token = Buffer.from(token, 'base64').toString().split(' ');
    let user = await database.user_collection.findOne({
        user_id_flat: unpacked_token[0].toLowerCase()
    });

    if (!user) {
        return null;
    }

    if (user.email.address.address !== email) {
        return null;
    }

    let hashed_password = generateNintendoHashedPWrd(unpacked_token[1], user.pid);


    if (!bcrypt.compareSync(hashed_password, user.sensitive.password)) {
        return null;
    }

    return user;
}

function generateAccessToken(payload) {
    let token = crypto.createHash('md5').update(JSON.stringify(payload)).digest('hex');

    return token;
}

function generateRefreshToken(payload) {
    let token = crypto.createHash('md5').update(JSON.stringify(payload)).digest('hex');

    return token;
}

function mapUser(user) {
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
            value: device_attribute.value
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
            active_flag: user.active_flag,
            birth_date: user.birth_date,
            country: user.country,
            create_date: user.create_date,
            device_attributes: device_attributes,
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
                data: user.mii.data.replace('\r\n', ''),
                id: user.mii.id,
                mii_hash: user.mii.mii_hash,
                mii_images: [
                    {
                        mii_image: {
                            cached_url: user.mii.mii_images[0].cached_url,
                            id: user.mii.mii_images[0].id,
                            url: user.mii.mii_images[0].url,
                            type: user.mii.mii_images[0].type
                        }
                    }
                ],
                name: user.mii.name,
                primary: user.mii.primary
            },
            region: user.region,
            tz_name: user.tz_name,
            user_id: user.user_id,
            utc_offset: user.utc_offset
        }
    }

    return person;
}


module.exports = {
    generatePID: generatePID,
    generateRandID: generateRandID,
    generateNintendoHashedPWrd: generateNintendoHashedPWrd,
    doesUserExist: doesUserExist,
    generateAccessToken: generateAccessToken,
    generateRefreshToken: generateRefreshToken,
    getUser: getUser,
    getUserBasic: getUserBasic,
    mapUser: mapUser,
    generateEmailToken: generateEmailToken,
    generateEmailCode: generateEmailCode,
}