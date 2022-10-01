import { SerializableMember, SerializableObject } from '@openhps/core';

const BLE_UUID_PADDING = '-0000-1000-8000-00805f9b34fb';

/**
 * BLE UUID
 */
@SerializableObject()
export class BLEUUID {
    @SerializableMember({
        serializer: (buffer: Buffer) => {
            return buffer.toString('hex');
        },
        deserializer: (bufferString: string) => {
            return Buffer.from(bufferString, 'hex');
        },
    })
    private _raw: Buffer;

    private constructor(buffer?: Buffer) {
        this._raw = buffer;
    }

    static fromBuffer(buffer: Buffer): BLEUUID {
        return new this(buffer);
    }

    static fromString(uuid: string): BLEUUID {
        return new this(
            Buffer.from(
                uuid
                    .replace(BLE_UUID_PADDING, '')
                    .replace(/^0000/, '')
                    .replace(/-/g, '')
                    .split(/(..)/)
                    .reverse()
                    .filter((a) => {
                        return a !== '';
                    })
                    .map((hex) => {
                        return Number(`0x${hex}`);
                    }),
            ),
        );
    }

    toBuffer(): Buffer {
        return this._raw;
    }

    toString(): string {
        const bytes = [];
        for (const [, value] of this._raw.entries()) {
            bytes.unshift(value);
        }
        if (this._raw.length === 2) {
            // 16 bit
            return (
                '0000' +
                bytes
                    .map((byte: number) => {
                        return byte.toString(16).padStart(2, '0');
                    })
                    .join('') +
                BLE_UUID_PADDING
            );
        } else if (this._raw.length === 4) {
            // 32 bit
            return (
                bytes
                    .map((byte: number) => {
                        return byte.toString(16).padStart(2, '0');
                    })
                    .join('') + BLE_UUID_PADDING
            );
        } else {
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
        }
    }
}
