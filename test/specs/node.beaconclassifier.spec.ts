import { expect } from 'chai';
import 'mocha';
import {
    ModelBuilder,
    DataFrame,
    DataObject,
    CallbackSinkNode,
} from '@openhps/core';
import {
    RelativeRSSIProcessing,
    RelativeRSSI,
    RFTransmitterObject,
    BLEBeaconClassifierNode,
    BLEAltBeacon,
    BLEEddystone,
    BLEEddystoneUID,
    BLEEddystoneURL,
    BLEiBeacon,
    BLEBeaconObject,
    BLEObject
} from '../../src';

describe('BLEBeaconClassifierNode', () => {
    it('should detect iBeacon', (done) => {
        ModelBuilder.create()
            .from()
            .via(new BLEBeaconClassifierNode({
                types: [
                    BLEEddystoneUID,
                    BLEEddystoneURL,
                    BLEiBeacon
                ]
            }))
            .to(new CallbackSinkNode(frame => {
                expect(frame.source).to.be.instanceOf(BLEiBeacon);
                done();
            })).build().then(model => {
                model.on('error', done);
                const beacon = new BLEObject();
                const payload = Uint8Array.from([0x02, 0x01, 0x06, 0x1a, 0xff, 0x4c, 0x00 ,0x02, 0x15, 0xab, 0x81, 0x90, 0xd5, 0xd1, 0x1e, 0x49, 0x41, 0xac,
                    0xc4, 0x42, 0xf3, 0x05, 0x10, 0xb4, 0x08, 0x27, 0x11, 0x32, 0x1f, 0xb5]);
                beacon.parseAdvertisement(payload);
                const frame = new DataFrame(beacon);
                return model.push(frame);
            }).catch(done);
    });

    it('should detect Eddystone URL', (done) => {
        ModelBuilder.create()
            .from()
            .via(new BLEBeaconClassifierNode({
                types: [
                    BLEEddystoneUID,
                    BLEEddystoneURL,
                    BLEiBeacon
                ]
            }))
            .to(new CallbackSinkNode(frame => {
                expect(frame.source).to.be.instanceOf(BLEEddystoneURL);
                done();
            })).build().then(model => {
                model.on('error', done);
                const beacon = new BLEObject();
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
                const frame = new DataFrame(beacon);
                return model.push(frame);
            }).catch(done);
    });
});
