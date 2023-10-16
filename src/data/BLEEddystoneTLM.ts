import { SerializableMember, SerializableObject, Temperature } from '@openhps/core';
import { BLEEddystone } from './BLEEddystone';
import { BLEUUID } from './BLEUUID';

@SerializableObject()
export class BLEEddystoneTLM extends BLEEddystone {
    @SerializableMember()
    version: number;

    @SerializableMember()
    voltage: number;

    @SerializableMember()
    temperature: Temperature;

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

        if (this.uid === undefined) {
            this.uid = this.computeUID();
        }
        return this;
    }
}
