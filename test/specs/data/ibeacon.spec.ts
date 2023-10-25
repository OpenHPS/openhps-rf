import { expect } from 'chai';
import 'mocha';
import {
    BLEiBeacon, BLEiBeaconBuilder
} from '../../../src';

describe('BLEiBeacon', () => {
    describe('from manufacturer data', () => {
        const beacon = new BLEiBeacon();
        const payload = Uint8Array.from([0x02, 0x01, 0x06, 0x1a, 0xff, 0x4c, 0x00 ,0x02, 0x15, 0xab, 0x81, 0x90, 0xd5, 0xd1, 0x1e, 0x49, 0x41, 0xac,
            0xc4, 0x42, 0xf3, 0x05, 0x10, 0xb4, 0x08, 0x27, 0x11, 0x32, 0x1f, 0xb5]);
        beacon.parseAdvertisement(payload);

        it('should support cloning', () => {
            beacon.clone();
        });

        it('should have 0x004c as the manufacturer id', () => {
            expect(beacon.manufacturerData.get(0x004c)).to.not.be.undefined;
        });

        it('should extract the major', () => {
            expect(beacon.major).to.equal(10001);
        });

        it('should extract the minor', () => {
            expect(beacon.minor).to.equal(12831);
        });

        it('should extract the uuid', () => {
            expect(beacon.proximityUUID.toString()).to.equal("ab8190d5-d11e-4941-acc4-42f30510b408");
        });

        it('should extract the calibrated rssi', () => {
            expect(beacon.calibratedRSSI).to.equal(-75);
        });

        it('should support an empty builder', (done) => {
            BLEiBeaconBuilder.create().build().then(() => done()).catch(done);
        });
    });
});
