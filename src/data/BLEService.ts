import { SerializableMember, SerializableObject } from '@openhps/core';
import { BLEUUID } from './BLEUUID';

/**
 * BLE Service
 */
@SerializableObject()
export class BLEService {
    @SerializableMember()
    uuid: BLEUUID;

    @SerializableMember()
    data: Uint8Array;

    constructor(uuid?: BLEUUID, data?: Uint8Array) {
        this.uuid = uuid;
        this.data = data;
    }
}
