import { SerializableMember, SerializableObject } from '@openhps/core';
import { BLEEddystone } from './BLEEddystone';
import { BLEUUID } from './BLEUUID';

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

    computeUID(): string {
        return this.address ? this.address.toString() : this.url;
    }

    parseServiceData(uuid: BLEUUID, serviceData: Uint8Array): this {
        super.parseServiceData(uuid, serviceData);
        if (uuid === undefined && serviceData === undefined) {
            return this;
        }

        if (!this.service) {
            return this;
        }

        if (this.frame !== 0x10) {
            return this; // Do not attempt to parse
        }

        const urlData = new Uint8Array(serviceData.slice(2, serviceData.byteLength));
        const view = new DataView(urlData.buffer, 0);

        if (view.buffer.byteLength === 0) {
            return this;
        }

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
        return this;
    }
}
