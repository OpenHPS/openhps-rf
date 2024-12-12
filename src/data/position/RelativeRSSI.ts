import { SerializableMember, SerializableObject, RelativePosition } from '@openhps/core';
import { RFTransmitterObject } from '../RFTransmitterObject';
import { PowerUnit } from '../units';

/**
 * @category Position
 */
@SerializableObject()
export class RelativeRSSI extends RelativePosition<number> {
    constructor(referenceObject?: RFTransmitterObject | string, rssi?: number) {
        super(referenceObject, rssi);
        this.unit = PowerUnit.dBm;
    }

    @SerializableMember()
    public get rssi(): number {
        return this.referenceValue;
    }

    public set rssi(rssi: number) {
        this.referenceValue = rssi;
    }
}
