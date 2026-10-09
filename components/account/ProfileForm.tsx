"use client";

import { useEffect } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { Alert, Button, DatePicker, Flex, Form, Input, Spin } from "antd";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";

interface ProfileFormValues {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: Dayjs | null;
}

const VALID_FIELDS: Array<keyof ProfileFormValues> = ["fullName", "phoneNumber", "dateOfBirth"];

export default function ProfileForm() {
  const { user } = useAuth();
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const updateProfile = useUpdateProfile();
  const [form] = Form.useForm<ProfileFormValues>();

  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        fullName: profile.fullName ?? undefined,
        phoneNumber: profile.phoneNumber ?? undefined,
        dateOfBirth: profile.dateOfBirth ? dayjs(profile.dateOfBirth) : null,
      });
    }
  }, [profile, form]);

  if (isLoading) {
    return (
      <Flex justify="center" style={{ padding: 32 }}>
        <Spin />
      </Flex>
    );
  }

  if (isError || !profile) {
    return (
      <Alert
        type="error"
        message="Không tải được thông tin hồ sơ"
        action={
          <Button size="small" onClick={() => refetch()}>
            Thử lại
          </Button>
        }
        showIcon
      />
    );
  }

  const handleFinish = async (values: ProfileFormValues) => {
    try {
      await updateProfile.mutateAsync({
        fullName: values.fullName?.trim() || null,
        phoneNumber: values.phoneNumber?.trim() || null,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : null,
      });
      toast.success("Đã lưu thông tin hồ sơ");
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
        toast.error(err instanceof ApiError ? err.message : "Lưu thông tin thất bại. Vui lòng thử lại.");
      }
    }
  };

  return (
    <>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Hồ sơ</h2>
      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false} style={{ maxWidth: 480 }}>
        <Form.Item label="Email">
          <Input value={user?.email ?? profile.email} disabled />
        </Form.Item>
        <Form.Item name="fullName" label="Họ tên" rules={[{ max: 128, message: "Tối đa 128 ký tự" }]}>
          <Input placeholder="Họ tên" />
        </Form.Item>
        <Form.Item
          name="phoneNumber"
          label="Số điện thoại"
          rules={[
            { max: 32, message: "Tối đa 32 ký tự" },
            { pattern: /^[+0-9 ()-]*$/, message: "Số điện thoại không hợp lệ" },
          ]}
        >
          <Input placeholder="Số điện thoại" />
        </Form.Item>
        <Form.Item name="dateOfBirth" label="Ngày sinh">
          <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={updateProfile.isPending}>
            Lưu thay đổi
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
