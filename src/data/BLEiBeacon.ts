import { SerializableMember, SerializableObject, UUID } from '@openhps/core';
import { BLEUUID } from './BLEUUID';
import { MACAddress } from './MACAddress';
import { BLEBeaconBuilder, BLEBeaconObject } from './BLEBeaconObject';
import { arrayBuffersAreEqual, concatBuffer, toHexString } from '../utils/BufferUtils';

/**
 * BLE iBeacon Data Object
 * @see {@link https://wiki.aprbrother.com/en/iBeacon_Packet.html}
 */
@SerializableObject()
export class BLEiBeacon extends BLEBeaconObject {
    @SerializableMember()
    major: number;

    @SerializableMember()
    minor: number;

    @SerializableMember()
    proximityUUID: BLEUUID;

    constructor(address?: MACAddress, scanData?: Uint8Array) {
        super(address);
        if (scanData) {
            this.parseAdvertisement(scanData);
        }
    }

    computeUID(): string {
        let uid = new TextDecoder().decode(this.proximityUUID.toBuffer());
        uid = toHexString(
            concatBuffer(this.proximityUUID.toBuffer(), Uint8Array.from([this.major]), Uint8Array.from([this.minor])),
        );
        return uid;
    }

    isValid(): boolean {
        return this.proximityUUID !== undefined && this.major !== undefined && this.minor !== undefined;
    }

    parseManufacturerData(manufacturer: number, manufacturerData: Uint8Array): this {
        super.parseManufacturerData(manufacturer, manufacturerData);
        if (!manufacturerData) {
            return this;
        }

        const view = new DataView(manufacturerData.buffer, 0);
        if (
            manufacturer !== 0x004c ||
            manufacturerData.byteLength < 23 ||
            !arrayBuffersAreEqual(manufacturerData.buffer.slice(0, 2), Uint8Array.from([0x02, 0x15]).buffer)
        ) {
            return this;
        }
        this.proximityUUID = BLEUUID.fromBuffer(manufacturerData.slice(2, 18));
        this.major = view.getUint16(18, false);
        this.minor = view.getUint16(20, false);
        this.calibratedRSSI = view.getInt8(22);
        if (this.uid === undefined) {
            this.uid = this.computeUID();
        }
        return this;
    }
}

/**
 * BLE iBeacon builder
 */
export class BLEiBeaconBuilder extends BLEBeaconBuilder<BLEiBeacon> {
    protected constructor() {
        super();
        this.beacon = new BLEiBeacon();
        this.beacon.proximityUUID = BLEUUID.fromString(UUID.generate().toString());
        this.beacon.major = 0;
        this.beacon.minor = 0;
    }

    static create(): BLEiBeaconBuilder {
        return new BLEiBeaconBuilder();
    }

    static fromBeacon(beacon: BLEiBeacon): BLEiBeaconBuilder {
        const builder = new BLEiBeaconBuilder();
        builder.beacon = beacon;
        return builder;
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

    build(): Promise<BLEiBeacon> {
        return new Promise((resolve) => {
            // Compute manufacturer data
            const manufacturerData = new DataView(new ArrayBuffer(23), 0);
            // Advertisement data
            manufacturerData.setUint8(0, 0x02); // Beacon code
            manufacturerData.setUint8(1, 0x15);
            // Proximity UUID
            const proximityUUID = new DataView(this.beacon.proximityUUID.toBuffer().buffer, 0);
            for (let i = 2; i < 2 + 16; i++) {
                manufacturerData.setUint8(i, proximityUUID.getUint8(i - 2));
            }
            manufacturerData.setUint16(18, this.beacon.major);
            manufacturerData.setUint16(20, this.beacon.minor);

            manufacturerData.setInt8(22, this.beacon.calibratedRSSI); // Calibrated RSSI

            this.beacon.manufacturerData.set(0x004c, new Uint8Array(manufacturerData.buffer));
            this.beacon.uid = this.beacon.computeUID();
            resolve(this.beacon);
        });
    }
}
