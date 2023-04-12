import { SerializableMember, SerializableObject } from '@openhps/core';
import { BLEUUID } from './BLEUUID';
import { BLEBeaconObject } from './BLEBeaconObject';
import { arrayBuffersAreEqual } from '../utils/BufferUtils';

@SerializableObject()
export class BLEAltBeacon extends BLEBeaconObject {
    @SerializableMember()
    proximityUUID: BLEUUID;

    isValid(): boolean {
        return this.proximityUUID !== undefined;
    }

    parseManufacturerData(manufacturerData: Uint8Array): this {
        const view = new DataView(manufacturerData.buffer, 0);
        if (
            !(
                manufacturerData.byteLength === 26 &&
                arrayBuffersAreEqual(
                    manufacturerData.buffer.slice(0, 4),
                    Uint8Array.from([0x4c, 0x00, 0x02, 0x15]).buffer,
                )
            )
        ) {
            return this;
        }
        this.proximityUUID = BLEUUID.fromBuffer(manufacturerData.subarray(4, 20));
        // this.major = manufacturerData.readUint16BE(20);
        // this.minor = manufacturerData.readUint16BE(22);
        this.txPower = view.getInt8(24);
        this.uid = Buffer.concat([
            this.proximityUUID.toBuffer(),
            // Buffer.from([this.major]),
            // Buffer.from([this.minor]),
        ]).toString('hex');
        return this;
    }
}
