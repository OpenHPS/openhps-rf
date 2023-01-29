/// <reference types="@openhps/rdf" />

import { SerializableMember, SerializableObject } from '@openhps/core';
import { BLEUUID } from './BLEUUID';
import { MACAddress } from './MACAddress';
import { BLEBeaconObject } from './BLEBeaconObject';

/**
 * BLE iBeacon Data Object
 *
 * @see {@link https://wiki.aprbrother.com/en/iBeacon_Packet.html}
 */
@SerializableObject()
export class BLEiBeacon extends BLEBeaconObject {
    @SerializableMember()
    major: number;

    @SerializableMember()
    minor: number;

    @SerializableMember()
    proximityUUID: BLEUUID;

    constructor(address?: MACAddress, scanData?: Buffer) {
        super(address);
        if (scanData) {
            this.parseScanData(scanData);
        }
    }

    parseManufacturerData(manufacturerData: Buffer): this {
        if (
            !(
                manufacturerData.length === 25 &&
                manufacturerData.subarray(0, 4).equals(Buffer.from([0x4c, 0x00, 0x02, 0x15]))
            )
        ) {
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
