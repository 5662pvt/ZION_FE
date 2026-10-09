import type { AddressDto } from "@/types/users";

export function formatAddress(address: Pick<AddressDto, "streetAddress" | "ward" | "province">): string {
  return `${address.streetAddress}, ${address.ward}, ${address.province}`;
}
