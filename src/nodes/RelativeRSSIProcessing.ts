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
 */
export class RelativeRSSIProcessing<InOut extends DataFrame> extends RelativePositionProcessing<InOut, RelativeRSSI> {
    protected options: RelativeRSSIOptions;

    constructor(options?: RelativeRSSIOptions) {
        super(RelativeRSSI, options);
        this.options.propagationModel = this.options.propagationModel || PropagationModel.LOG_DISTANCE;
    }

    public processRelativePositions(
        dataObject: DataObject,
        relativePositions: Map<RelativeRSSI, RFTransmitterObject>,
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

    protected convertToDistance(rel: RelativeRSSI, transmitter: RFTransmitterObject): RelativeDistance {
        const environmentFactor = this.options.environmentFactor || transmitter.environmentFactor;
        const calibratedRSSI = transmitter.calibratedRSSI || this.options.defaultCalibratedRSSI;
        switch (this.options.propagationModel) {
            case PropagationModel.LOG_DISTANCE:
                if (calibratedRSSI && rel.rssi && environmentFactor) {
                    const relDistance = new RelativeDistance(
                        transmitter,
                        Math.pow(10, (calibratedRSSI - rel.rssi) / (10 * environmentFactor)),
                    );
                    relDistance.timestamp = rel.timestamp;
                    relDistance.distanceUnit = LengthUnit.CENTIMETER;
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
     *
     * @default PropagationModel.LOG_DISTANCE
     */
    propagationModel?: PropagationModel;
    /**
     * Environment factor to override transmitter environment factor
     */
    environmentFactor?: number;
    /**
     * Default calibrated RSSI value at 1 meter distance
     *
     * @default undefined
     */
    defaultCalibratedRSSI?: number;
}

export enum PropagationModel {
    /**
     * Log distance path loss
     *
     * @see {@link https://en.wikipedia.org/wiki/Log-distance_path_loss_model}
     */
    LOG_DISTANCE,
}
