import { SerializableObject } from '@openhps/core';
import { BLEUUID } from './BLEUUID';
import { BLEObject } from './BLEObject';

@SerializableObject()
export class BLEBeaconObject extends BLEObject {
    protected validate(): void {
        if (
            !(
                this.manufacturerData.length === 30 &&
                this.manufacturerData
                    .subarray(0, 9)
                    .equals(Buffer.from([0x02, 0x01, 0x06, 0x1a, 0xff, 0x4c, 0x00, 0x02, 0x15]))
            )
        ) {
            throw new Error(`Manufacturer data is not an iBeacon!`);
        }
    }

    get major(): number {
        return this.manufacturerData.readUint16BE(25);
    }

    get minor(): number {
        return this.manufacturerData.readUint16BE(27);
    }

    get uuid(): BLEUUID {
        return BLEUUID.fromBuffer(this.manufacturerData.subarray(9, 25).reverse());
    }
}
