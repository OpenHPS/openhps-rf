import { SerializableMember, SerializableObject, Temperature, TemperatureUnit } from '@openhps/core';
import { BLEEddystone } from './BLEEddystone';
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
    uptime: number;

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
            const tempDec = view.getInt8(4);
            const tempFloat = view.getUint8(5);
            const temperatureCelcius = tempDec + tempFloat * 0.1;
            if (temperatureCelcius !== -128) {
                this.temperature = new Temperature(temperatureCelcius, TemperatureUnit.CELCIUS);
            }
            this.advertiseCount = view.getUint32(6);
            this.uptime = view.getUint32(10) * 0.1;
        }

        if (this.uid === undefined) {
            this.uid = this.computeUID();
        }
        return this;
    }
}
