import { expect } from 'chai';
import 'mocha';
import { DataSerializer } from '@openhps/core';
import { RelativeRSSI } from '../../src';

describe('position', () => {
    describe('relative rssi', () => {
        it('should be serializable', () => {
            const position = new RelativeRSSI("abc", -110);
            const serialized = DataSerializer.serialize(position);
            const deserialized: RelativeRSSI = DataSerializer.deserialize(serialized);
            expect(deserialized.rssi).to.equal(-110);
        });
    });
});
