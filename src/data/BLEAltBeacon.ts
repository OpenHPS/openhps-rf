import { SerializableMember, SerializableObject, UUID } from '@openhps/core';
import { BLEUUID } from './BLEUUID';
import { BLEBeaconBuilder, BLEBeaconObject } from './BLEBeaconObject';
import { arrayBuffersAreEqual, toHexString } from '../utils/BufferUtils';

@SerializableObject()
export class BLEAltBeacon extends BLEBeaconObject {
    @SerializableMember()
    beaconId: BLEUUID;

    @SerializableMember()
    msb: number;

    get proximityUUID(): BLEUUID {
        if (this.beaconId) {
            return BLEUUID.fromBuffer(new Uint8Array(this.beaconId.toBuffer().buffer.slice(0, 16)));
        } else {
            return undefined;
        }
    }

    set proximityUUID(uuid: BLEUUID) {
        if (!this.beaconId) {
            this.beaconId = BLEUUID.fromBuffer(new Uint8Array(20));
        }
        const uuidView = new DataView(uuid.toBuffer().buffer);
        const view = new DataView(this.beaconId.toBuffer().buffer);
        for (let i = 0; i < 16; i++) {
            view.setUint8(i, uuidView.getUint8(i));
        }
    }

    get major(): number {
        if (this.beaconId) {
            const view = new DataView(this.beaconId.toBuffer().buffer);
            return view.getUint16(16);
        } else {
            return undefined;
        }
    }

    set major(value: number) {
        if (!this.beaconId) {
            this.beaconId = BLEUUID.fromBuffer(new Uint8Array(20));
        }
        const view = new DataView(this.beaconId.toBuffer().buffer);
        view.setUint16(16, value);
    }

    get minor(): number {
        if (this.beaconId) {
            const view = new DataView(this.beaconId.toBuffer().buffer);
            return view.getUint16(18);
        } else {
            return undefined;
        }
    }

    set minor(value: number) {
        if (!this.beaconId) {
            this.beaconId = BLEUUID.fromBuffer(new Uint8Array(20));
        }
        const view = new DataView(this.beaconId.toBuffer().buffer);
        view.setUint16(18, value);
    }

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
        this.beaconId = BLEUUID.fromBuffer(manufacturerData.slice(2, 22));
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

    protected constructor() {
        super();
        this.beacon = new BLEAltBeacon();
        this.beacon.proximityUUID = BLEUUID.fromString(UUID.generate().toString());
        this.beacon.major = 0;
        this.beacon.minor = 0;
    }

    static create(): BLEAltBeaconBuilder {
        return new BLEAltBeaconBuilder();
    }

    static fromBeacon(beacon: BLEAltBeacon): BLEAltBeaconBuilder {
        const builder = new BLEAltBeaconBuilder();
        builder.beacon = beacon;
        builder.manufacturer = beacon.manufacturerData.size > 0 ? beacon.manufacturerData.keys().next().value : 0xffff;
        return builder;
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
        this.beacon.proximityUUID = uuid;
        return this;
    }

    major(major: number): this {
        this.beacon.major = major;
        return this;
    }

    minor(minor: number): this {
        this.beacon.minor = minor;
        return this;
    }

    build(): Promise<BLEAltBeacon> {
        return new Promise((resolve) => {
            // Compute manufacturer data
            const manufacturerData = new DataView(new ArrayBuffer(24), 0);
            // Advertisement data
            manufacturerData.setUint8(0, 0xbe); // Beacon code
            manufacturerData.setUint8(1, 0xac);
            // Beacon ID
            const beaconId = new DataView(this.beacon.beaconId.toBuffer().buffer, 0);
            for (let i = 2; i < 2 + 20; i++) {
                manufacturerData.setUint8(i, beaconId.getUint8(i - 2));
            }

            manufacturerData.setInt8(22, this.beacon.calibratedRSSI); // Calibrated RSSI
            manufacturerData.setUint8(23, this.beacon.msb);
            this.beacon.beaconId = BLEUUID.fromBuffer(new Uint8Array(manufacturerData.buffer.slice(2, 22)));
            this.beacon.manufacturerData.set(this.manufacturer, new Uint8Array(manufacturerData.buffer));
            this.beacon.uid = this.beacon.computeUID();
            resolve(this.beacon);
        });
    }
}
