import { SerializableMember, SerializableObject } from '@openhps/core';
import { MACAddress } from './MACAddress';
import { BLEBeaconObject } from './BLEBeaconObject';
import { arrayBuffersAreEqual } from '../utils/BufferUtils';

@SerializableObject()
export class BLEEddystone extends BLEBeaconObject {
    @SerializableMember()
    frame: number;

    constructor(address?: MACAddress, scanData?: Uint8Array) {
        super(address);
        if (scanData) {
            this.parseAdvertisement(scanData);
        }
    }

    static isInstance(manufacturerData: Uint8Array): boolean {
        return manufacturerData.byteLength === 25 &&
        arrayBuffersAreEqual(
            manufacturerData.buffer.slice(0, 4),
            Uint8Array.from([0x4c, 0x00, 0x02, 0x15]).buffer,
        );
    }

    parseManufacturerData(manufacturerData: Uint8Array): this {
        super.parseManufacturerData(manufacturerData);
        
        return this;
    }
}
