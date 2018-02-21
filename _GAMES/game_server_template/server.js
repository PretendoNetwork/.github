//////////////////////////////////////////////////////////////////
///                                                            ///
///                   Game Server Template                     ///
///                                                            ///
//////////////////////////////////////////////////////////////////


/////////////Packets are only received; nothing is done with them./////////////
///////////// In order to read the data, they must be decrypted.  /////////////
/////////////        This is done on a per-game basis.            /////////////

//Game server metadata
//Put things such as port and game name here
let port = 88888,
	gamename = 'game',
	//don't mess with these two variables
    dgram = require('dgram');
	server = dgram.createSocket('udp4');
	
function asciiToHex(packet){
	let buf = Buffer.from(packet,'ascii');
	return buf.toString('hex');
}

server.on('listening', function () {
    var address = server.address();
    console.log(gamename + ' server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port +' - ' + asciiToHex(message));
});

server.bind(port, '0.0.0.0');