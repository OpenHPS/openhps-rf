/// <reference types="@openhps/rdf" />

import { SerializableObject } from '@openhps/core';
import { BLEObject } from './BLEObject';
import { MACAddress } from './MACAddress';

/**
 * BLE Beacon Data Object
 */
@SerializableObject()
export abstract class BLEBeaconObject extends BLEObject {
    constructor(address?: MACAddress, scanData?: Uint8Array) {
        super(address);
        if (scanData) {
            this.parseScanData(scanData);
        }
    }
}
