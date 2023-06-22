import { expect } from 'chai';
import 'mocha';
import {
    ModelBuilder,
    DataFrame,
    DataObject,
    CallbackSinkNode,
} from '@openhps/core';
import {
    RelativeRSSI,
    BLEBeaconClassifierNode,
    BLEAltBeacon,
    BLEEddystoneUID,
    BLEEddystoneURL,
    BLEiBeacon,
    BLEObject
} from '../../src';

describe('BLEBeaconClassifierNode', () => {
    it('should use the types list as priority', (done) => {
        ModelBuilder.create()
            .from()
            .via(new BLEBeaconClassifierNode({
                types: [
                    BLEAltBeacon,
                    BLEEddystoneURL,
                ]
            }))
            .to(new CallbackSinkNode(frame => {
                expect(frame.source).to.be.instanceOf(BLEAltBeacon);
                done();
            })).build().then(model => {
                model.on('error', done);
                const beacon = new BLEObject();
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
                const frame = new DataFrame(beacon);
                return model.push(frame);
            }).catch(done);
    });

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

    it('should detect iBeacon from manufacturer data', (done) => {
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
                const payload = Uint8Array.from([0x02, 0x15, 0xab, 0x81, 0x90, 0xd5, 0xd1, 0x1e, 0x49, 0x41, 0xac,
                    0xc4, 0x42, 0xf3, 0x05, 0x10, 0xb4, 0x08, 0x27, 0x11, 0x32, 0x1f, 0xb5]);
                beacon.parseManufacturerData(0x4c00, payload);
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

    it('should fix relative positions', (done) => {
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
                expect(frame.source).to.not.be.undefined;
                expect(frame.getObjects().length).to.eql(2);
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
                const frame = new DataFrame();
                frame.addObject(beacon);
                frame.source = new DataObject("source");
                frame.source.addRelativePosition(new RelativeRSSI(beacon, -56));
                return model.push(frame);
            }).catch(done);
    });
});
