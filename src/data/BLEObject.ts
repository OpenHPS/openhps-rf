import { SerializableArrayMember, SerializableMember, SerializableObject } from '@openhps/core';
import { BLEUUID } from './BLEUUID';
import { RFTransmitterObject } from './RFTransmitterObject';

@SerializableObject()
export class BLEObject extends RFTransmitterObject {
    @SerializableMember({
        serializer: (buffer: Buffer) => {
            return buffer.toString('hex');
        },
        deserializer: (bufferString: string) => {
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
