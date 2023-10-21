import { LengthUnit } from '@openhps/core';
import { expect } from 'chai';
import 'mocha';
import {
    BLEEddystoneTLM,
    BLEEddystoneTLMBuilder,
    BLEEddystoneUID,
    BLEEddystoneURL,
    BLEObject,
    MACAddress,
} from '../../../src';
import { concatBuffer } from '../../../src/utils/BufferUtils';

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
            expect(beacon.getCalibratedRSSI(0, LengthUnit.METER)).to.eql(-8);
        });

        it('should have an url', () => {
            expect(beacon.url).to.eql("https://goo.gl/a0mnsS");
        });

        it('should parse even with padding', () => {
            const newPayload = concatBuffer(
                payload,
                new Uint8Array([0, 0, 0])
            );
            beacon.parseAdvertisement(newPayload);
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
            expect(beacon.getCalibratedRSSI(0, LengthUnit.METER)).to.eql(-8);
        });

        it('should have a namespace id', () => {
            expect(beacon.namespaceId).to.not.be.undefined;
        });

        it('should have an instance id', () => {
            expect(beacon.instanceId).to.not.be.undefined;
        });
    });
});


describe('BLEEddystoneTLM', () => {
    describe('simple', () => {
        describe('from advertisement data', () => {
            const beacon = new BLEEddystoneTLM();
            const payload = Uint8Array.from([
                0x03,  // Length of Service List
                0x03,  // Param: Service List
                0xAA, 0xFE,  // Eddystone ID
                0x11,  // Length of Service Data
                0x16,  // Service Data
                0xAA, 0xFE, // Eddystone ID
                0x20,  // Frame type: TLM
                0x00, // Version
                0x0c, 0x80, // Voltage
                0x0f, 0x00, // Temperature
                0x00, 0x00, 0x00, 0x0a, // Adv count
                0x00, 0x00, 0x00, 0x14, // Adv time
            ]);
            beacon.parseAdvertisement(payload);
    
            it('should be valid', () => {
                expect(beacon.isValid()).to.be.true;
            });
    
            it('should have 0x20 as the frame', () => {
                expect(beacon.frame).to.eql(0x20);
            });
    
            it('should have 0x00 as the version', () => {
                expect(beacon.version).to.eql(0x00);
            });
    
            it('should have 15 deg C as the temperature', () => {
                expect(beacon.temperature.value).to.eql(15);
            });
    
            it('should have 2 sec as the uptime', () => {
                expect(beacon.uptime.valueOf()).to.eql(2);
            });
    
            it('should have adv count of 10', () => {
                expect(beacon.advertiseCount).to.eql(10);
            });
    
            it('should have 3200mV', () => {
                expect(beacon.voltage).to.eql(3200);
            });

            it('should be cloneable', () => {
                const object = new BLEObject(MACAddress.fromString("00:11:22:33:44"));
                object.parseAdvertisement(payload);
                const clone = object.clone(BLEEddystoneTLM);
                console.log(clone.uid, clone.computeUID())
            });
        });
    });
    describe('advanced', () => {
        describe('from advertisement data', () => {
            const beacon = new BLEEddystoneTLM();
            const payload = Uint8Array.from([
                0x03,  // Length of Service List
                0x03,  // Param: Service List
                0xAA, 0xFE,  // Eddystone ID
                0x11,  // Length of Service Data
                0x16,  // Service Data
                0xAA, 0xFE, // Eddystone ID
                0x20,  // Frame type: TLM
                0x00, // Version
                0x0c, 0x8f, // Voltage
                0x17, 0x80, // Temperature
                0x00, 0x00, 0x00, 0x0a, // Adv count
                0x00, 0x00, 0x00, 0x14, // Adv time
            ]);
            beacon.parseAdvertisement(payload);
    
            it('should be valid', () => {
                expect(beacon.isValid()).to.be.true;
            });
    
            it('should have 0x20 as the frame', () => {
                expect(beacon.frame).to.eql(0x20);
            });
    
            it('should have 0x00 as the version', () => {
                expect(beacon.version).to.eql(0x00);
            });
    
            it('should have 23.5 deg C as the temperature', () => {
                expect(beacon.temperature.value).to.eql(23.5);
            });
    
            it('should have 2 sec as the uptime', () => {
                expect(beacon.uptime.valueOf()).to.eql(2);
            });
    
            it('should have adv count of 10', () => {
                expect(beacon.advertiseCount).to.eql(10);
            });
    
            it('should have 3215mV', () => {
                expect(beacon.voltage).to.eql(3215);
            });
        });
    });
    describe('builder', () => {
        let beacon: BLEEddystoneTLM;

        before((done) => {
            BLEEddystoneTLMBuilder.create()
                .advertiseCount(1000)
                .calibratedRSSI(-36)
                .voltage(3784)
                .uptime(1956)
                .temperature(255.19)
                .build().then(b => {
                    beacon = b;
                    done();
                }).catch(done);
        });

        it('should be valid', () => {
            expect(beacon.isValid()).to.be.true;
        });

        it('should have 0x20 as the frame', () => {
            expect(beacon.frame).to.eql(0x20);
        });

        it('should have 0x00 as the version', () => {
            expect(beacon.version).to.eql(0x00);
        });

        it('should have 255.19 deg C as the temperature', () => {
            expect(beacon.temperature.value).to.eql(255.19);
        });

        it('should have 1956 sec as the uptime', () => {
            expect(beacon.uptime.valueOf()).to.eql(1956);
        });

        it('should have adv count of 10', () => {
            expect(beacon.advertiseCount).to.eql(1000);
        });

        it('should have 3784mV', () => {
            expect(beacon.voltage).to.eql(3784);
        });
    });
});
