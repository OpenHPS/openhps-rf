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

    displayName(name: string): this {
        this.beacon.displayName = name;
        return this;
    }

    macAddress(address: string): this;
    macAddress(address: MACAddress): this;
    macAddress(address: MACAddress | string): this {
        if (typeof address === 'string') {
            this.beacon.address = MACAddress.fromString(address);
        } else {
            this.beacon.address = address;
        }
        return this;
    }

    calibratedRSSI(rssi: number): this {
        this.beacon.calibratedRSSI = rssi;
        return this;
    }

    abstract build(): Promise<B>;
}
