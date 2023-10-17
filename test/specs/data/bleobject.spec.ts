import { expect } from 'chai';
import 'mocha';
import {
    BLEiBeacon,
    BLEObject, MACAddress
} from '../../../src';

describe('BLEObject', () => {
    const payload = Uint8Array.from([0x02, 0x01, 0x06, 0x1a, 0xff, 0x4c, 0x00 ,0x02, 0x15, 0xab, 0x81, 0x90, 0xd5, 0xd1, 0x1e, 0x49, 0x41, 0xac,
        0xc4, 0x42, 0xf3, 0x05, 0x10, 0xb4, 0x08, 0x27, 0x11, 0x32, 0x1f, 0xb5]);

    const object = new BLEObject();
    object.parseAdvertisement(payload);
    object.address = MACAddress.fromString("00:11:22:33:44");

    describe('clone()', () => {
        it('should copy the address', () => {
            const copy = object.clone(BLEiBeacon);
            //console.log(copy);
        });
    });
});
