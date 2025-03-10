export function indexAddress(address: string) {
  return address.replace(/^0x0+/, '0x');
}
