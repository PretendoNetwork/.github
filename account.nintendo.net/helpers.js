let constants = require('./constants'), 
    database = require('./db'),
    pythonStruct = require('python-struct'),
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

function generateNintendoHashedPWrd(password, pid) {
    let buff1 = pythonStruct.pack('<I', pid);
    let buff2 = Buffer.from(password).toString('ascii');

    let unpacked = new Buffer(bufferToHex(buff1) + '\x02eCF' + buff2, 'ascii'),
        hashed = require('crypto').createHash('sha256').update(unpacked).digest().toString('hex');

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
    //TODO: implement actual token instead of using raw pid

	let user = await database.user_collection.findOne({
        'sensitive.tokens.access.token': token
    });
    
    if (user) {
        return user;
    }

    return null;
}


function generateAccessToken(payload) {
    let token = crypto.createHash('md5').update(JSON.stringify(payload)).digest('hex');

    return token;
}

function generateRefreshToken(payload) {
    let token = crypto.createHash('md5').update(JSON.stringify(payload)).digest('hex');

    return token;
}


module.exports = {
    generatePID: generatePID,
    generateRandID: generateRandID,
    generateNintendoHashedPWrd: generateNintendoHashedPWrd,
    doesUserExist: doesUserExist,
    generateAccessToken: generateAccessToken,
    generateRefreshToken: generateRefreshToken,
    getUser: getUser
}