import { SerializableArrayMember, SerializableMember, SerializableObject } from '@openhps/core';
import { BLEUUID } from './BLEUUID';
import { MACAddress } from './MACAddress';
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

    /**
     * Current mac address
     */
    @SerializableMember()
    address: MACAddress;

    /**
     * A list of known mac address
     */
    @SerializableArrayMember(MACAddress)
    knownAddresses: MACAddress[] = [];

    @SerializableMember()
    mtu?: number;

    @SerializableMember()
    appearance?: number;

    /**
     * Service UUIDs
     */
    @SerializableArrayMember(BLEUUID)
    services?: BLEUUID[];

    constructor(address?: MACAddress) {
        super(address.toString());
        this.address = address;
        if (!this.knownAddresses.includes(address)) {
            this.knownAddresses.push(address);
        }
    }
}
