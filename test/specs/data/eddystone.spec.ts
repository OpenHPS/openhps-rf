import { expect } from 'chai';
import 'mocha';
import {
    BLEEddystoneUID,
    BLEEddystoneURL, BLEUUID
} from '../../../src';

describe('BLEEddystoneURL', () => {
    describe('from advertisement data', () => {
        const beacon = new BLEEddystoneURL();
        const payload = Uint8Array.from([
            0x03,  // Length of Service List
            0x03,  // Param: Service List
            0xAA, 0xFE,  // Eddystone ID
            0x13,  // Length of Service Data
            0x16,  // Service Data
            0xAA, 0xFE, // Eddystone ID
            0x10,  // Frame type: URL
            0xF8, // Power
            0x03, // https://
            'g'.charCodeAt(0),
            'o'.charCodeAt(0),
            'o'.charCodeAt(0),
            '.'.charCodeAt(0),
            'g'.charCodeAt(0),
            'l'.charCodeAt(0),
            '/'.charCodeAt(0),
            'a'.charCodeAt(0),
            '0'.charCodeAt(0),
            'm'.charCodeAt(0),
            'n'.charCodeAt(0),
            's'.charCodeAt(0),
            'S'.charCodeAt(0)
        ]);
        beacon.parseAdvertisement(payload);

        it('should be valid', () => {
            expect(beacon.isValid()).to.be.true;
        });

        it('should have 0x10 as the frame', () => {
            expect(beacon.frame).to.eql(0x10);
        });

        it('should have a tx power', () => {
            expect(beacon.txPower).to.eql(-8);
        });

        it('should have an url', () => {
            expect(beacon.url).to.eql("https://goo.gl/a0mnsS");
        });
    });
});


describe('BLEEddystoneUID', () => {
    describe('from advertisement data', () => {
        const beacon = new BLEEddystoneUID();
        const payload = Uint8Array.from([
            0x03,  // Length of Service List
            0x03,  // Param: Service List
            0xAA, 0xFE,  // Eddystone ID
            0x13,  // Length of Service Data
            0x16,  // Service Data
            0xAA, 0xFE, // Eddystone ID
            0x00,  // Frame type: UID
            0xF8, // Power
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        ]);
        beacon.parseAdvertisement(payload);

        it('should be valid', () => {
            expect(beacon.isValid()).to.be.true;
        });

        it('should have 0x00 as the frame', () => {
            expect(beacon.frame).to.eql(0x00);
        });

        it('should have a tx power', () => {
            expect(beacon.txPower).to.eql(-8);
        });

        it('should have a namespace id', () => {
            expect(beacon.namespaceId).to.not.be.undefined;
        });

        it('should have an instance id', () => {
            expect(beacon.instanceId).to.not.be.undefined;
        });
    });
});
