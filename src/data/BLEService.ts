import { SerializableMember, SerializableObject } from '@openhps/core';
import { fromHexString, toHexString } from '../utils/BufferUtils';
import { BLEUUID } from './BLEUUID';

@SerializableObject()
export class BLEService {
    @SerializableMember()
    uuid: BLEUUID;

    @SerializableMember({
        serializer: toHexString,
        deserializer: fromHexString,
    })
    data: Uint8Array;

    constructor(uuid?: BLEUUID, data?: Uint8Array) {
        this.uuid = uuid;
        this.data = data;
    }
}
