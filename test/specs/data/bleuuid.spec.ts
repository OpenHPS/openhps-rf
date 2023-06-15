import { expect } from 'chai';
import 'mocha';
import {
    BLEUUID
} from '../../../src';

describe('BLEUUID', () => {
    describe('fromBuffer()', () => {
        it('should load from a buffer', () => {
            const buffer = Buffer.from([
                0xf8, 0xff
            ]);
            const uuid = BLEUUID.fromBuffer(buffer);
            expect(uuid.toBuffer()).to.equal(buffer);
        });
    });

    describe('toString()', () => {
        it('should load from a buffer and convert to string', () => {
            const buffer = Buffer.from([
                0xf8, 0xff
            ]);
            const uuid = BLEUUID.fromBuffer(buffer);
            expect(uuid.toString()).to.equal('0000f8ff-0000-1000-8000-00805f9b34fb');
        });
    });

    describe('fromString()', () => {
        it('should load from a string and convert to buffer', () => {
            const buffer = Buffer.from([
                0xf8, 0xff
            ]);
            const uuidStr = '0000f8ff-0000-1000-8000-00805f9b34fb';
            const uuid = BLEUUID.fromString(uuidStr);
            expect(uuid.toString()).to.eql(uuidStr);
            console.log(buffer, uuid.toBuffer())
            expect(uuid.toBuffer()).to.eql(buffer);
        });
    });
});
