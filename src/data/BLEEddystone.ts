import { SerializableMember, SerializableObject } from '@openhps/core';
import { MACAddress } from './MACAddress';
import { BLEBeaconObject } from './BLEBeaconObject';
import { BLEUUID } from './BLEUUID';
import { BLEService } from './BLEService';

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
        return this.service !== undefined;
    }

    parseAdvertisement(payload: Uint8Array): this {
        super.parseAdvertisement(payload);
        const service = this.service;
        if (service) {
            const view = new DataView(service.data.buffer, 0);
            this.frame = view.getInt8(0);
            this.txPower = view.getInt8(1);
        }
        return this;
    }

    protected get service(): BLEService {
        return this.getServiceByUUID(BLEUUID.fromString('AAFE'));
    }
}
