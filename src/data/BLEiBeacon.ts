import { SerializableMember, SerializableObject } from '@openhps/core';
import { BLEUUID } from './BLEUUID';
import { MACAddress } from './MACAddress';
import { BLEBeaconObject } from './BLEBeaconObject';
import { arrayBuffersAreEqual, concatBuffer, toHexString } from '../utils/BufferUtils';

/**
 * BLE iBeacon Data Object
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
            this.parseAdvertisement(scanData);
        }
    }

    computeUID(): string {
        let uid = new TextDecoder().decode(this.proximityUUID.toBuffer());
        uid = toHexString(
            concatBuffer(this.proximityUUID.toBuffer(), Uint8Array.from([this.major]), Uint8Array.from([this.minor])),
        );
        return uid;
    }

    isValid(): boolean {
        return this.proximityUUID !== undefined && this.major !== undefined && this.minor !== undefined;
    }

    parseManufacturerData(manufacturer: number, manufacturerData: Uint8Array): this {
        super.parseManufacturerData(manufacturer, manufacturerData);
        if (!manufacturerData) {
            return this;
        }

        const view = new DataView(manufacturerData.buffer, 0);
        if (
            manufacturer !== 0x004c ||
            manufacturerData.byteLength < 23 ||
            !arrayBuffersAreEqual(manufacturerData.buffer.slice(0, 2), Uint8Array.from([0x02, 0x15]).buffer)
        ) {
            return this;
        }
        this.proximityUUID = BLEUUID.fromBuffer(manufacturerData.subarray(2, 18));
        this.major = view.getUint16(18, false);
        this.minor = view.getUint16(20, false);
        this.calibratedRSSI = view.getInt8(22);
        if (this.uid === undefined) {
            this.uid = this.computeUID();
        }
        return this;
    }
}
