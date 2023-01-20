import { SerializableMember, SerializableObject } from "@openhps/core";
import { BLEUUID } from "./BLEUUID";

@SerializableObject()
export class BLEService {
    @SerializableMember()
    uuid: BLEUUID;

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
    data: Buffer;

    constructor(uuid?: BLEUUID, data?: Buffer) {
        this.uuid = uuid;
        this.data = data;
    }
}
