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

    processObject(object: BLEObject): Promise<BLEObject> {
        return new Promise((resolve) => {
            let output = object;
            this.options.types.forEach((BeaconType) => {
                const beaconObject = object.clone(BeaconType);
                if (this.options.resetUID) {
                    beaconObject.setUID(undefined);
                }
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
                    output = beaconObject;
                    return;
                }
            });
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
