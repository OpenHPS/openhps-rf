import { SerializableArrayMember, SerializableMember, SerializableObject } from '@openhps/core';
import { BLEUUID } from './BLEUUID';
import { RFTransmitterObject } from './RFTransmitterObject';

@SerializableObject()
export class BLEObject extends RFTransmitterObject {
    @SerializableMember({
        serializer: (buffer: Buffer) => {
            if (!buffer) {
                return undefined;
            }
            return buffer.toString('hex');
        },
        deserializer: (bufferString: string) => {
            if (!bufferString) {
                return undefined;
            }
            return Buffer.from(bufferString, 'hex');
        },
    })
    manufacturerData?: Buffer;

    @SerializableMember()
    mtu?: number;

    @SerializableMember()
    appearance?: number;

    /**
     * Service UUIDs
     */
    @SerializableArrayMember(BLEUUID)
    services?: BLEUUID[];
}
