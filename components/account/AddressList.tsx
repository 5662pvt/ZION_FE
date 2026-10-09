"use client";

import { useState } from "react";
import { Alert, Badge, Button, Card, Col, Empty, Flex, Popconfirm, Row, Spin } from "antd";
import { useAddresses, useRemoveAddress, useSetDefaultAddress } from "@/hooks/useAddresses";
import { toast } from "@/utils/toast";
import { ApiError } from "@/services/apiClient";
import AddressFormModal from "./AddressFormModal";
import type { AddressDto } from "@/types/users";

export default function AddressList() {
  const { data: addresses, isLoading, isError, refetch } = useAddresses();
  const removeAddress = useRemoveAddress();
  const setDefaultAddress = useSetDefaultAddress();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressDto | null>(null);

  if (isLoading) {
    return (
      <Flex justify="center" style={{ padding: 32 }}>
        <Spin />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Alert
        type="error"
        message="Không tải được sổ địa chỉ"
        action={
          <Button size="small" onClick={() => refetch()}>
            Thử lại
          </Button>
        }
        showIcon
      />
    );
  }

  const handleRemove = async (id: string) => {
    try {
      await removeAddress.mutateAsync(id);
      toast.success("Đã xoá địa chỉ");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Xoá địa chỉ thất bại. Vui lòng thử lại.");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress.mutateAsync(id);
      toast.success("Đã đặt làm địa chỉ mặc định");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Đặt mặc định thất bại. Vui lòng thử lại.");
    }
  };

  const openAdd = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const openEdit = (address: AddressDto) => {
    setEditingAddress(address);
    setModalOpen(true);
  };

  return (
    <>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Sổ địa chỉ</h2>
        <Button type="primary" onClick={openAdd}>
          Thêm địa chỉ
        </Button>
      </Flex>
      {!addresses || addresses.length === 0 ? (
        <Empty description="Chưa có địa chỉ nào" />
      ) : (
        <Row gutter={[16, 16]}>
          {addresses.map((address) => {
            const card = (
              <Card
                actions={[
                  <a key="edit" onClick={() => openEdit(address)}>
                    Sửa
                  </a>,
                  address.isDefault ? (
                    <span key="default" style={{ color: "#bfbfbf" }}>
                      Đặt mặc định
                    </span>
                  ) : (
                    <a key="default" onClick={() => handleSetDefault(address.id)}>
                      Đặt mặc định
                    </a>
                  ),
                  <Popconfirm
                    key="delete"
                    title="Xoá địa chỉ này?"
                    okText="Xoá"
                    cancelText="Huỷ"
                    onConfirm={() => handleRemove(address.id)}
                  >
                    <a>Xoá</a>
                  </Popconfirm>,
                ]}
              >
                <div>{address.line1}</div>
                {address.line2 && <div>{address.line2}</div>}
                <div>
                  {[address.city, address.state, address.country].filter(Boolean).join(", ")} {address.postalCode}
                </div>
              </Card>
            );
            return (
              <Col xs={24} md={12} key={address.id}>
                {address.isDefault ? (
                  <Badge.Ribbon text="Mặc định" color="green">
                    {card}
                  </Badge.Ribbon>
                ) : (
                  card
                )}
              </Col>
            );
          })}
        </Row>
      )}
      <AddressFormModal open={modalOpen} address={editingAddress} onClose={() => setModalOpen(false)} />
    </>
  );
}
