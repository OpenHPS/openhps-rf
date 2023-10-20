import { SerializableObject } from '@openhps/core';
import { BLEObject } from './BLEObject';
import { MACAddress } from './MACAddress';

/**
 * BLE Beacon Data Object
 */
@SerializableObject()
export abstract class BLEBeaconObject extends BLEObject {
    constructor(address?: MACAddress, rawAdvertisement?: Uint8Array) {
        super(address);
        if (rawAdvertisement) {
            this.parseAdvertisement(rawAdvertisement);
        }
    }

    abstract isValid(): boolean;

    computeUID(): string {
        return this.uid;
    }
}

/**
 * BLE beacon builder
 */
export abstract class BLEBeaconBuilder<B extends BLEBeaconObject> {
    protected beacon: B;

    calibratedRSSI(rssi: number): this {
        this.beacon.calibratedRSSI = rssi;
        return this;
    }

    abstract build(): Promise<B>;
}
