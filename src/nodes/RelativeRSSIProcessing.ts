import { RelativeRSSI, RFTransmitterObject } from '../data';
import {
    DataFrame,
    DataObject,
    RelativeDistance,
    RelativePositionProcessing,
    ObjectProcessingNodeOptions,
    LengthUnit,
} from '@openhps/core';

/**
 * Relative RSSI processing node to convert [[RelativeRSSI]] to [[RelativeDistance]] using
 * a distance propagation formula.
 *
 * The log-distance path loss model computes a distance in metres. The produced
 * [[RelativeDistance]] is expressed in [[RelativeRSSIOptions.distanceUnit]], which defaults to
 * centimetres for backwards compatibility.
 *
 * The reference object does not have to be an [[RFTransmitterObject]]; any [[DataObject]] that
 * is present in the frame works when the calibrated RSSI and environment factor are supplied
 * through the node options.
 */
export class RelativeRSSIProcessing<InOut extends DataFrame> extends RelativePositionProcessing<InOut, RelativeRSSI> {
    protected options: RelativeRSSIOptions;

    constructor(options?: RelativeRSSIOptions) {
        super(RelativeRSSI, options);
        this.options.propagationModel = this.options.propagationModel || PropagationModel.LOG_DISTANCE;
        this.options.distanceUnit = this.options.distanceUnit || LengthUnit.CENTIMETER;
    }

    public processRelativePositions(
        dataObject: DataObject,
        relativePositions: Map<RelativeRSSI, DataObject>,
    ): Promise<DataObject> {
        return new Promise((resolve) => {
            relativePositions.forEach((relativeObj, relValue) => {
                const distance = this.convertToDistance(relValue, relativeObj);
                if (distance) {
                    dataObject.addRelativePosition(distance);
                }
            });
            resolve(dataObject);
        });
    }

    /**
     * Convert a relative RSSI value to a relative distance.
     * @param {RelativeRSSI} rel Relative RSSI value
     * @param {DataObject} transmitter Reference object of the RSSI value
     * @returns {RelativeDistance} Relative distance, or undefined if the calibration is incomplete
     */
    protected convertToDistance(rel: RelativeRSSI, transmitter: DataObject): RelativeDistance {
        const rfTransmitter = transmitter as RFTransmitterObject;
        const environmentFactor = this.options.environmentFactor ?? rfTransmitter.environmentFactor;
        const calibratedRSSI = rfTransmitter.calibratedRSSI ?? this.options.defaultCalibratedRSSI;
        const distanceUnit = this.options.distanceUnit ?? LengthUnit.CENTIMETER;
        switch (this.options.propagationModel) {
            case PropagationModel.LOG_DISTANCE:
                if (calibratedRSSI !== undefined && rel.rssi !== undefined && environmentFactor > 0) {
                    // Log-distance path loss is defined in metres; convert to the requested unit.
                    const distanceInMeter = Math.pow(10, (calibratedRSSI - rel.rssi) / (10 * environmentFactor));
                    const relDistance = new RelativeDistance(
                        transmitter,
                        LengthUnit.METER.convert(distanceInMeter, distanceUnit),
                        distanceUnit,
                    );
                    relDistance.timestamp = rel.timestamp;
                    return relDistance;
                } else {
                    return undefined;
                }
        }
    }
}

export interface RelativeRSSIOptions extends ObjectProcessingNodeOptions {
    /**
     * RSSI distance propagation model
     * @default PropagationModel.LOG_DISTANCE
     */
    propagationModel?: PropagationModel;
    /**
     * Environment factor to override transmitter environment factor
     */
    environmentFactor?: number;
    /**
     * Default calibrated RSSI value at 1 meter distance
     * @default undefined
     */
    defaultCalibratedRSSI?: number;
    /**
     * Unit of the produced relative distance
     * @default LengthUnit.CENTIMETER
     */
    distanceUnit?: LengthUnit;
}

export enum PropagationModel {
    /**
     * Log distance path loss
     * @see {@link https://en.wikipedia.org/wiki/Log-distance_path_loss_model}
     */
    LOG_DISTANCE,
}
