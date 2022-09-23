import { DataFrame, SerializableObject } from '@openhps/core';
import { RFTransmitterObject } from './RFTransmitterObject';
import { RelativeRSSI } from './position/RelativeRSSI';

@SerializableObject()
export class RFDataFrame extends DataFrame {
    addRelativeRSSI(object: RFTransmitterObject, rssi: number): boolean {
        if (!this.source) {
            return false;
        }
        this.source.addRelativePosition(new RelativeRSSI(object, rssi));
        this.addObject(object);
        return true;
    }
}
