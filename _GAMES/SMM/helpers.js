let constants = require('./constants');

function generateRandID(length = 10) {
    let id = '';

    for (var i=0;i<length;i++) {
        id += constants.PID_SORT_LIST.charAt(Math.floor(Math.random() * constants.PID_SORT_LIST.length));
    }

    return id;
}

module.exports = {
    generateRandID: generateRandID
}