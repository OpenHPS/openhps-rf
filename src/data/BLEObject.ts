import { SerializableMember, SerializableObject } from '@openhps/core';
import { RFTransmitterObject } from './RFTransmitterObject';

@SerializableObject()
export class BLEObject extends RFTransmitterObject {
    @SerializableMember()
    manufacturerId: string;

    @SerializableMember()
    mtu: number;
}
