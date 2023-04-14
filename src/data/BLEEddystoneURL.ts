import { SerializableMember, SerializableObject } from '@openhps/core';
import { BLEEddystone } from './BLEEddystone';

@SerializableObject()
export class BLEEddystoneURL extends BLEEddystone {
    static readonly PREFIXES = ['http://www.', 'https://www.', 'http://', 'https://'];
    static readonly SUFFIXES = [
        '.com/',
        '.org/',
        '.edu/',
        '.net/',
        '.info/',
        '.biz/',
        '.gov/',
        '.com',
        '.org',
        '.edu',
        '.net',
        '.info',
        '.biz',
        '.gov',
    ];

    @SerializableMember()
    url: string;

    isValid(): boolean {
        return super.isValid() && this.frame === 0x10 && this.url !== undefined;
    }

    parseAdvertisement(payload: Uint8Array): this {
        super.parseAdvertisement(payload);
        const service = this.service;
        if (service) {
            const urlData = new Uint8Array(service.data.slice(2, service.data.byteLength));
            const view = new DataView(urlData.buffer, 0);

            const prefix = view.getUint8(0);
            if (prefix > BLEEddystoneURL.PREFIXES.length) {
                return this;
            }

            this.url = BLEEddystoneURL.PREFIXES[prefix];
            for (let i = 1; i < view.byteLength; i++) {
                this.url +=
                    view.getUint8(i) < BLEEddystoneURL.SUFFIXES.length
                        ? BLEEddystoneURL.SUFFIXES[view.getUint8(i)]
                        : String.fromCharCode(view.getUint8(i));
            }

            if (this.uid === undefined) {
                this.uid = this.url;
            }
        }
        return this;
    }
}
