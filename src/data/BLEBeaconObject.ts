import { SerializableObject } from '@openhps/core';
import { BLEObject } from './BLEObject';
import { MACAddress } from './MACAddress';

@SerializableObject()
export class BLEBeaconObject extends BLEObject {
    constructor(address?: MACAddress, manufacturerData?: Buffer) {
        super(address);
        this.manufacturerData = manufacturerData;
        if (this.manufacturerData) {
            this.setUID(this.manufacturerData.toString('hex'));
        }
    }
}
