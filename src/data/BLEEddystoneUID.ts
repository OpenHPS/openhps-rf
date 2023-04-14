import { SerializableMember, SerializableObject } from '@openhps/core';
import { concatBuffer, toHexString } from '../utils/BufferUtils';
import { BLEEddystone } from './BLEEddystone';
import { BLEUUID } from './BLEUUID';

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

    parseAdvertisement(payload: Uint8Array): this {
        super.parseAdvertisement(payload);
        const service = this.service;
        if (service) {
            this.namespaceId = BLEUUID.fromBuffer(service.data.subarray(2, 12));
            this.instanceId = BLEUUID.fromBuffer(service.data.subarray(12, 18));
            if (this.uid === undefined) {
                this.uid = new TextDecoder().decode(this.namespaceId.toBuffer());
                this.uid = toHexString(concatBuffer(this.namespaceId.toBuffer(), this.instanceId.toBuffer()));
            }
        }
        return this;
    }
}
