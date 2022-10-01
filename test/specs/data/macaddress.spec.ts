import { expect } from 'chai';
import 'mocha';
import {
    MACAddress
} from '../../../src';

describe('MACAddress', () => {
    describe('fromBuffer()', () => {
        it('should load from a buffer', () => {
            const buffer = Buffer.from([
                0x00, 0x11, 0x22, 0x33, 0x44, 0x55
            ]);
            const uuid = MACAddress.fromBuffer(buffer);
            expect(uuid.toBuffer()).to.equal(buffer);
        });
    });

    describe('toString()', () => {
        it('should load from a buffer and convert to string', () => {
            const buffer = Buffer.from([
                0x00, 0x11, 0x22, 0x33, 0x44, 0x55
            ]);
            const uuid = MACAddress.fromBuffer(buffer);
            expect(uuid.toString()).to.equal('00:11:22:33:44:55');
        });
    });

    describe('fromString()', () => {
        it('should load from a string and convert to buffer', () => {
            const buffer = Buffer.from([
                0x00, 0x11, 0x22, 0x33, 0x44, 0x55
            ]);
            const uuid = MACAddress.fromString('00:11:22:33:44:55');
            expect(uuid.toBuffer()).to.eql(buffer);
        });
    });
});
