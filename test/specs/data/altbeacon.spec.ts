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

    describe('beacon id', () => {
        const beacon = new BLEAltBeacon();
        const payload = Uint8Array.from([0x02, 0x01, 0x06, 0x1b, 0xff, 0x4c, 0x00 ,0xbe, 0xac, 0xab, 0x81, 0x90, 0xd5, 0xd1, 0x1e, 0x49, 0x41, 0xac,
            0xc4, 0x42, 0xf3, 0x05, 0x10, 0xb4, 0x08, 0x27, 0x11, 0x32, 0x1f, 0xb5, 0x00]);
        beacon.parseAdvertisement(payload);

        it('should be valid', () => {
            expect(beacon.isValid()).to.be.true;
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

        it('should support setting major and minor', () => {
            beacon.major = 10002;
            beacon.minor = 10003;
            expect(beacon.major).to.equal(10002);
            expect(beacon.minor).to.equal(10003);
        });

        it('should support setting proximity uuid', () => {
            beacon.proximityUUID = BLEUUID.fromString("ba8190d5-d11e-4941-acc4-42f30510b401");
            expect(beacon.proximityUUID.toString()).to.equal('ba8190d5-d11e-4941-acc4-42f30510b401');
            expect(beacon.major).to.equal(10002);
            expect(beacon.minor).to.equal(10003);
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

        it('should support an empty builder', (done) => {
            BLEAltBeaconBuilder.create().build().then(() => done()).catch(done);
        });

        it('should be valid', () => {
            expect(beacon.isValid()).to.be.true;
        });

        it('should extract the calibrated rssi', () => {
            expect(beacon.calibratedRSSI).to.equal(-56);
        });
    });
});
