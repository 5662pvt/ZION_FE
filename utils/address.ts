import type { AddressDto } from "@/types/users";

export function formatAddress(address: AddressDto): string {
  return `${address.streetAddress}, ${address.ward}, ${address.province}`;
}
