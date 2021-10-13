import { expect } from 'chai';
import 'mocha';
import {
    DataSerializer,
} from '@openhps/core';
import {
    RFTransmitterObject,
} from '../../../src';

describe('RFObject', () => {

    it('should serialize rf objects', (done) => {
        const dataObject = new RFTransmitterObject();
        dataObject.txPower = -10;
        const serialized = DataSerializer.serialize(dataObject);
        const deserialized = DataSerializer.deserialize<RFTransmitterObject>(serialized);
        expect(dataObject.uid).to.equal(deserialized.uid);
        expect(dataObject.displayName).to.equal(deserialized.displayName);
        expect(dataObject.txPower).to.equal(-10);
        done();
    });
    
});