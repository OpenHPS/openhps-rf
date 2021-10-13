import { RFObject } from './RFObject';
import { SerializableObject, SerializableMember, DataObject } from '@openhps/core';

@SerializableObject()
export class RFReceiverObject extends DataObject implements RFObject {
    /**
     * RF sensitivity
     */
    @SerializableMember()
    public rxSensitivity: number;
}
