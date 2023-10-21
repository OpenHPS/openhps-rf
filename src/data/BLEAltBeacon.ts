import { SerializableMember, SerializableObject } from '@openhps/core';
import { BLEUUID } from './BLEUUID';
import { BLEBeaconBuilder, BLEBeaconObject } from './BLEBeaconObject';
import { arrayBuffersAreEqual, toHexString } from '../utils/BufferUtils';

@SerializableObject()
export class BLEAltBeacon extends BLEBeaconObject {
    @SerializableMember()
    beaconId: BLEUUID;

    @SerializableMember()
    msb: number;

    isValid(): boolean {
        return this.beaconId !== undefined;
    }

    computeUID(): string {
        let uid = new TextDecoder().decode(this.beaconId.toBuffer());
        uid = toHexString(this.beaconId.toBuffer());
        return uid;
    }

    parseManufacturerData(_: number, manufacturerData: Uint8Array): this {
        super.parseManufacturerData(_, manufacturerData);
        if (!manufacturerData) {
            return this;
        }

        const view = new DataView(manufacturerData.buffer, 0);
        if (
            manufacturerData.byteLength < 24 ||
            !arrayBuffersAreEqual(manufacturerData.buffer.slice(0, 2), Uint8Array.from([0xbe, 0xac]).buffer)
        ) {
            return this;
        }
        this.beaconId = BLEUUID.fromBuffer(manufacturerData.subarray(2, 22));
        this.calibratedRSSI = view.getInt8(22);
        this.msb = view.getInt8(23);
        if (this.uid === undefined) {
            this.uid = this.computeUID();
        }
        return this;
    }
}

/**
 * BLE AltBeacon builder
 */
export class BLEAltBeaconBuilder extends BLEBeaconBuilder<BLEAltBeacon> {
    protected manufacturer: number = 0xffff;
    protected identifier: {
        uuid?: BLEUUID;
        major?: number;
        minor?: number;
    } = {};

    protected constructor() {
        super();
        this.beacon = new BLEAltBeacon();
    }

    static create(): BLEAltBeaconBuilder {
        return new BLEAltBeaconBuilder();
    }

    manufacturerId(manufacturer: number): this {
        this.manufacturer = manufacturer;
        return this;
    }

    beaconId(beaconId: BLEUUID): this {
        this.beacon.beaconId = beaconId;
        return this;
    }

    proximityUUID(uuid: BLEUUID): this {
        this.identifier.uuid = uuid;
        return this;
    }

    major(major: number): this {
        this.identifier.major = major;
        return this;
    }

    minor(minor: number): this {
        this.identifier.minor = minor;
        return this;
    }

    build(): Promise<BLEAltBeacon> {
        return new Promise((resolve) => {
            // Compute manufacturer data
            const manufacturerData = new DataView(new ArrayBuffer(24), 0);
            // Advertisement data
            manufacturerData.setUint8(0, 0xbe); // Beacon code
            manufacturerData.setUint8(1, 0xac);
            if (this.beacon.beaconId) {
                // Beacon ID
                const beaconId = new DataView(this.beacon.beaconId.toBuffer().buffer, 0);
                for (let i = 2; i < 2 + 20; i++) {
                    manufacturerData.setUint8(i, beaconId.getUint8(i - 2));
                }
            } else if (this.identifier.uuid) {
                // iBeacon
                const uuid = new DataView(this.identifier.uuid.toBuffer().buffer, 0);
                for (let i = 2; i < 2 + 18; i++) {
                    manufacturerData.setUint8(i, uuid.getUint8(i - 2));
                }
                manufacturerData.setUint8(20, this.identifier.major);
                manufacturerData.setUint8(21, this.identifier.minor);
            }

            manufacturerData.setInt8(22, this.beacon.calibratedRSSI); // Calibrated RSSI
            manufacturerData.setUint8(23, this.beacon.msb);

            this.beacon.manufacturerData.set(this.manufacturer, new Uint8Array(manufacturerData.buffer));
            resolve(this.beacon);
        });
    }
}
