import { RFObject } from './RFObject';
import { SerializableObject, SerializableMember, DataObject, LengthUnit } from '@openhps/core';

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
     * @returns {number} Calibrated RSSI
     */
    @SerializableMember()
    get calibratedRSSI(): number {
        return this._calibratedRSSI ?? this.txPower;
    }

    /**
     * Set the calibrated rssi at 1 meter
     * @param {number} calibratedRSSI Calibrated RSSI > 0
     */
    set calibratedRSSI(calibratedRSSI: number) {
        if (calibratedRSSI < 0) {
            this._calibratedRSSI = calibratedRSSI;
        }
    }

    /**
     * Get the calibrated RSSI at a specific distance
     * @param {number} distance Distance
     * @param {LengthUnit} [unit] Length Unit
     * @returns {number} RSSI at distance
     */
    getCalibratedRSSI(distance: number, unit: LengthUnit = LengthUnit.METER): number {
        const distanceInMeter = unit.convert(distance, LengthUnit.METER);
        return Math.ceil(this.calibratedRSSI - (1 - distanceInMeter) * -41);
    }

    /**
     * Set the calibrated RSSI at a specific distance
     * @param {number} rssi Received signal strength indicator
     * @param {number} distance Distance
     * @param {LengthUnit} [unit] Length Unit
     * @returns {RFTransmitterObject} This instance
     */
    setCalibratedRSSI(rssi: number, distance: number, unit: LengthUnit = LengthUnit.METER): this {
        const distanceInMeter = unit.convert(distance, LengthUnit.METER);
        this.calibratedRSSI = Math.ceil(rssi + (1 - distanceInMeter) * -41);
        return this;
    }

    /**
     * Set the environment factor of the beacon.
     * Nodes such as [[RelativeRSSIProcessing]] can override this.
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
