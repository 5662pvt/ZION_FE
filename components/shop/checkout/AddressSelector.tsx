"use client";

import { useState } from "react";
import { Button, Empty, Flex, Radio, Space, Tag } from "antd";
import AddressFormModal from "@/components/account/AddressFormModal";
import { formatAddress } from "@/utils/address";
import type { AddressDto } from "@/types/users";

interface AddressSelectorProps {
  addresses: AddressDto[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function AddressSelector({ addresses, selectedId, onSelect }: AddressSelectorProps) {
  const [modalOpen, setModalOpen] = useState(false);

  if (addresses.length === 0) {
    return (
      <>
        <Empty description="Chưa có địa chỉ giao hàng">
          <Button type="primary" onClick={() => setModalOpen(true)}>
            Thêm địa chỉ
          </Button>
        </Empty>
        <AddressFormModal open={modalOpen} address={null} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <Radio.Group value={selectedId} onChange={(e) => onSelect(e.target.value)} style={{ width: "100%" }}>
        <Space direction="vertical" style={{ width: "100%" }} size={8}>
          {addresses.map((address) => (
            <Radio
              key={address.id}
              value={address.id}
              style={{
                width: "100%",
                border: "1px solid #d9d9d9",
                borderRadius: 8,
                padding: "12px 16px",
                margin: 0,
              }}
            >
              <Flex justify="space-between" align="center" wrap gap={8} style={{ width: "100%" }}>
                <div>
                  <div>
                    {address.recipientName} · {address.phoneNumber}
                  </div>
                  <div>{formatAddress(address)}</div>
                </div>
                {address.isDefault && <Tag color="green">Mặc định</Tag>}
              </Flex>
            </Radio>
          ))}
        </Space>
      </Radio.Group>
      <Button type="link" style={{ paddingLeft: 0, marginTop: 8 }} onClick={() => setModalOpen(true)}>
        + Thêm địa chỉ mới
      </Button>
      <AddressFormModal open={modalOpen} address={null} onClose={() => setModalOpen(false)} />
    </>
  );
}
