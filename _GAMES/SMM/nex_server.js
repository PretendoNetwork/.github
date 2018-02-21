//////////////////////////////////////////////////////////////////
///                                                            ///
///                      Yay mario maker                       ///
///                                                            ///
//////////////////////////////////////////////////////////////////

let port = 1300,
    dgram = require('dgram'),
	server = dgram.createSocket('udp4'),
	prompt = require('prompt'),
	convertHex = require('convert-hex'),
	line = 0;
	
function asciiToHex(packet){
	let buf = Buffer.from(packet,'ascii');
	return buf.toString('hex');
}

function interpretPacket(packet, remote){
	let data = {
		vport1: packet[0] + packet[1],
		vport2: packet[2] + packet[3],
		packet_flags: packet[7] + packet[6] + packet[4],
		packet_type: packet[5],
		session_id: packet[8] + packet[9],
		packet_sig: packet[10] + packet[11] + packet[12] + packet[13] + packet[14] + packet[15] + packet[16] + packet[17],
		seqid: packet[18] + packet[19],
		remote_ip: remote.address,
		port: remote.port
	}
	return data;
}

function hexstringToPacket(hexstr){
	return Buffer.from(hexstr,'hex');
}

server.on('listening', function () {
    var address = server.address();
    console.log('Super Mario Maker server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
    console.log(line + ': ' + remote.address + ':' + remote.port +' - ' + asciiToHex(message));
	line += 1;
	let interp = interpretPacket(asciiToHex(message),remote);
	let reply = '';
	switch(interp.packet_type){
	case '0':
		//SYN (Handshake)
		console.log(line + ': ' + remote.address + ':' + remote.port +' - Received SYN handshake request.');
		reply = 'a1af1000000000000000005f2268ea3a';
		line += 1;
		break;
	case '1':
		//CONNECT
		break;
	case '2':
		//DATA
		break;
	case '3':
		//DISCONNECT
		break;
	case '4':
		//PING
		break;
	}
	server.send(hexstringToPacket(reply),remote.port,remote.address);
});

server.bind(port, '0.0.0.0');

function getUserInput(){
    prompt.start();
	prompt.get('cmd', function (err, result) {
    console.log('Command: ' + result.cmd);
	setTimeout(getUserInput, 500);
  });
}

getUserInput();