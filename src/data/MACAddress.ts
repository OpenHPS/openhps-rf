import { SerializableMember, SerializableObject } from '@openhps/core';
import { fromHexString, toHexString } from '../utils/BufferUtils';

@SerializableObject()
export class MACAddress {
    @SerializableMember({
        serializer: toHexString,
        deserializer: fromHexString,
    })
    private _raw: Uint8Array;

    private constructor(buffer?: Uint8Array) {
        this._raw = buffer;
    }

    static fromBuffer(buffer: Uint8Array): MACAddress {
        return new this(buffer);
    }

    static fromString(address: string): MACAddress {
        return new this(
            Uint8Array.from(
                address
                    .replace(/:/g, '')
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
        return bytes
            .map((byte: number) => {
                return byte.toString(16).padStart(2, '0');
            })
            .join(':');
    }
}
