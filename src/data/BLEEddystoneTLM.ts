import {
    SerializableMember,
    SerializableObject,
    Temperature,
    TemperatureUnit,
    TimeUnit,
    UnitValue,
} from '@openhps/core';
import { BLEBeaconBuilder } from './BLEBeaconObject';
import { BLEEddystone } from './BLEEddystone';
import { BLEService } from './BLEService';
import { BLEUUID } from './BLEUUID';

@SerializableObject()
export class BLEEddystoneTLM extends BLEEddystone {
    @SerializableMember()
    version: number;

    /**
     * Voltage in mV
     */
    @SerializableMember()
    voltage: number;

    @SerializableMember()
    temperature?: Temperature;

    @SerializableMember()
    advertiseCount: number;

    @SerializableMember()
    uptime: UnitValue<TimeUnit, number>;

    get encrypted(): boolean {
        return this.version === 0x01;
    }

    isValid(): boolean {
        return super.isValid() && this.frame === 0x20;
    }

    computeUID(): string {
        return this.address ? this.address.toString() : this.uid;
    }

    parseServiceData(uuid: BLEUUID, serviceData: Uint8Array): this {
        super.parseServiceData(uuid, serviceData);
        if (uuid === undefined && serviceData === undefined) {
            return this;
        }

        if (!this.service) {
            return this;
        }

        if (this.frame !== 0x20) {
            return this; // Do not attempt to parse
        }

        const view = new DataView(serviceData.buffer, 0);
        this.version = view.getUint8(1);

        if (this.version === 0x01) {
            // Encrypted
        } else {
            // Unencrypted
            this.voltage = view.getUint16(2);
            const temperatureRaw = view.getInt16(4);
            if (temperatureRaw !== 0x8000) {
                const temperatureSigned = (temperatureRaw & 0x8000) > 0 ? -1 : 1;
                const temperature = (temperatureSigned * temperatureRaw) / Math.pow(2, 8);
                this.temperature = new Temperature(temperature, TemperatureUnit.CELCIUS);
            }
            this.advertiseCount = view.getUint32(6);
            this.uptime = new UnitValue(view.getUint32(10) * 0.1, TimeUnit.SECOND);
        }

        if (this.uid === undefined) {
            this.uid = this.computeUID();
        }
        return this;
    }
}

/**
 * BLE Eddystone TLM builder
 */
export class BLEEddystoneTLMBuilder extends BLEBeaconBuilder<BLEEddystoneTLM> {
    protected constructor() {
        super();
        this.beacon = new BLEEddystoneTLM();
        this.beacon.frame = 0x20;
        this.beacon.version = 0x00;
    }

    static create(): BLEEddystoneTLMBuilder {
        return new BLEEddystoneTLMBuilder();
    }

    calibratedRSSI(rssi: number): this {
        this.beacon.calibratedRSSI = rssi;
        return this;
    }

    voltage(voltage: number): this {
        this.beacon.voltage = voltage;
        return this;
    }

    temperature(temperature: number, unit: TemperatureUnit = TemperatureUnit.CELCIUS): this {
        this.beacon.temperature = new Temperature(temperature, unit);
        return this;
    }

    uptime(time: number, unit: TimeUnit = TimeUnit.SECOND): this {
        this.beacon.uptime = new UnitValue(time, unit);
        return this;
    }

    advertiseCount(count: number): this {
        this.beacon.advertiseCount = count;
        return this;
    }

    build(): Promise<BLEEddystoneTLM> {
        return new Promise((resolve) => {
            // Eddystone Service
            const serviceData = new DataView(new ArrayBuffer(14));
            serviceData.setUint8(0, 0x20); // Eddystone-TLM frame
            serviceData.setInt8(1, 0x00); // Version
            serviceData.setUint16(2, this.beacon.voltage);
            if (this.beacon.temperature) {
                const temperature = Math.floor(this.beacon.temperature.value);
                const fval = Math.floor(100 * temperature + 0.5);
                serviceData.setInt16(4, (temperature << 8) + fval);
            } else {
                serviceData.setInt16(4, 0x8000);
            }

            serviceData.setUint32(6, this.beacon.advertiseCount);
            if (this.beacon.uptime) {
                serviceData.setUint32(10, this.beacon.uptime.to(TimeUnit.SECOND).valueOf() / 0.1);
            }
            this.beacon.addService(new BLEService(BLEUUID.fromString('FEAA'), new Uint8Array(serviceData.buffer)));
            resolve(this.beacon);
        });
    }
}
