import { SerializableObject, Unit, UnitPrefix } from '@openhps/core';

/**
 * Power unit (Watt).
 */
@SerializableObject()
export class PowerUnit extends Unit {
    static readonly WATT = new PowerUnit('watt', {
        baseName: 'power',
        aliases: ['W', 'watts'],
    });

    static readonly DECIBEL = new PowerUnit('decibel', {
        baseName: 'power',
        aliases: ['dB', 'decibel-watts'],
        prefixes: 'decimal',
        definitions: [
            {
                magnitude: 10 / Math.log10(10),
                unit: 'watt',
            },
        ],
    });

    static readonly dBm = PowerUnit.DECIBEL.specifier(UnitPrefix.MILLI);
}
