import { BigNumberish, shortString } from 'starknet';

export const feltToString = (v: BigNumberish | null | undefined): string => {
  if (v === null || v === undefined) return '';
  return BigInt(v) > 0n ? shortString.decodeShortString(bigintToHex(v)) : '';
};

export const stringToFelt = (v: string): BigNumberish =>
  v ? shortString.encodeShortString(v) : '0x0';

export const bigintToHex = (v: BigNumberish | null | undefined): `0x${string}` =>
  !v || v === null || v === undefined ? '0x0' : `0x${BigInt(v).toString(16)}`;

export function indexAddress(address: string) {
  return address.replace(/^0x0+/, '0x');
}
