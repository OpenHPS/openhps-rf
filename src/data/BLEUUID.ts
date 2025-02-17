import { BufferUtils, SerializableMember, SerializableObject } from '@openhps/core';

const BLE_UUID_PADDING = '-0000-1000-8000-00805f9b34fb';

/**
 * BLE UUID
 */
@SerializableObject()
export class BLEUUID {
    @SerializableMember()
    private _raw: Uint8Array;

    private constructor(buffer?: Uint8Array) {
        this._raw = buffer;
    }

    static fromBuffer(buffer: Uint8Array, littleEndian?: boolean): BLEUUID {
        if (littleEndian) {
            let swappedBuffer = new Uint8Array();
            for (let i = buffer.length - 1; i >= 0; i--) {
                swappedBuffer = BufferUtils.concatBuffer(swappedBuffer, new Uint8Array([buffer[i]]));
            }
            return new this(swappedBuffer);
        } else {
            return new this(buffer);
        }
    }

    static fromString(uuid: string): BLEUUID {
        let array = Uint8Array.from(
            uuid
                .replace(BLE_UUID_PADDING, '')
                .replace(/-/g, '')
                .split(/(..)/)
                .filter((a) => {
                    return a !== '';
                })
                .map((hex) => {
                    return Number(`0x${hex}`);
                }),
        );
        if (uuid.startsWith('0000')) {
            array = array.slice(2);
        }
        return new this(array);
    }

    toBuffer(): Uint8Array {
        return this._raw;
    }

    to128bit(): BLEUUID {
        return BLEUUID.fromString(this.toString(8));
    }

    toString(byteLength?: number, padding: boolean = true): string {
        byteLength = byteLength ?? this._raw.byteLength;
        const bytes = [];
        for (const [, value] of this._raw.entries()) {
            bytes.push(value);
        }
        const UUID_PADDING = padding ? BLE_UUID_PADDING : '';
        if (byteLength === 2) {
            // 16 bit
            return (
                '0000' +
                bytes
                    .map((byte: number) => {
                        return byte.toString(16).padStart(2, '0');
                    })
                    .join('') +
                UUID_PADDING
            );
        } else if (byteLength === 4) {
            // 32 bit
            return (
                bytes
                    .map((byte: number) => {
                        return byte.toString(16).padStart(2, '0');
                    })
                    .join('') + UUID_PADDING
            );
        } else if (byteLength === 16) {
            // 128 bit
            const hex = bytes.map((byte: number) => {
                return byte.toString(16).padStart(2, '0');
            });
            return (
                hex.splice(0, 4).join('') +
                '-' +
                hex.splice(0, 2).join('') +
                '-' +
                hex.splice(0, 2).join('') +
                '-' +
                hex.splice(0, 2).join('') +
                '-' +
                hex.join('')
            );
        } else {
            // Strange
            const hex = bytes.map((byte: number) => {
                return byte.toString(16).padStart(2, '0');
            });
            return hex.join('');
        }
    }
}
