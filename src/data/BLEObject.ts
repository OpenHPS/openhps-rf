import { SerializableArrayMember, SerializableMapMember, SerializableMember, SerializableObject } from '@openhps/core';
import { BLEService } from './BLEService';
import { BLEUUID } from './BLEUUID';
import { MACAddress } from './MACAddress';
import { RFTransmitterObject } from './RFTransmitterObject';

enum AdvertisementType {
    BLE_AD_TYPE_FLAG = 0x01,
    BLE_AD_TYPE_16SRV_PART = 0x02,
    BLE_AD_TYPE_16SRV_CMPL = 0x03,
    BLE_AD_TYPE_32SRV_PART = 0x04,
    BLE_AD_TYPE_32SRV_CMPL = 0x05,
    BLE_AD_TYPE_128SRV_PART = 0x06,
    BLE_AD_TYPE_128SRV_CMPL = 0x07,
    BLE_AD_TYPE_NAME_SHORT = 0x08,
    BLE_AD_TYPE_NAME_CMPL = 0x09,
    BLE_AD_TYPE_TX_PWR = 0x0a,
    BLE_AD_TYPE_DEV_CLASS = 0x0d,
    BLE_AD_TYPE_SM_TK = 0x10,
    BLE_AD_TYPE_SM_OOB_FLAG = 0x11,
    BLE_AD_TYPE_INT_RANGE = 0x12,
    BLE_AD_TYPE_SOL_SRV_UUID = 0x14,
    BLE_AD_TYPE_128SOL_SRV_UUID = 0x15,
    BLE_AD_TYPE_SERVICE_DATA = 0x16,
    BLE_AD_TYPE_PUBLIC_TARGET = 0x17,
    BLE_AD_TYPE_RANDOM_TARGET = 0x18,
    BLE_AD_TYPE_APPEARANCE = 0x19,
    BLE_AD_TYPE_ADV_INT = 0x1a,
    BLE_AD_TYPE_LE_DEV_ADDR = 0x1b,
    BLE_AD_TYPE_LE_ROLE = 0x1c,
    BLE_AD_TYPE_SPAIR_C256 = 0x1d,
    BLE_AD_TYPE_SPAIR_R256 = 0x1e,
    BLE_AD_TYPE_32SOL_SRV_UUID = 0x1f,
    BLE_AD_TYPE_32SERVICE_DATA = 0x20,
    BLE_AD_TYPE_128SERVICE_DATA = 0x21,
    BLE_AD_TYPE_LE_SECURE_CONFIRM = 0x22,
    BLE_AD_TYPE_LE_SECURE_RANDOM = 0x23,
    BLE_AD_TYPE_URI = 0x24,
    BLE_AD_TYPE_INDOOR_POSITION = 0x25,
    BLE_AD_TYPE_TRANS_DISC_DATA = 0x26,
    BLE_AD_TYPE_LE_SUPPORT_FEATURE = 0x27,
    BLE_AD_TYPE_CHAN_MAP_UPDATE = 0x28,
    BLE_AD_MANUFACTURER_SPECIFIC_TYPE = 0xff,
}

@SerializableObject()
export class BLEObject extends RFTransmitterObject {
    @SerializableMember()
    rawAdvertisement?: Uint8Array;

    @SerializableMapMember(Number, Uint8Array)
    manufacturerData?: Map<number, Uint8Array> = new Map();

    /**
     * Current mac address
     */
    @SerializableMember()
    address: MACAddress;

    /**
     * A list of known mac address
     */
    @SerializableArrayMember(MACAddress)
    knownAddresses: MACAddress[] = [];

    @SerializableMember()
    mtu?: number;

    @SerializableMember()
    appearance?: number;

    /**
     * Services
     */
    @SerializableArrayMember(BLEService)
    services?: BLEService[];

    constructor(address?: string);
    constructor(address?: MACAddress);
    constructor(address?: MACAddress | string) {
        super(address ? (address instanceof MACAddress ? address.toString() : address) : undefined);
        if (address instanceof MACAddress) {
            this.address = address;
            if (!this.knownAddresses.includes(address) && address !== undefined) {
                this.knownAddresses.push(address);
            }
        }
    }

    /**
     * Create object from advertisement data
     *
     * @param {Uint8Array} payload Advertisement data
     * @returns {BLEObject} BLE Object
     */
    static fromAdvertisementData<T extends BLEObject>(payload: Uint8Array): T {
        return new BLEObject().parseAdvertisement(payload) as T;
    }

    /**
     * Parse advertisement data
     * 
     * @deprecated Use [parseAdvertisement] instead
     * @param {Uint8Array} payload Advertisement data
     * @returns {BLEObject} Instance
     */
    parseScanData(payload: Uint8Array): this {
        return this.parseAdvertisement(payload);
    }

    /**
     * Parse advertisement data
     * 
     * @param {Uint8Array} payload Advertisement data
     * @returns {BLEObject} Instance
     */
    parseAdvertisement(payload: Uint8Array): this {
        this.rawAdvertisement = payload;
        const view = new DataView(payload.buffer, 0);
        for (let i = 0; i < payload.byteLength; i++) {
            let length = view.getUint8(i++); // Data length
            if (length != 0) {
                const ad_type = view.getUint8(i++); // Data type
                length--;
                switch (ad_type) {
                    case AdvertisementType.BLE_AD_TYPE_NAME_CMPL:
                        this.displayName = new TextDecoder().decode(payload.buffer.slice(i, i + length));
                        break;
                    case AdvertisementType.BLE_AD_TYPE_TX_PWR:
                        this.txPower = view.getInt8(i);
                        break;
                    case AdvertisementType.BLE_AD_TYPE_APPEARANCE:
                        this.appearance = view.getUint16(i, false);
                        break;
                    case AdvertisementType.BLE_AD_TYPE_FLAG:
                        // TODO
                        break;
                    case AdvertisementType.BLE_AD_TYPE_16SRV_CMPL:
                    case AdvertisementType.BLE_AD_TYPE_16SRV_PART:
                        break;
                    case AdvertisementType.BLE_AD_TYPE_32SRV_CMPL:
                    case AdvertisementType.BLE_AD_TYPE_32SRV_PART:
                        break;
                    case AdvertisementType.BLE_AD_TYPE_128SRV_CMPL:
                        break;
                    case AdvertisementType.BLE_AD_TYPE_128SRV_PART:
                        break;
                    // See CSS Part A 1.4 Manufacturer Specific Data
                    case AdvertisementType.BLE_AD_MANUFACTURER_SPECIFIC_TYPE:
                        this.parseManufacturerData(new Uint8Array(payload.buffer.slice(i, i + length)));
                        break;
                    case AdvertisementType.BLE_AD_TYPE_SERVICE_DATA: {
                        const uuid: BLEUUID = BLEUUID.fromBuffer(new Uint8Array(payload.buffer.slice(i, i + 2)));
                        this.services.push(
                            new BLEService(uuid, new Uint8Array(payload.buffer.slice(i + 2, i + 2 + length))),
                        );
                        break;
                    }
                    case AdvertisementType.BLE_AD_TYPE_32SERVICE_DATA:
                        break;
                    case AdvertisementType.BLE_AD_TYPE_128SERVICE_DATA:
                        break;
                    default:
                        break;
                }
                i += length - 1;
            }
        }
        return this;
    }

    parseManufacturerData(manufacturerData: Uint8Array): this {
        // Get the manufacturer
        const view = new DataView(manufacturerData.buffer, 0);
        const manufacturer = view.getInt32(0);
        this.manufacturerData.set(manufacturer, manufacturerData);
        return this;
    }
}