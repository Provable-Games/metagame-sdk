import { BigNumberish, shortString } from 'starknet';

export const feltToString = (v: BigNumberish | string | null | undefined): string => {
  if (v === null || v === undefined) return '';

  // If it's already a string, return it directly
  if (typeof v === 'string') {
    // Check if it's a hex string that should be decoded
    if (v.startsWith('0x') && v.length > 2) {
      try {
        const bigIntValue = BigInt(v);
        return bigIntValue > 0n ? shortString.decodeShortString(bigintToHex(bigIntValue)) : v;
      } catch {
        // If conversion fails, return the string as-is
        return v;
      }
    }
    return v;
  }

  // For BigNumberish values, convert to BigInt and decode
  try {
    return BigInt(v) > 0n ? shortString.decodeShortString(bigintToHex(v)) : '';
  } catch {
    // If BigInt conversion fails, return empty string
    return '';
  }
};

export const stringToFelt = (v: string): BigNumberish =>
  v ? shortString.encodeShortString(v) : '0x0';

export const bigintToHex = (v: BigNumberish | null | undefined): `0x${string}` =>
  !v || v === null || v === undefined ? '0x0' : `0x${BigInt(v).toString(16)}`;

export function indexAddress(address: string) {
  return address.replace(/^0x0+/, '0x');
}

export function padAddress(address: string) {
  if (address && address !== '') {
    const length = address.length;
    const neededLength = 66 - length;
    let zeros = '';
    for (var i = 0; i < neededLength; i++) {
      zeros += '0';
    }
    const newHex = address.substring(0, 2) + zeros + address.substring(2);
    return newHex;
  } else {
    return '';
  }
}
