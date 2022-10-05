import { SerializableObject } from '@openhps/core';
import { BLEObject } from './BLEObject';

@SerializableObject()
export class BLEBeaconObject extends BLEObject {
    constructor(manufacturerData?: Buffer) {
        super(undefined);
        this.manufacturerData = manufacturerData;
        this.setUID(this.manufacturerData.toString('hex'));
    }
}
