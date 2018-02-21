let MII_DATA = 'AwAAQCJAGKQgBPBg15xMMuQfAKuusgAA+ENQAHIAZQB0AGUAbgBkAG8AMgAAAF8aAAAhAQJoRBgm\r\nNEYUgRIXaA0AACkAUkhQTQBhAHIAaQBvAAAAAAAAAAAAAAAAAKAp';
// Mii data from Pretendo test account

let Mii = require('./mii.class'), // Require class
    MiiHandler = new Mii(MII_DATA); // Feed it data,
    decoded = MiiHandler.decode(); // Get JSON. Woot!

console.log(decoded.body.shirt_color);
console.log(decoded.face.color);

// Now to rip assets and start rendering

MII_DATA = 'AwAAQLh8tgPjxcLC16eU9AOzuI0n2QAAAERyAGUAbQBvAHYAZQAgAG0AZQAAAEBAIAAhAQJoRBgm\r\nNEYUgRIXaA0AACkAUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPql';
MiiHandler = new Mii(MII_DATA);
decoded = MiiHandler.decode();

console.log(decoded.body.shirt_color);
console.log(decoded.face.color);