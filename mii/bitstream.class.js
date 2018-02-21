let bufferpack = require('bufferpack');

class BitStream {
    constructor(data) {
        this.pos = 0;
        this.bit_pos = 0;
        this.buff = data;
    }

    align() {
        this.bit_pos = 0;
		this.pos += 1;
    }

    read(len) {
        let data = this.buff.subarray(this.pos, this.pos + len);
        this.pos += len;

		return data;
    }

    bit() {
        let byte = this.buff[this.pos];
        let value = (byte >> (7 - this.bit_pos)) & 1;
        
        this.bit_pos += 1
        
		if (this.bit_pos == 8) {
            this.bit_pos = 0
			this.pos += 1
        }
	
		return value
    }

    bits(len) {
        let value = 0;

        for (let i=0;i<len;i++) {
            value = value << 1;
			value |= this.bit();
        }

		return value;
    }

    wchars(len) {
        let char_list = this.list(this.u16, len),
            str = '';

        for (let char of char_list) {
            if (char > 0) {
                str += String.fromCharCode(char);
            }
        }
        
        return str;
    }

    list(func, times) {
        let lst = []

        for (let i=0;i<times;i++) {
            lst.push(func(this));
        }

        return lst;
    }

    u8(self) {
        let src = this;
        if (self) src = self;
        
        return src.read(1).readUInt8(0);
    }

    u16(self) {
        let src = this;
        if (self) src = self;

        let rt = bufferpack.unpack(">H", src.read(2))[0];

        return rt;
    }
}

module.exports = BitStream;