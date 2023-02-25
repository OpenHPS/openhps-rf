import { SerializableMember, SerializableObject } from '@openhps/core';
import { fromHexString, toHexString } from '../utils/BufferUtils';

const BLE_UUID_PADDING = '-0000-1000-8000-00805f9b34fb';

/**
 * BLE UUID
 */
@SerializableObject()
export class BLEUUID {
    @SerializableMember({
        serializer: toHexString,
        deserializer: fromHexString,
    })
    private _raw: Uint8Array;

    private constructor(buffer?: Uint8Array) {
        this._raw = buffer;
    }

    static fromBuffer(buffer: Uint8Array): BLEUUID {
        return new this(buffer);
    }

    static fromString(uuid: string): BLEUUID {
        return new this(
            Uint8Array.from(
                uuid
                    .replace(BLE_UUID_PADDING, '')
                    .replace(/^0000/, '')
                    .replace(/-/g, '')
                    .split(/(..)/)
                    .filter((a) => {
                        return a !== '';
                    })
                    .map((hex) => {
                        return Number(`0x${hex}`);
                    }),
            ),
        );
    }

    toBuffer(): Uint8Array {
        return this._raw;
    }

    toString(): string {
        const bytes = [];
        for (const [, value] of this._raw.entries()) {
            bytes.push(value);
        }
        if (this._raw.byteLength === 2) {
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
        } else if (this._raw.byteLength === 4) {
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
