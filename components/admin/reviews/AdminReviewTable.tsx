"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { Button, Form, Input, Modal, Popconfirm, Table, Tag, Typography, type TableProps } from "antd";
import StarRating from "@/components/shop/reviews/StarRating";
import { useHideReview, useShowReview } from "@/hooks/useAdminReviews";
import { toast } from "@/utils/toast";
import { ApiError } from "@/services/apiClient";
import type { AdminReviewDto } from "@/types/reviews";

const { Paragraph, Text } = Typography;

interface AdminReviewTableProps {
  items: AdminReviewDto[];
  loading: boolean;
  pagination: { current: number; pageSize: number; total: number };
  onPageChange: (page: number, pageSize: number) => void;
}

interface HideModalState {
  open: boolean;
  review: AdminReviewDto | null;
}

interface HideFormValues {
  reason?: string;
}

const CLOSED_HIDE_MODAL: HideModalState = { open: false, review: null };

export default function AdminReviewTable({ items, loading, pagination, onPageChange }: AdminReviewTableProps) {
  const [hideModal, setHideModal] = useState<HideModalState>(CLOSED_HIDE_MODAL);
  const [form] = Form.useForm<HideFormValues>();
  const hideReview = useHideReview();
  const showReview = useShowReview();

  const handleHideSubmit = async (values: HideFormValues) => {
    if (!hideModal.review) return;
    try {
      await hideReview.mutateAsync({ id: hideModal.review.id, body: { reason: values.reason?.trim() || undefined } });
      toast.success("Đã ẩn đánh giá");
      setHideModal(CLOSED_HIDE_MODAL);
      form.resetFields();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Ẩn đánh giá thất bại, vui lòng thử lại");
    }
  };

  const handleShow = async (review: AdminReviewDto) => {
    try {
      await showReview.mutateAsync(review.id);
      toast.success("Đã hiện đánh giá");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Hiện đánh giá thất bại, vui lòng thử lại");
    }
  };

  const columns: TableProps<AdminReviewDto>["columns"] = [
    { title: "Sản phẩm", dataIndex: "productName" },
    {
      title: "Sao",
      dataIndex: "rating",
      render: (rating: number) => <StarRating value={rating} allowHalf={false} fontSize={14} />,
    },
    { title: "Tác giả", dataIndex: "authorName" },
    {
      title: "Nội dung",
      dataIndex: "content",
      width: 320,
      render: (content: string) => (
        <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: "xem thêm" }} style={{ marginBottom: 0 }}>
          {content}
        </Paragraph>
      ),
    },
    {
      title: "Ngày",
      dataIndex: "createdAt",
      render: (value: string) => dayjs(value).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: AdminReviewDto["status"], record) => (
        <div>
          <Tag color={status === "Published" ? "green" : "default"}>
            {status === "Published" ? "Đã hiển thị" : "Đã ẩn"}
          </Tag>
          {status === "Hidden" && record.hiddenReason && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.hiddenReason}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) =>
        record.status === "Published" ? (
          <Button size="small" onClick={() => setHideModal({ open: true, review: record })}>
            Ẩn
          </Button>
        ) : (
          <Popconfirm title="Hiện lại đánh giá này?" okText="Hiện" cancelText="Đóng" onConfirm={() => handleShow(record)}>
            <Button size="small" type="primary" loading={showReview.isPending}>
              Hiện
            </Button>
          </Popconfirm>
        ),
    },
  ];

  return (
    <>
      <Table<AdminReviewDto>
        rowKey="id"
        loading={loading}
        dataSource={items}
        columns={columns}
        locale={{ emptyText: "Chưa có đánh giá" }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          onChange: onPageChange,
        }}
      />
      <Modal
        open={hideModal.open}
        title="Ẩn đánh giá"
        onCancel={() => setHideModal(CLOSED_HIDE_MODAL)}
        onOk={() => form.submit()}
        confirmLoading={hideReview.isPending}
        destroyOnHidden
        okText="Ẩn"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleHideSubmit}>
          <Form.Item name="reason" label="Lý do (không bắt buộc)">
            <Input.TextArea rows={3} placeholder="Lý do ẩn đánh giá" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
