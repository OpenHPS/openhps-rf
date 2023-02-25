/// <reference types="@openhps/rdf" />

import { SerializableMember, SerializableObject } from '@openhps/core';
import { BLEUUID } from './BLEUUID';
import { MACAddress } from './MACAddress';
import { BLEBeaconObject } from './BLEBeaconObject';
import { arrayBuffersAreEqual, concatBuffer, toHexString } from '../utils/BufferUtils';

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

    constructor(address?: MACAddress, scanData?: Uint8Array) {
        super(address);
        if (scanData) {
            this.parseScanData(scanData);
        }
    }

    parseManufacturerData(manufacturerData: Uint8Array): this {
        const view = new DataView(manufacturerData.buffer, 0);
        if (
            !(
                manufacturerData.byteLength === 25 &&
                arrayBuffersAreEqual(
                    manufacturerData.buffer.slice(0, 4),
                    Uint8Array.from([0x4c, 0x00, 0x02, 0x15]).buffer,
                )
            )
        ) {
            return this;
        }
        this.proximityUUID = BLEUUID.fromBuffer(manufacturerData.subarray(4, 20));
        this.major = view.getUint16(20, false);
        this.minor = view.getUint16(22, false);
        this.txPower = view.getInt8(24);
        this.uid = new TextDecoder().decode(this.proximityUUID.toBuffer());
        this.uid = toHexString(
            concatBuffer(this.proximityUUID.toBuffer(), Uint8Array.from([this.major]), Uint8Array.from([this.minor])),
        );
        return this;
    }
}
