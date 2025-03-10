import { BigNumberish, shortString } from 'starknet';

export const feltToString = (v: BigNumberish): string => {
  return BigInt(v) > 0n ? shortString.decodeShortString(bigintToHex(v)) : '';
};

export const bigintToHex = (v: BigNumberish): `0x${string}` =>
  !v ? '0x0' : `0x${BigInt(v).toString(16)}`;

export function indexAddress(address: string) {
  return address.replace(/^0x0+/, '0x');
}
