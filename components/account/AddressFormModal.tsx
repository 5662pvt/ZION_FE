"use client";

import { useEffect } from "react";
import { Checkbox, Form, Input, Modal } from "antd";
import { useAddAddress, useUpdateAddress } from "@/hooks/useAddresses";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";
import type { AddAddressRequest, AddressDto } from "@/types/users";

interface AddressFormModalProps {
  open: boolean;
  address: AddressDto | null;
  onClose: () => void;
}

const VALID_FIELDS: Array<keyof AddAddressRequest> = [
  "line1",
  "line2",
  "city",
  "state",
  "country",
  "postalCode",
  "isDefault",
];

export default function AddressFormModal({ open, address, onClose }: AddressFormModalProps) {
  const [form] = Form.useForm<AddAddressRequest>();
  const addAddress = useAddAddress();
  const updateAddress = useUpdateAddress();
  const isEditing = address !== null;
  const submitting = addAddress.isPending || updateAddress.isPending;

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        address
          ? {
              line1: address.line1,
              line2: address.line2 ?? undefined,
              city: address.city,
              state: address.state ?? undefined,
              country: address.country,
              postalCode: address.postalCode,
              isDefault: address.isDefault,
            }
          : { line1: "", line2: "", city: "", state: "", country: "", postalCode: "", isDefault: false }
      );
    }
  }, [open, address, form]);

  const handleOk = async () => {
    let values: AddAddressRequest;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    const body: AddAddressRequest = {
      line1: values.line1.trim(),
      line2: values.line2?.trim() || null,
      city: values.city.trim(),
      state: values.state?.trim() || null,
      country: values.country.trim(),
      postalCode: values.postalCode.trim(),
      isDefault: values.isDefault ?? false,
    };

    try {
      if (isEditing && address) {
        await updateAddress.mutateAsync({ addressId: address.id, body });
        toast.success("Đã cập nhật địa chỉ");
      } else {
        await addAddress.mutateAsync(body);
        toast.success("Đã thêm địa chỉ");
      }
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.errors.length > 0) {
        let handled = false;
        err.errors.forEach((e) => {
          const match = VALID_FIELDS.find((n) => e.field && n.toLowerCase() === e.field!.toLowerCase());
          if (match) {
            form.setFields([{ name: match, errors: [e.message] }]);
            handled = true;
          }
        });
        if (!handled) toast.error(err.message);
      } else {
        toast.error(err instanceof ApiError ? err.message : "Lưu địa chỉ thất bại. Vui lòng thử lại.");
      }
    }
  };

  return (
    <Modal
      open={open}
      title={isEditing ? "Sửa địa chỉ" : "Thêm địa chỉ"}
      onOk={handleOk}
      onCancel={onClose}
      okText={isEditing ? "Lưu" : "Thêm"}
      cancelText="Huỷ"
      confirmLoading={submitting}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          name="line1"
          label="Địa chỉ (dòng 1)"
          rules={[
            { required: true, message: "Vui lòng nhập địa chỉ" },
            { max: 256, message: "Tối đa 256 ký tự" },
          ]}
        >
          <Input placeholder="Số nhà, tên đường" />
        </Form.Item>
        <Form.Item name="line2" label="Địa chỉ (dòng 2)" rules={[{ max: 256, message: "Tối đa 256 ký tự" }]}>
          <Input placeholder="Không bắt buộc" />
        </Form.Item>
        <Form.Item
          name="city"
          label="Thành phố"
          rules={[
            { required: true, message: "Vui lòng nhập thành phố" },
            { max: 128, message: "Tối đa 128 ký tự" },
          ]}
        >
          <Input placeholder="Thành phố" />
        </Form.Item>
        <Form.Item name="state" label="Tỉnh/Bang" rules={[{ max: 128, message: "Tối đa 128 ký tự" }]}>
          <Input placeholder="Không bắt buộc" />
        </Form.Item>
        <Form.Item
          name="country"
          label="Quốc gia"
          rules={[
            { required: true, message: "Vui lòng nhập quốc gia" },
            { max: 64, message: "Tối đa 64 ký tự" },
          ]}
        >
          <Input placeholder="Quốc gia" />
        </Form.Item>
        <Form.Item
          name="postalCode"
          label="Mã bưu chính"
          rules={[
            { required: true, message: "Vui lòng nhập mã bưu chính" },
            { max: 16, message: "Tối đa 16 ký tự" },
          ]}
        >
          <Input placeholder="Mã bưu chính" />
        </Form.Item>
        <Form.Item name="isDefault" valuePropName="checked">
          <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
}
