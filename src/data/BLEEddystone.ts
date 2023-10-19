import { LengthUnit, SerializableMember, SerializableObject } from '@openhps/core';
import { MACAddress } from './MACAddress';
import { BLEBeaconObject } from './BLEBeaconObject';
import { BLEUUID } from './BLEUUID';
import { BLEService } from './BLEService';
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

    parseServiceData(uuid: BLEUUID, serviceData: Uint8Array): this {
        super.parseServiceData(uuid, serviceData);
        if (!arrayBuffersAreEqual(uuid.toBuffer().buffer, BLEUUID.fromString('FEAA').toBuffer().buffer)) {
            return this;
        }

        const view = new DataView(serviceData.buffer, 0);
        this.frame = view.getInt8(0);
        if (this.frame !== 0x20) {
            this.setCalibratedRSSI(view.getInt8(1), 0, LengthUnit.METER);
        }
        return this;
    }

    protected get service(): BLEService {
        return this.getServiceByUUID(BLEUUID.fromString('FEAA'));
    }
}
