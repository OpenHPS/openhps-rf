import { LengthUnit, SerializableMember, SerializableObject } from '@openhps/core';
import { BLEEddystone } from './BLEEddystone';
import { BLEUUID } from './BLEUUID';
import { BLEBeaconBuilder } from './BLEBeaconObject';
import { BLEService } from './BLEService';
import { Md5 } from 'ts-md5';

@SerializableObject()
export class BLEEddystoneURL extends BLEEddystone {
    static readonly PREFIXES = ['http://www.', 'https://www.', 'http://', 'https://', 'urn:uuid:'];
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
        return this.address ? this.address.toString() : Md5.hashStr(this.url);
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
            this.uid = this.computeUID();
        }
        return this;
    }
}

/**
 * BLE Eddystone URL builder
 */
export class BLEEddystoneURLBuilder extends BLEBeaconBuilder<BLEEddystoneURL> {
    protected constructor() {
        super();
        this.beacon = new BLEEddystoneURL();
        this.beacon.frame = 0x10;
    }

    static create(): BLEEddystoneURLBuilder {
        return new BLEEddystoneURLBuilder();
    }

    static fromBeacon(beacon: BLEEddystoneURL): BLEEddystoneURLBuilder {
        const builder = new BLEEddystoneURLBuilder();
        builder.beacon = beacon;
        return builder;
    }

    url(url: string): this {
        this.beacon.url = url;
        return this;
    }

    calibratedRSSI(rssi: number): this {
        this.beacon.calibratedRSSI = rssi;
        return this;
    }
    protected getEncodedURL(): { url: DataView; length: number } {
        const view = new DataView(new ArrayBuffer(17), 0);
        let index = 0;
        let url_index = 0;
        const url = this.beacon.url;
        BLEEddystoneURL.PREFIXES.forEach((prefix) => {
            if (url.toLowerCase().startsWith(prefix)) {
                // Encode using this prefix
                view.setUint8(index, BLEEddystoneURL.PREFIXES.indexOf(prefix));
                url_index += prefix.length;
            }
        });
        index += 1;
        for (let i = url_index; i < url.length; i++) {
            if (index > 17) {
                break;
            }
            view.setUint8(index, url.charCodeAt(i));
            BLEEddystoneURL.SUFFIXES.forEach((suffix) => {
                if (url.slice(i).toLowerCase().startsWith(suffix)) {
                    view.setUint8(index, BLEEddystoneURL.SUFFIXES.indexOf(suffix));
                    i += suffix.length - 1;
                }
            });
            index++;
        }
        return { url: view, length: index };
    }

    build(): Promise<BLEEddystoneURL> {
        return new Promise((resolve) => {
            // Eddystone Service
            const { url, length } = this.getEncodedURL();
            const serviceData = new DataView(new ArrayBuffer(19 - (17 - length)), 0);
            serviceData.setUint8(0, 0x10); // Eddystone-URL frame
            serviceData.setInt8(1, this.beacon.getCalibratedRSSI(0, LengthUnit.METER));
            // Encoded URL
            for (let i = 0; i < length; i++) {
                serviceData.setUint8(2 + i, url.getUint8(i));
            }

            this.beacon.addService(new BLEService(BLEUUID.fromString('FEAA'), new Uint8Array(serviceData.buffer)));
            this.beacon.uid = this.beacon.computeUID();
            resolve(this.beacon);
        });
    }
}
