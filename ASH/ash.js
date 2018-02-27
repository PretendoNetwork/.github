let fs = require('fs')

function validCourseFormat(buff) {
    let ash = buff.toString();
    return (ash.startsWith('ASH0') && getOffsets(buff, '\x41\x53\x48\x30').length === 4);
}

function extract(ash) {
    ash = fs.readFileSync(ash);

    if (!validCourseFormat(ash)) {
        throw new Error('Invalid course format given');
    }
    
    let offsets = getOffsets(ash, '\x41\x53\x48\x30'),
        ash1 = ash.subarray(0, offsets[1]),
        ash2 = ash.subarray(offsets[1], offsets[2]),
        ash3 = ash.subarray(offsets[2], offsets[3]),
        ash4 = ash.subarray(offsets[3]);

    console.log(offsets);
}

function getOffsets(array, string) {
    let offsets = [], i;
    while ((i = array.indexOf(string, i + 1)) != -1){
        offsets.push(i);
    }
    return offsets;
}

module.exports = {
    extract: extract
}