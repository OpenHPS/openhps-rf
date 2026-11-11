import { DataObject, SerializableMember, SerializableObject, RelativePosition } from '@openhps/core';
import { PowerUnit } from '../units';

/**
 * @category Position
 */
@SerializableObject()
export class RelativeRSSI extends RelativePosition<number> {
    constructor(referenceObject?: DataObject | string, rssi?: number) {
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
