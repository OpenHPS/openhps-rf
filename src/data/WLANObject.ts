import { RFTransmitterObject } from './RFTransmitterObject';
import { SerializableObject, SerializableMember } from '@openhps/core';

@SerializableObject()
export class WLANObject extends RFTransmitterObject {
    /**
     * WLAN Channel
     */
    @SerializableMember()
    public channel: number;
    @SerializableMember()
    public capabilities: string;
}
