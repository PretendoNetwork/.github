let jimp = require('jimp');

(async () => {
    let body = await jimp.read('./parts/bodys/red.png'),
        face = await jimp.read('./parts/faces/white.png');

    let mii = body.composite(face, 10, 10);
    mii.write('./mii10.png');
})();