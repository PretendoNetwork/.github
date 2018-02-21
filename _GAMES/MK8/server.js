//////////////////////////////////////////////////////////////////
///                                                            ///
///                       Yay mario kart                       ///
///                                                            ///
//////////////////////////////////////////////////////////////////

let port = 1337,
    dgram = require('dgram');
	server = dgram.createSocket('udp4');
	
function decryptPacket(packet){
	let buf = Buffer.from(packet,'ascii');
	return buf.toString('hex');
}

server.on('listening', function () {
    var address = server.address();
    console.log('Mario Kart 8 server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port +' - ' + message + '; Decrypted: ' + decryptPacket(message));
	server.send(Buffer.from('200'),remote.port,remote.address);
});

server.bind(port, '0.0.0.0');