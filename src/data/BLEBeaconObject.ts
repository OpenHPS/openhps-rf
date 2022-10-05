import { SerializableMember, SerializableObject } from '@openhps/core';
import { BLEUUID } from './BLEUUID';
import { BLEObject } from './BLEObject';

/**
 * BLE iBeacon Data Object
 *
 * @see {@link https://wiki.aprbrother.com/en/iBeacon_Packet.html}
 */
@SerializableObject()
export class BLEBeaconObject extends BLEObject {
    @SerializableMember()
    major: number;

    @SerializableMember()
    minor: number;

    @SerializableMember()
    proximityUUID: BLEUUID;

    static isValid(payload: Buffer): boolean {
        if (
            payload.length === 30 &&
            payload.subarray(0, 9).equals(Buffer.from([0x02, 0x01, 0x06, 0x1a, 0xff, 0x4c, 0x00, 0x02, 0x15]))
        ) {
            return true;
        }
        return false;
    }

    parseAdvertisement(payload: Buffer): this {
        if (BLEBeaconObject.isValid(payload)) {
            this.txPower = payload.readInt8(29);
            this.major = payload.readUint16BE(25);
            this.minor = payload.readUint16BE(27);
            this.proximityUUID = BLEUUID.fromBuffer(payload.subarray(9, 25));
            this.uid = Buffer.concat([
                this.proximityUUID.toBuffer(),
                Buffer.from([this.major]),
                Buffer.from([this.minor]),
            ]).toString('hex');
            return this;
        } else {
            throw new Error(`Payload is not a valid iBeacon packet!`);
        }
    }
}
