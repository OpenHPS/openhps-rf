import { expect } from 'chai';
import 'mocha';
import {
    BLEAltBeacon, BLEAltBeaconBuilder, BLEUUID,
} from '../../../src';

describe('BLEAltBeacon', () => {
    describe('from manufacturer data', () => {
        const beacon = new BLEAltBeacon();
        const payload = new Uint8Array([
            2, 1, 6, 27, 255, 76, 0, 190, 172, 253,
            165, 6, 147, 164, 226, 79, 177, 175, 207,
            198, 235, 7, 100, 120, 37, 139, 29, 11,
            60, 200, 0, 22, 22, 170, 254, 16, 241,
            3, 116, 105, 110, 121, 117, 114, 108,
            0, 53, 55, 109, 98, 98, 120, 50, 119,
            0, 0, 0, 0, 0, 0, 0, 0 
        ]);
        beacon.parseAdvertisement(payload);

        it('should support cloning', () => {
            beacon.clone();
        });

        it('should be valid', () => {
            expect(beacon.isValid()).to.be.true;
        });

        it('should extract the calibrated rssi', () => {
            expect(beacon.calibratedRSSI).to.equal(-56);
        });
    });

    describe('builder', () => {
        let beacon: BLEAltBeacon;

        before((done) => {
            BLEAltBeaconBuilder.create()
                .proximityUUID(BLEUUID.fromString("77f340db-ac0d-20e8-aa3a-f656a29f236c"))
                .major(51243)
                .minor(14124)
                .calibratedRSSI(-56)
                .build().then(b => {
                    beacon = b;
                    done();
                }).catch(done);
        });

        it('should be valid', () => {
            expect(beacon.isValid()).to.be.true;
        });

        it('should extract the calibrated rssi', () => {
            expect(beacon.calibratedRSSI).to.equal(-56);
        });
    });
});
