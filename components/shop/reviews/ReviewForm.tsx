"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Form, Input, Popconfirm, Rate, Space, Typography } from "antd";
import StarRating from "./StarRating";
import { useAuth } from "@/hooks/useAuth";
import { useCreateReview, useDeleteReview, useReviewEligibility, useUpdateReview } from "@/hooks/useReviews";
import { toast } from "@/utils/toast";
import { ApiError } from "@/services/apiClient";
import type { CreateReviewRequest } from "@/types/reviews";

const { Text } = Typography;
const { TextArea } = Input;

interface ReviewFormValues {
  rating: number;
  title?: string;
  content: string;
}

interface ReviewFormProps {
  productId: string;
}

export default function ReviewForm({ productId }: ReviewFormProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: eligibility, isLoading } = useReviewEligibility(productId, isAuthenticated);
  const [form] = Form.useForm<ReviewFormValues>();
  const [editing, setEditing] = useState(false);
  const createReview = useCreateReview(productId);
  const updateReview = useUpdateReview(productId);
  const deleteReview = useDeleteReview(productId);

  useEffect(() => {
    if (editing && eligibility?.myReview) {
      form.setFieldsValue({
        rating: eligibility.myReview.rating,
        title: eligibility.myReview.title ?? undefined,
        content: eligibility.myReview.content,
      });
    }
  }, [editing, eligibility, form]);

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <div style={{ marginBottom: 24 }}>
        <Link href={`/login?returnUrl=${encodeURIComponent(`${pathname}#reviews`)}`}>Đăng nhập để viết đánh giá</Link>
      </div>
    );
  }

  if (isLoading || !eligibility) return null;

  const handleSubmit = async (values: ReviewFormValues) => {
    const body: CreateReviewRequest = {
      rating: values.rating,
      title: values.title?.trim() || null,
      content: values.content.trim(),
    };
    try {
      if (eligibility.myReview) {
        await updateReview.mutateAsync({ id: eligibility.myReview.id, body });
        toast.success("Đã cập nhật đánh giá");
      } else {
        await createReview.mutateAsync(body);
        toast.success("Cảm ơn bạn đã đánh giá sản phẩm");
      }
      setEditing(false);
      form.resetFields();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  const handleDelete = async () => {
    if (!eligibility.myReview) return;
    try {
      await deleteReview.mutateAsync(eligibility.myReview.id);
      toast.success("Đã xoá đánh giá");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Xoá đánh giá thất bại");
    }
  };

  if (eligibility.myReview && !editing) {
    const myReview = eligibility.myReview;
    return (
      <div style={{ marginBottom: 24, padding: 16, background: "var(--color-page)", borderRadius: 8 }}>
        <Text strong>Đánh giá của bạn</Text>
        <div style={{ margin: "8px 0" }}>
          <StarRating value={myReview.rating} allowHalf={false} fontSize={14} />
        </div>
        {myReview.title && (
          <Text strong style={{ display: "block" }}>
            {myReview.title}
          </Text>
        )}
        <Text style={{ whiteSpace: "pre-wrap", display: "block", marginBottom: 12 }}>{myReview.content}</Text>
        <Space>
          <Button onClick={() => setEditing(true)}>Sửa</Button>
          <Popconfirm
            title="Xoá đánh giá này?"
            okText="Xoá"
            cancelText="Đóng"
            okButtonProps={{ danger: true, loading: deleteReview.isPending }}
            onConfirm={handleDelete}
          >
            <Button danger>Xoá</Button>
          </Popconfirm>
        </Space>
      </div>
    );
  }

  if (!eligibility.canReview && !editing) {
    return (
      <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
        {eligibility.reason}
      </Text>
    );
  }

  const submitting = createReview.isPending || updateReview.isPending;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      style={{ marginBottom: 24, maxWidth: 480 }}
      initialValues={{ rating: 5 }}
      disabled={submitting}
    >
      <Form.Item name="rating" label="Đánh giá của bạn" rules={[{ required: true, message: "Vui lòng chọn số sao" }]}>
        <Rate />
      </Form.Item>
      <Form.Item name="title" label="Tiêu đề" rules={[{ max: 120, message: "Tiêu đề tối đa 120 ký tự" }]}>
        <Input placeholder="Tiêu đề (không bắt buộc)" />
      </Form.Item>
      <Form.Item
        name="content"
        label="Nội dung"
        rules={[
          { required: true, message: "Vui lòng nhập nội dung" },
          { min: 10, message: "Nội dung cần tối thiểu 10 ký tự" },
          { max: 2000, message: "Nội dung tối đa 2000 ký tự" },
        ]}
      >
        <TextArea rows={4} maxLength={2000} showCount placeholder="Chia sẻ cảm nhận của bạn về sản phẩm" />
      </Form.Item>
      <Space>
        <Button type="primary" htmlType="submit" loading={submitting}>
          {eligibility.myReview ? "Lưu thay đổi" : "Gửi đánh giá"}
        </Button>
        {editing && <Button onClick={() => setEditing(false)}>Huỷ</Button>}
      </Space>
    </Form>
  );
}
