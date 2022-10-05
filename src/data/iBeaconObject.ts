import { SerializableObject } from '@openhps/core';
import { BLEUUID } from './BLEUUID';
import { BLEBeaconObject } from './BLEBeaconObject';

/**
 *
 * @see {@link https://wiki.aprbrother.com/en/iBeacon_Packet.html}
 */
@SerializableObject()
export class iBeaconObject extends BLEBeaconObject {
    static isValid(manufacturerData: Buffer): boolean {
        if (
            manufacturerData.length === 30 &&
            manufacturerData.subarray(0, 9).equals(Buffer.from([0x02, 0x01, 0x06, 0x1a, 0xff, 0x4c, 0x00, 0x02, 0x15]))
        ) {
            return true;
        }
        return false;
    }

    get major(): number {
        return this.manufacturerData.readUint16BE(25);
    }

    set major(val: number) {
        if (!this.manufacturerData) {
            this.manufacturerData = Buffer.alloc(30);
        }
        this.manufacturerData.writeUint16BE(val, 25);
    }

    get minor(): number {
        return this.manufacturerData.readUint16BE(27);
    }

    set minor(val: number) {
        if (!this.manufacturerData) {
            this.manufacturerData = Buffer.alloc(30);
        }
        this.manufacturerData.writeUint16BE(val, 27);
    }

    get uuid(): BLEUUID {
        return BLEUUID.fromBuffer(this.manufacturerData.subarray(9, 25).reverse());
    }

    set uuid(val: BLEUUID) {
        if (!this.manufacturerData) {
            this.manufacturerData = Buffer.alloc(30);
        }
        val.toBuffer().forEach((byte, idx) => {
            this.manufacturerData.writeUint8(byte, 9 + idx);
        });
    }

    get calibratedRSSI(): number {
        return this.manufacturerData.readInt8(29);
    }

    set calibratedRSSI(val: number) {
        if (!this.manufacturerData) {
            this.manufacturerData = Buffer.alloc(30);
        }
        this.manufacturerData.writeInt8(val, 29);
    }
}
