import { SerializableMember, SerializableObject } from '@openhps/core';
import { BLEUUID } from './BLEUUID';
import { BLEObject } from './BLEObject';
import { MACAddress } from './MACAddress';

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

    constructor(address?: MACAddress, manufacturerData?: Buffer) {
        super(address);
        if (manufacturerData) {
            this.parseManufacturerData(manufacturerData);
        }
    }

    static isValid(manufacturerData: Buffer): boolean {
        if (
            manufacturerData.length === 25 &&
            manufacturerData.subarray(0, 4).equals(Buffer.from([0x4c, 0x00, 0x02, 0x15]))
        ) {
            return true;
        }
        return false;
    }

    parseManufacturerData(manufacturerData: Buffer): this {
        if (!BLEBeaconObject.isValid(manufacturerData)) {
            return this;
        }
        this.proximityUUID = BLEUUID.fromBuffer(manufacturerData.subarray(4, 20));
        this.major = manufacturerData.readUint16BE(20);
        this.minor = manufacturerData.readUint16BE(22);
        this.txPower = manufacturerData.readInt8(24);
        this.uid = Buffer.concat([
            this.proximityUUID.toBuffer(),
            Buffer.from([this.major]),
            Buffer.from([this.minor]),
        ]).toString('hex');
        return this;
    }
}
