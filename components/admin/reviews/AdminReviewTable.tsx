"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { Button, Form, Input, Modal, Popconfirm, Space, Typography, type TableProps } from "antd";
import StarRating from "@/components/shop/reviews/StarRating";
import { useHideReview, useReplyToReview, useRemoveReviewReply, useShowReview } from "@/hooks/useAdminReviews";
import { toast } from "@/utils/toast";
import { ApiError } from "@/services/apiClient";
import { ReviewStatusBadge } from "@/components/ui/StatusBadge";
import ResponsiveTable from "@/components/admin/common/ResponsiveTable";
import ListCard from "@/components/admin/common/ListCard";
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

interface ReplyModalState {
  open: boolean;
  review: AdminReviewDto | null;
}

interface ReplyFormValues {
  content: string;
}

const CLOSED_HIDE_MODAL: HideModalState = { open: false, review: null };
const CLOSED_REPLY_MODAL: ReplyModalState = { open: false, review: null };

export default function AdminReviewTable({ items, loading, pagination, onPageChange }: AdminReviewTableProps) {
  const [hideModal, setHideModal] = useState<HideModalState>(CLOSED_HIDE_MODAL);
  const [form] = Form.useForm<HideFormValues>();
  const hideReview = useHideReview();
  const showReview = useShowReview();
  const [replyModal, setReplyModal] = useState<ReplyModalState>(CLOSED_REPLY_MODAL);
  const [replyForm] = Form.useForm<ReplyFormValues>();
  const replyToReview = useReplyToReview();
  const removeReviewReply = useRemoveReviewReply();

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

  const openReplyModal = (review: AdminReviewDto) => {
    setReplyModal({ open: true, review });
    replyForm.setFieldsValue({ content: review.replyContent ?? undefined });
  };

  const handleReplySubmit = async (values: ReplyFormValues) => {
    if (!replyModal.review) return;
    try {
      await replyToReview.mutateAsync({ id: replyModal.review.id, body: { content: values.content.trim() } });
      toast.success("Đã gửi trả lời");
      setReplyModal(CLOSED_REPLY_MODAL);
      replyForm.resetFields();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Trả lời thất bại, vui lòng thử lại");
    }
  };

  const handleRemoveReply = async (review: AdminReviewDto) => {
    try {
      await removeReviewReply.mutateAsync(review.id);
      toast.success("Đã xoá trả lời");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Xoá trả lời thất bại, vui lòng thử lại");
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
      title: "Phản hồi",
      dataIndex: "replyContent",
      width: 260,
      render: (replyContent: string | null) =>
        replyContent ? (
          <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: "xem thêm" }} style={{ marginBottom: 0 }}>
            {replyContent}
          </Paragraph>
        ) : (
          <Text type="secondary">Chưa trả lời</Text>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: AdminReviewDto["status"], record) => (
        <div>
          <ReviewStatusBadge status={status} />
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
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space size="small">
            {record.status === "Published" ? (
              <Button size="small" onClick={() => setHideModal({ open: true, review: record })}>
                Ẩn
              </Button>
            ) : (
              <Popconfirm
                title="Hiện lại đánh giá này?"
                okText="Hiện"
                cancelText="Đóng"
                onConfirm={() => handleShow(record)}
              >
                <Button size="small" type="primary" loading={showReview.isPending}>
                  Hiện
                </Button>
              </Popconfirm>
            )}
          </Space>
          <Space size="small">
            <Button size="small" onClick={() => openReplyModal(record)}>
              {record.replyContent ? "Sửa trả lời" : "Trả lời"}
            </Button>
            {record.replyContent && (
              <Popconfirm
                title="Xoá trả lời này?"
                okText="Xoá"
                cancelText="Đóng"
                okButtonProps={{ danger: true, loading: removeReviewReply.isPending }}
                onConfirm={() => handleRemoveReply(record)}
              >
                <Button size="small" danger>
                  Xoá trả lời
                </Button>
              </Popconfirm>
            )}
          </Space>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ResponsiveTable<AdminReviewDto>
        rowKey="id"
        loading={loading}
        dataSource={items}
        columns={columns}
        emptyText="Chưa có đánh giá"
        pagination={pagination}
        onPageChange={onPageChange}
        renderCard={(record) => (
          <ListCard
            title={record.productName}
            status={<ReviewStatusBadge status={record.status} />}
            fields={[
              { label: "Sao", value: <StarRating value={record.rating} allowHalf={false} fontSize={14} /> },
              { label: "Tác giả", value: record.authorName },
              { label: "Nội dung", value: record.content },
              { label: "Ngày", value: dayjs(record.createdAt).format("DD/MM/YYYY HH:mm") },
              { label: "Phản hồi", value: record.replyContent ?? "Chưa trả lời" },
            ]}
            action={
              <Space direction="vertical" size="small">
                <Space size="small">
                  {record.status === "Published" ? (
                    <Button size="small" onClick={() => setHideModal({ open: true, review: record })}>
                      Ẩn
                    </Button>
                  ) : (
                    <Popconfirm
                      title="Hiện lại đánh giá này?"
                      okText="Hiện"
                      cancelText="Đóng"
                      onConfirm={() => handleShow(record)}
                    >
                      <Button size="small" type="primary" loading={showReview.isPending}>
                        Hiện
                      </Button>
                    </Popconfirm>
                  )}
                </Space>
                <Space size="small">
                  <Button size="small" onClick={() => openReplyModal(record)}>
                    {record.replyContent ? "Sửa trả lời" : "Trả lời"}
                  </Button>
                  {record.replyContent && (
                    <Popconfirm
                      title="Xoá trả lời này?"
                      okText="Xoá"
                      cancelText="Đóng"
                      okButtonProps={{ danger: true, loading: removeReviewReply.isPending }}
                      onConfirm={() => handleRemoveReply(record)}
                    >
                      <Button size="small" danger>
                        Xoá trả lời
                      </Button>
                    </Popconfirm>
                  )}
                </Space>
              </Space>
            }
          />
        )}
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
      <Modal
        open={replyModal.open}
        title="Trả lời đánh giá"
        onCancel={() => setReplyModal(CLOSED_REPLY_MODAL)}
        onOk={() => replyForm.submit()}
        confirmLoading={replyToReview.isPending}
        destroyOnHidden
        okText="Gửi"
        cancelText="Hủy"
      >
        <Form form={replyForm} layout="vertical" onFinish={handleReplySubmit}>
          <Form.Item
            name="content"
            label="Nội dung trả lời"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung trả lời" },
              { max: 2000, message: "Nội dung tối đa 2000 ký tự" },
            ]}
          >
            <Input.TextArea rows={4} maxLength={2000} showCount placeholder="Trả lời đánh giá của khách hàng" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
