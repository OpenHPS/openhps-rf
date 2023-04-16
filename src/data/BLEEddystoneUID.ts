import { SerializableMember, SerializableObject } from '@openhps/core';
import { arrayBuffersAreEqual, concatBuffer, toHexString } from '../utils/BufferUtils';
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

    parseServiceData(uuid: BLEUUID, serviceData: Uint8Array): this {
        super.parseServiceData(uuid, serviceData);
        if (uuid === undefined && serviceData === undefined) {
            return this;
        }

        if (!arrayBuffersAreEqual(uuid.toBuffer().buffer, this.service.uuid.toBuffer().buffer)) {
            return this;
        }
        this.namespaceId = BLEUUID.fromBuffer(serviceData.subarray(2, 12));
        this.instanceId = BLEUUID.fromBuffer(serviceData.subarray(12, 18));
        if (this.uid === undefined) {
            this.uid = new TextDecoder().decode(this.namespaceId.toBuffer());
            this.uid = toHexString(concatBuffer(this.namespaceId.toBuffer(), this.instanceId.toBuffer()));
        }
        return this;
    }
}
