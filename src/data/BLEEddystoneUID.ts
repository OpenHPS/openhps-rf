import { LengthUnit, SerializableMember, SerializableObject } from '@openhps/core';
import { concatBuffer, toHexString } from '../utils/BufferUtils';
import { BLEEddystone } from './BLEEddystone';
import { BLEUUID } from './BLEUUID';
import { BLEBeaconBuilder } from './BLEBeaconObject';
import { BLEService } from './BLEService';

@SerializableObject()
export class BLEEddystoneUID extends BLEEddystone {
    @SerializableMember()
    namespaceId: BLEUUID;

    @SerializableMember()
    instanceId: BLEUUID;

    isValid(): boolean {
        return (
            super.isValid() && this.frame === 0x00 && this.namespaceId !== undefined && this.instanceId !== undefined
        );
    }

    computeUID(): string {
        let uid = new TextDecoder().decode(this.namespaceId.toBuffer());
        uid = toHexString(concatBuffer(this.namespaceId.toBuffer(), this.instanceId.toBuffer()));
        return uid;
    }

    parseServiceData(uuid: BLEUUID, serviceData: Uint8Array): this {
        super.parseServiceData(uuid, serviceData);
        if (uuid === undefined && serviceData === undefined) {
            return this;
        }

        if (!this.service) {
            return this;
        }

        if (this.frame !== 0x00) {
            return this; // Do not attempt to parse
        }

        this.namespaceId = BLEUUID.fromBuffer(serviceData.subarray(2, 12));
        this.instanceId = BLEUUID.fromBuffer(serviceData.subarray(12, 18));
        if (this.uid === undefined) {
            this.uid = this.computeUID();
        }
        return this;
    }
}

/**
 * BLE Eddystone UID builder
 */
export class BLEEddystoneUIDBuilder extends BLEBeaconBuilder<BLEEddystoneUID> {
    protected constructor() {
        super();
        this.beacon = new BLEEddystoneUID();
    }

    static create(): BLEEddystoneUIDBuilder {
        return new BLEEddystoneUIDBuilder();
    }

    namespaceId(namespaceId: BLEUUID): this {
        this.beacon.namespaceId = namespaceId;
        return this;
    }

    instanceId(instanceId: string): this {
        this.beacon.instanceId = BLEUUID.fromString(instanceId);
        return this;
    }

    calibratedRSSI(rssi: number): this {
        this.beacon.calibratedRSSI = rssi;
        return this;
    }

    build(): Promise<BLEEddystoneUID> {
        return new Promise((resolve) => {
            // Eddystone Service
            const serviceData = new DataView(new ArrayBuffer(19 - (17 - length)), 0);
            serviceData.setUint8(0, 0x00); // Eddystone-UID frame
            serviceData.setInt8(1, this.beacon.getCalibratedRSSI(0, LengthUnit.METER));
            // Namespace ID
            const namespaceId = new DataView(this.beacon.namespaceId.toBuffer().buffer, 0);
            for (let i = 2; i < 2 + 10; i++) {
                serviceData.setUint8(i, namespaceId.getUint8(i - 2));
            }
            const instanceId = new DataView(this.beacon.instanceId.toBuffer().buffer, 0);
            for (let i = 12; i < 12 + 6; i++) {
                serviceData.setUint8(i, instanceId.getUint8(i - 2));
            }

            this.beacon.addService(new BLEService(BLEUUID.fromString('FEAA'), new Uint8Array(serviceData.buffer)));
            resolve(this.beacon);
        });
    }
}
