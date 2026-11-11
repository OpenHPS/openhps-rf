import { expect } from 'chai';
import 'mocha';
import { ModelBuilder, DataFrame, DataObject, CallbackSinkNode, LengthUnit, RelativeDistance } from '@openhps/core';
import { RelativeRSSIProcessing, RelativeRSSI, RFTransmitterObject } from '../../src';

describe('node relative rssi processing', () => {
    it('should convert relative rssi to relative distance', (done) => {
        ModelBuilder.create()
            .from()
            .via(
                new RelativeRSSIProcessing({
                    environmentFactor: 1,
                }),
            )
            .to(
                new CallbackSinkNode((frame) => {
                    expect(frame.source.relativePositions.length).to.equal(3);
                    done();
                }),
            )
            .build()
            .then((model) => {
                model.on('error', done);
                const object = new DataObject();
                object.addRelativePosition(new RelativeRSSI('BEACON_1', -20));
                object.addRelativePosition(new RelativeRSSI('BEACON_2', -10));
                const beacon1 = new RFTransmitterObject('BEACON_1');
                beacon1.calibratedRSSI = -20;
                const frame = new DataFrame(object);
                frame.addObject(beacon1);
                return model.push(frame);
            })
            .catch(done);
    });

    it('should convert relative rssi to relative distance in centimeters by default', (done) => {
        ModelBuilder.create()
            .from()
            .via(
                new RelativeRSSIProcessing({
                    environmentFactor: 2,
                }),
            )
            .to(
                new CallbackSinkNode((frame) => {
                    const distance = frame.source.relativePositions.find(
                        (position) => position instanceof RelativeDistance,
                    ) as RelativeDistance;
                    expect(distance.distance).to.be.closeTo(100, 1e-9);
                    expect(distance.unit).to.equal(LengthUnit.CENTIMETER);
                    done();
                }),
            )
            .build()
            .then((model) => {
                model.on('error', done);
                const object = new DataObject();
                const beacon = new RFTransmitterObject('BEACON_1');
                beacon.calibratedRSSI = -59;
                object.addRelativePosition(new RelativeRSSI(beacon, -59));
                const frame = new DataFrame(object);
                frame.addObject(beacon);
                return model.push(frame);
            })
            .catch(done);
    });

    it('should convert relative rssi to relative distance in meters without an RF transmitter', (done) => {
        ModelBuilder.create()
            .from()
            .via(
                new RelativeRSSIProcessing({
                    environmentFactor: 2,
                    defaultCalibratedRSSI: -59,
                    distanceUnit: LengthUnit.METER,
                }),
            )
            .to(
                new CallbackSinkNode((frame) => {
                    const distance = frame.source.relativePositions.find(
                        (position) => position instanceof RelativeDistance,
                    ) as RelativeDistance;
                    expect(distance.distance).to.be.closeTo(10, 1e-9);
                    expect(distance.unit).to.equal(LengthUnit.METER);
                    done();
                }),
            )
            .build()
            .then((model) => {
                model.on('error', done);
                const object = new DataObject();
                const beacon = new DataObject('BEACON_1');
                object.addRelativePosition(new RelativeRSSI(beacon, -79));
                const frame = new DataFrame(object);
                frame.addObject(beacon);
                return model.push(frame);
            })
            .catch(done);
    });
});
