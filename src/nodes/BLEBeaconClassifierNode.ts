import { Constructor, DataFrame, ObjectProcessingNode, ObjectProcessingNodeOptions } from '@openhps/core';
import { BLEBeaconObject, BLEObject } from '../data';

export class BLEBeaconClassifierNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {
    protected options: BLEBeaconClassifierOptions;

    constructor(options: BLEBeaconClassifierOptions) {
        super(options);
        this.options.objectFilter =
            this.options.objectFilter ??
            ((object) => object instanceof BLEObject && object.rawAdvertisement !== undefined);
    }

    processObject(object: BLEObject, frame: DataFrame): Promise<BLEObject> {
        return new Promise((resolve) => {
            let output = object;
            for (let i = 0; i < this.options.types.length; i++) {
                const BeaconType = this.options.types[i];
                const beaconObject = object.clone(BeaconType);
                // Parse advertisement if raw available
                if (beaconObject.rawAdvertisement) {
                    beaconObject.parseAdvertisement(beaconObject.rawAdvertisement);
                } else {
                    // Parse manufacturer data
                    if (beaconObject.manufacturerData && beaconObject.manufacturerData.size > 0) {
                        beaconObject.manufacturerData.forEach((data, manufacturer) => {
                            beaconObject.parseManufacturerData(manufacturer, data);
                        });
                    }
                    // Parse service data
                    if (beaconObject.services && beaconObject.services.length > 0) {
                        beaconObject.services.forEach((service) => {
                            beaconObject.parseServiceData(service.uuid, service.data);
                        });
                    }
                }
                if (beaconObject.isValid()) {
                    // Accept beacon and replace
                    const prevUID = beaconObject.uid;
                    if (this.options.resetUID) {
                        beaconObject.uid = beaconObject.computeUID();
                    }
                    // Rename relative uids
                    if (frame.source && beaconObject.uid !== prevUID) {
                        const positions = frame.source.getRelativePositions(prevUID);
                        positions.forEach((relPos) => {
                            relPos.referenceObjectUID = beaconObject.uid;
                            frame.source.addRelativePosition(relPos);
                        });
                        frame.source.removeRelativePositions(prevUID);
                    }

                    output = beaconObject;
                    break;
                }
            }
            resolve(output);
        });
    }
}

export interface BLEBeaconClassifierOptions extends ObjectProcessingNodeOptions {
    types: Array<Constructor<BLEBeaconObject>>;
    /**
     * Reset UIDs of detected beacons to the identifying information of the beacon.
     * BLE beacons can change MAC addresses, which could result in data loss when
     * not identifying beacons using the correct information.
     * @default false
     */
    resetUID?: boolean;
}
