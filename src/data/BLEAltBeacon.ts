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

    parseManufacturerData(_: number, manufacturerData: Uint8Array): this {
        super.parseManufacturerData(_, manufacturerData);
        if (!manufacturerData) {
            return this;
        }

        const view = new DataView(manufacturerData.buffer, 0);
        if (
            manufacturerData.byteLength !== 26 ||
            !arrayBuffersAreEqual(manufacturerData.buffer.slice(0, 2), Uint8Array.from([0xbe, 0xac]).buffer)
        ) {
            return this;
        }
        this.beaconId = BLEUUID.fromBuffer(manufacturerData.subarray(2, 22));
        this.txPower = view.getInt8(22);
        this.msb = view.getInt8(23);
        if (this.uid === undefined) {
            this.uid = new TextDecoder().decode(this.beaconId.toBuffer());
            this.uid = toHexString(this.beaconId.toBuffer());
        }
        return this;
    }
}
