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

    isValid(): boolean {
        return false;
    }

    parseManufacturerData(manufacturerData: Uint8Array): this {
        super.parseManufacturerData(manufacturerData);
        
        return this;
    }
}
