import { RFObject } from './RFObject';
import { SerializableObject, SerializableMember, DataObject } from '@openhps/core';

@SerializableObject()
export class RFTransmitterObject extends DataObject implements RFObject {
    /**
     * RF transmission power
     */
    @SerializableMember()
    txPower: number;
    private _calibratedRSSI: number;
    private _environmentFactor: number;
    /**
     * RF transmission frequency
     */
    @SerializableMember()
    frequency: number;

    constructor(uid?: string, calibratedRSSI?: number, txPower?: number) {
        super(uid);
        this.calibratedRSSI = calibratedRSSI;
        this.txPower = txPower;
    }

    /**
     * Get the calibrated rssi at 1 meter
     *
     * @returns {number} Calibrated RSSI
     */
    @SerializableMember()
    get calibratedRSSI(): number {
        return this._calibratedRSSI ?? this.txPower;
    }

    /**
     * Set the calibrated rssi at 1 meter
     *
     * @param {number} calibratedRSSI Calibrated RSSI > 0
     */
    set calibratedRSSI(calibratedRSSI: number) {
        if (calibratedRSSI > 0) {
            throw new RangeError('Calibrated RSSI should be a number below 0');
        }
        this._calibratedRSSI = calibratedRSSI;
    }

    /**
     * Set the environment factor of the beacon.
     * Nodes such as [[RelativeRSSIProcessing]] can override this.
     *
     * @returns {number} environment factor
     */
    @SerializableMember()
    get environmentFactor(): number {
        return this._environmentFactor;
    }

    set environmentFactor(environmentFactor: number) {
        this._environmentFactor = environmentFactor;
    }
}
