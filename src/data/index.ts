import { DataSerializer } from '@openhps/core';
import { fromHexString, toHexString } from '../utils/BufferUtils';

DataSerializer.registerType(Uint8Array, {
    serializer: toHexString,
    deserializer: fromHexString,
});

export * from './RFObject';
export * from './RFReceiverObject';
export * from './RFTransmitterObject';
export * from './WLANObject';
export * from './position';
export * from './BLEObject';
export * from './RFDataFrame';
export * from './BLEUUID';
export * from './MACAddress';
export * from './BLEBeaconObject';
export * from './BLEAltBeacon';
export * from './BLEiBeacon';
export * from './BLEService';
export * from './BLEEddystone';
export * from './BLEEddystoneUID';
export * from './BLEEddystoneURL';
export * from './BLEEddystoneTLM';
export * from './units';
