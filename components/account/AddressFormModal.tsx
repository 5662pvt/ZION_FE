"use client";

import { useEffect, useState } from "react";
import { Checkbox, Form, Input, Modal, Select } from "antd";
import { useAddAddress, useUpdateAddress } from "@/hooks/useAddresses";
import { useProfile } from "@/hooks/useProfile";
import { useProvinces, useWards } from "@/hooks/useGeo";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";
import type { AddAddressRequest, AddressDto } from "@/types/users";

interface AddressFormModalProps {
  open: boolean;
  address: AddressDto | null;
  onClose: () => void;
}

const PHONE_REGEX = /^(0|\+84)(3|5|7|8|9|2)[0-9]{8}$/;

const VALID_FIELDS: Array<keyof AddAddressRequest> = [
  "recipientName",
  "phoneNumber",
  "province",
  "ward",
  "streetAddress",
  "isDefault",
];

export default function AddressFormModal({ open, address, onClose }: AddressFormModalProps) {
  const [form] = Form.useForm<AddAddressRequest>();
  const addAddress = useAddAddress();
  const updateAddress = useUpdateAddress();
  const { data: profile } = useProfile();
  const { data: provinces } = useProvinces();
  const [userProvinceId, setUserProvinceId] = useState<string | undefined>(undefined);
  const [syncedFor, setSyncedFor] = useState<string | null>(null);
  const isEditing = address !== null;
  const submitting = addAddress.isPending || updateAddress.isPending;

  // Reset the user's province override whenever the modal (re)opens for a different address,
  // so editing address A then address B doesn't carry over A's selection.
  const formKey = open ? address?.id ?? "__new__" : null;
  if (formKey !== null && formKey !== syncedFor) {
    setSyncedFor(formKey);
    setUserProvinceId(undefined);
  }

  const initialProvinceId = address ? provinces?.find((p) => p.name === address.province)?.id : undefined;
  const selectedProvinceId = userProvinceId ?? initialProvinceId;
  const { data: wards } = useWards(selectedProvinceId);

  const provinceOptions = (provinces ?? []).map((p) => ({ value: p.name, label: p.name, id: p.id }));
  const wardOptions = (wards ?? []).map((w) => ({ value: w.name, label: w.name, id: w.id }));

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        address
          ? {
              recipientName: address.recipientName,
              phoneNumber: address.phoneNumber,
              province: address.province,
              ward: address.ward,
              streetAddress: address.streetAddress,
              isDefault: address.isDefault,
            }
          : {
              recipientName: profile?.fullName ?? "",
              phoneNumber: profile?.phoneNumber ?? "",
              province: "",
              ward: "",
              streetAddress: "",
              isDefault: false,
            }
      );
    }
  }, [open, address, form, profile]);

  const handleOk = async () => {
    let values: AddAddressRequest;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    const body: AddAddressRequest = {
      recipientName: values.recipientName.trim(),
      phoneNumber: values.phoneNumber.replace(/[\s.-]/g, ""),
      province: values.province.trim(),
      ward: values.ward.trim(),
      streetAddress: values.streetAddress.trim(),
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
          name="recipientName"
          label="Người nhận"
          rules={[
            { required: true, message: "Vui lòng nhập tên người nhận" },
            { max: 100, message: "Tối đa 100 ký tự" },
          ]}
        >
          <Input placeholder="Tên người nhận" />
        </Form.Item>
        <Form.Item
          name="phoneNumber"
          label="Số điện thoại"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại" },
            { max: 15, message: "Tối đa 15 ký tự" },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                const stripped = String(value).replace(/[\s.-]/g, "");
                return PHONE_REGEX.test(stripped)
                  ? Promise.resolve()
                  : Promise.reject(new Error("Số điện thoại không hợp lệ"));
              },
            },
          ]}
        >
          <Input placeholder="Số điện thoại" />
        </Form.Item>
        <Form.Item
          name="province"
          label="Tỉnh/Thành phố"
          rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố" }]}
        >
          <Select
            placeholder="Chọn tỉnh/thành phố"
            showSearch
            optionFilterProp="label"
            options={provinceOptions}
            onChange={(_value, option) => {
              const selected = Array.isArray(option) ? option[0] : option;
              setUserProvinceId(selected?.id);
              form.setFieldValue("ward", undefined);
            }}
          />
        </Form.Item>
        <Form.Item
          name="ward"
          label="Phường/Xã"
          rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
        >
          <Select placeholder="Chọn phường/xã" showSearch optionFilterProp="label" disabled={!selectedProvinceId} options={wardOptions} />
        </Form.Item>
        <Form.Item
          name="streetAddress"
          label="Địa chỉ cụ thể"
          rules={[
            { required: true, message: "Vui lòng nhập địa chỉ cụ thể" },
            { max: 255, message: "Tối đa 255 ký tự" },
          ]}
        >
          <Input placeholder="Số nhà, tên đường, thôn/ấp…" />
        </Form.Item>
        <Form.Item name="isDefault" valuePropName="checked">
          <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
}
