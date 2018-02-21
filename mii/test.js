let MII_DATA = 'AwAAQCJAGKQgBPBg15xMMuQfAKuusgAA+ENQAHIAZQB0AGUAbgBkAG8AMgAAAF8aAAAhAQJoRBgm\r\nNEYUgRIXaA0AACkAUkhQTQBhAHIAaQBvAAAAAAAAAAAAAAAAAKAp';
// Mii data from Pretendo test account

let Mii = require('./mii.class'), // Require class
    MiiHandler = new Mii(MII_DATA); // Feed it data,
    decoded = MiiHandler.decode(); // Get JSON. Woot!

console.log(decoded.body.shirt_color);
console.log(decoded.face.color);

// Now to rip assets and start rendering

MII_DATA = 'AwAAQLh8tgPjxcLC16gxAwOzuI0n2QAAAEBwAHIAZQB0AGUAbgBkAG8AMQAAAEBAAAAhAQJoRBgm\r\nNEYUgRIXaA0AACkAUkhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG+X';
MiiHandler = new Mii(MII_DATA);
decoded = MiiHandler.decode();

console.log(decoded);