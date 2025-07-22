import { BigNumberish, shortString } from 'starknet';

export function indexAddress(address: string) {
  return address.replace(/^0x0+/, '0x');
}

export function displayAddress(string: string) {
  if (string === undefined) return 'unknown';
  return string.substring(0, 6) + '...' + string.substring(string.length - 4);
}

export const toTitleCase = (str: string): string => {
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const stringToFelt = (v: string): BigNumberish =>
  v ? shortString.encodeShortString(v) : '0x0';
