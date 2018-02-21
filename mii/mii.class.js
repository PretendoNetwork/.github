let BitStream = require('./bitstream.class'),
    bufferpack = require('bufferpack'),
    struct = require('python-struct'),
    range = require('range').range;

class Mii {
    constructor(mii_data) {
        this.mii_data = mii_data;
    }

    swap_endian(buff) {
        let section = buff.subarray(0);
        bufferpack.packTo("<I", buff, 0, struct.unpack(">I", section));

        for (let i of range(0x18, 0x2E, 2)) {
            let section = buff.subarray(i);
            bufferpack.packTo("<H", buff, i, struct.unpack(">H", section));
        }
        for (let i of range(0x30, 0x48, 2)) {
            let section = buff.subarray(i);
            bufferpack.packTo("<H", buff, i, struct.unpack(">H", section));
        }
        for (let i of range(0x48, 0x5C, 2)) {
            let section = buff.subarray(i);
            bufferpack.packTo("<H", buff, i, struct.unpack(">H", section));
        }

        section = buff.subarray(0x5C);
        bufferpack.packTo("<H", buff, 0x5C, struct.unpack(">H", section));
        
		return buff;
    }

    decode() {
        let b64b = Buffer.from(this.mii_data, 'base64'),
            data = b64b.subarray(0, 0x60);

        data = this.swap_endian(data);

        let stream = new BitStream(data);

        let platform_created = stream.bits(4),
            unknown1 = stream.bits(4),
            unknown2 = stream.bits(4),
            unknown3 = stream.bits(4),

            region_font = stream.bits(4),
            region_move = stream.bits(2),

            unknown4 = stream.bit(),
            copyable = Boolean(stream.bit()),
            version = stream.u8(),

            author_id = stream.list(stream.u8, 8),
            mii_id = stream.list(stream.u8, 10),

            unknown5 = stream.read(2).toString(),
            unknown6 = stream.bit(),
            unknown7 = stream.bit(),

            shirt_color = stream.bits(4),
            birth_day = stream.bits(5),
            birth_month = stream.bits(4),
            gender = stream.bit(),
            mii_name = stream.wchars(10).split('u0')[0],
            
            height = stream.u8(),
            fatness = stream.u8(),

            blush_type = stream.bits(4),

            face_style = stream.bits(4),
            face_color = stream.bits(3),
            face_type = stream.bits(4),

            local_only = Boolean(stream.bit()),

            hair_mirrored = Boolean(stream.bits(5)),
            hair_color = stream.bits(3),
            hair_type = stream.u8(),

            eye_thickness = stream.bits(3),
            eye_scale = stream.bits(4),
            eye_color = stream.bits(3),
            eye_type = stream.bits(6),
            eye_height = stream.bits(7),
            eye_distance = stream.bits(4),
            eye_rotation = stream.bits(5),

            eyebrow_thickness = stream.bits(4),
            eyebrow_scale = stream.bits(4),
            eyebrow_color = stream.bits(3),
            eyebrow_type = stream.bits(5),
            eyebrow_height = stream.bits(7),
            eyebrow_distance = stream.bits(4),
            eyebrow_rotation = stream.bits(5),

            nose_height = stream.bits(7),
            nose_scale = stream.bits(4),
            nose_type = stream.bits(5),

            mouth_thickness = stream.bits(3),
            mouth_scale = stream.bits(4),
            mouth_color = stream.bits(3),
            mouth_type = stream.bits(6),

            unknown8 = stream.u8(),

            mustache_type = stream.bits(3),
            mouth_height = stream.bits(5),
            mustache_height = stream.bits(6),
            mustache_scale = stream.bits(4),

            beard_color = stream.bits(3),
            beard_type = stream.bits(3),

            glasses_height = stream.bits(5),
            glasses_scale = stream.bits(4),
            glasses_color = stream.bits(3),
            glasses_type = stream.bits(4),

            unknown9 = stream.bit(),

            mole_ypos = stream.bits(5),
            mole_xpos = stream.bits(5),
            mole_scale = stream.bits(4),
            mole_enabled = stream.bit(),

            creator_name = stream.wchars(10);

        let collection = {
            general: {
                name: mii_name,
                creator: creator_name,
                id: mii_id,
                creator_id: author_id,
                birth_day: birth_day,
                birth_month: birth_month,
                gender: gender,
            },
            head: {
                hair: {
                    mirrored: hair_mirrored,
                    color: hair_color,
                    type: hair_type,
                }
            },
            face: {
                color: face_color,
                type: face_type,
                style: face_style,
                blush_type: blush_type,
                eyes: {
                    thickness: eye_thickness,
                    scale: eye_scale,
                    color: eye_color,
                    type: eye_type,
                    height: eye_height,
                    distance: eye_distance,
                    rotation: eye_rotation,
                },
                nose: {
                    height: nose_height,
                    scale: nose_scale,
                    type: nose_type,
                },
                mouth: {
                    thickness: mouth_thickness,
                    scale: mouth_scale,
                    color: mouth_color,
                    type: mouth_type,
                    height: mouth_height,
                },
                mustache: {
                    type: mustache_type,
                    height: mustache_height,
                    scale: mustache_scale,
                },
                beard: {
                    color: beard_color,
                    type: beard_type,
                },
                glasses: {
                    height: glasses_height,
                    scale: glasses_scale,
                    color: glasses_color,
                    type: glasses_type,
                },
                mole: {
                    pos: {
                        x: mole_xpos,
                        y: mole_ypos,
                    },
                    scale: mole_scale,
                    enabled: mole_enabled,
                }
            },
            body: {
                shirt_color: shirt_color,
                height: height,
                fatness: fatness,
            },
            misc: {
                platform_created: platform_created,
                copyable: copyable,
                region_font: region_font,
                region_move: region_move,
                local_only: local_only,
                version:version,
                unknowns: {
                    1: unknown1,
                    2: unknown2,
                    3: unknown3,
                    4: unknown4,
                    5: unknown5,
                    6: unknown6,
                    7: unknown7,
                    8: unknown8,
                    9: unknown9
                }
            }
        }

        return collection;
    }
}

module.exports = Mii