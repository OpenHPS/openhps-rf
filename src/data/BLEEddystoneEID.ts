import { SerializableMember, SerializableObject, UUID } from '@openhps/core';
import { BLEEddystone } from './BLEEddystone';
import { BLEUUID } from './BLEUUID';

@SerializableObject()
export class BLEEddystoneEID extends BLEEddystone {
    @SerializableMember()
    ephemeralId: UUID;

    isValid(): boolean {
        return super.isValid() && this.frame === 0x30;
    }

    computeUID(): string {
        return this.address ? this.address.toString() : this.uid;
    }

    parseServiceData(uuid: BLEUUID, serviceData: Uint8Array): this {
        if (uuid === undefined || serviceData === undefined) {
            return this;
        }
        super.parseServiceData(uuid, serviceData);

        if (!this.service) {
            return this;
        }

        if (this.frame !== 0x30) {
            return this; // Do not attempt to parse
        }

        this.ephemeralId = UUID.fromBuffer(serviceData.subarray(2, 10));

        if (this.uid === undefined) {
            this.uid = this.computeUID();
        }
        return this;
    }
}
