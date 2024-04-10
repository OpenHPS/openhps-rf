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

    /**
     * Get the manufacturer identifier
     * @returns {number} Manufacturer identifier
     */
    get manufacturerId(): number {
        return this.manufacturerData.size > 0 ? this.manufacturerData.keys().next().value : 0xffff;
    }

    /**
     * Set the manufacturer identifier
     * @param {number} value Manufacturer identifier
     */
    set manufacturerId(value: number) {
        // Get the current identifier
        const currentId = this.manufacturerId;
        // Get the current manufacturer data
        const currentData = this.manufacturerData.get(currentId);
        // Remove the current manufacturer
        this.manufacturerData.delete(currentId);
        // Set the new manufacturer
        this.manufacturerData.set(value, currentData);
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
