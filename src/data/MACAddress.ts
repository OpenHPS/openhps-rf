import { SerializableMember, SerializableObject } from '@openhps/core';

@SerializableObject()
export class MACAddress {
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

    static fromBuffer(buffer: Buffer): MACAddress {
        return new this(buffer);
    }

    static fromString(address: string): MACAddress {
        return new this(
            Buffer.from(
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

    toBuffer(): Buffer {
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
