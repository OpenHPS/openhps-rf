import { SerializableArrayMember, SerializableMember, SerializableObject } from '@openhps/core';
import { BLEUUID } from './BLEUUID';
import { RFTransmitterObject } from './RFTransmitterObject';

@SerializableObject()
export class BLEObject extends RFTransmitterObject {
    @SerializableMember()
    manufacturerId?: string;

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
