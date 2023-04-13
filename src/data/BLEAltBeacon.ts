import { SerializableMember, SerializableObject } from '@openhps/core';
import { BLEUUID } from './BLEUUID';
import { BLEBeaconObject } from './BLEBeaconObject';
import { arrayBuffersAreEqual, toHexString } from '../utils/BufferUtils';

@SerializableObject()
export class BLEAltBeacon extends BLEBeaconObject {
    @SerializableMember()
    beaconId: BLEUUID;

    @SerializableMember()
    msb: number;

    isValid(): boolean {
        return this.beaconId !== undefined;
    }

    parseManufacturerData(manufacturerData: Uint8Array): this {
        const view = new DataView(manufacturerData.buffer, 0);
        if (
            !(
                manufacturerData.byteLength === 26 &&
                arrayBuffersAreEqual(manufacturerData.buffer.slice(2, 4), Uint8Array.from([0xac, 0xbe]).buffer)
            )
        ) {
            return this;
        }
        this.beaconId = BLEUUID.fromBuffer(manufacturerData.subarray(4, 24));
        this.txPower = view.getInt8(24);
        this.msb = view.getInt8(25);
        if (this.uid === undefined) {
            this.uid = new TextDecoder().decode(this.beaconId.toBuffer());
            this.uid = toHexString(this.beaconId.toBuffer());
        }
        return this;
    }
}
