"use client";

import { useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { Alert, Button, Form, Input, Modal, Popconfirm, Result, Space, Spin, Steps, Typography } from "antd";
import { useAdminReturn, useApproveReturn, useMarkReturnReceived, useRejectReturn } from "@/hooks/useReturns";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";
import { formatVnd } from "@/utils/money";
import { refundMethodLabel, returnReasonLabel, returnStatusLabel } from "@/utils/returns";
import { ReturnStatusBadge } from "@/components/ui/StatusBadge";
import PageHeader from "@/components/ui/PageHeader";
import type { ReturnRequestStatus } from "@/types/returns";

const { Text } = Typography;

const STEP_ORDER: ReturnRequestStatus[] = ["Requested", "Approved", "ShippedBack", "Received", "Refunded"];

interface RejectFormValues {
  reason: string;
}

interface AdminReturnDetailProps {
  returnId: string;
}

export default function AdminReturnDetail({ returnId }: AdminReturnDetailProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectForm] = Form.useForm<RejectFormValues>();

  const { data: returnRequest, isLoading, isError } = useAdminReturn(returnId);
  const approveReturn = useApproveReturn();
  const rejectReturn = useRejectReturn();
  const markReceived = useMarkReturnReceived();

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !returnRequest) {
    return <Result status="404" title="Không tìm thấy yêu cầu trả hàng" />;
  }

  function handleApprove() {
    approveReturn.mutate(returnId, {
      onSuccess: () => toast.success("Đã duyệt yêu cầu trả hàng"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Duyệt thất bại. Vui lòng thử lại."),
    });
  }

  function handleReject(values: RejectFormValues) {
    rejectReturn.mutate(
      { id: returnId, body: { reason: values.reason.trim() } },
      {
        onSuccess: () => {
          toast.success("Đã từ chối yêu cầu trả hàng");
          setRejectOpen(false);
          rejectForm.resetFields();
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "Từ chối thất bại. Vui lòng thử lại."),
      }
    );
  }

  function handleMarkReceived() {
    markReceived.mutate(returnId, {
      onSuccess: () => toast.success("Đã xác nhận nhận hàng, đang xử lý hoàn tiền tự động"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Cập nhật thất bại. Vui lòng thử lại."),
    });
  }

  const canApproveOrReject = returnRequest.status === "Requested";
  const canMarkReceived = returnRequest.status === "Approved" || returnRequest.status === "ShippedBack";

  return (
    <div>
      <PageHeader
        title={`Trả hàng — ${returnRequest.orderCode}`}
        description={<Link href={`/admin/orders/${returnRequest.orderId}`}>Xem đơn hàng</Link>}
        action={<ReturnStatusBadge status={returnRequest.status} />}
      />

      {returnRequest.status === "Rejected" ? (
        <Alert
          type="error"
          showIcon
          message="Yêu cầu trả hàng bị từ chối"
          description={returnRequest.rejectReason ?? undefined}
          style={{ marginBottom: 24 }}
        />
      ) : (
        <Steps
          size="small"
          current={STEP_ORDER.indexOf(returnRequest.status)}
          items={STEP_ORDER.map((status) => ({ title: returnStatusLabel(status) }))}
          style={{ marginBottom: 24 }}
        />
      )}

      <Space direction="vertical" size={8} style={{ marginBottom: 24 }}>
        <Text>
          Người nhận: {returnRequest.recipientName} · {returnRequest.phoneNumber}
        </Text>
        <Text>Lý do: {returnReasonLabel(returnRequest.reason)}</Text>
        {returnRequest.note && <Text type="secondary">Ghi chú của khách: {returnRequest.note}</Text>}
        {returnRequest.returnTrackingCode && <Text>Mã vận đơn gửi trả: {returnRequest.returnTrackingCode}</Text>}
        <Text>Số tiền hoàn: {formatVnd(returnRequest.refundAmount)}</Text>
        {returnRequest.status === "Refunded" && (
          <Text>
            Phương thức hoàn: {refundMethodLabel(returnRequest.refundMethod)}
            {returnRequest.refundedAt && ` — ${dayjs(returnRequest.refundedAt).format("DD/MM/YYYY HH:mm")}`}
          </Text>
        )}
        <Text type="secondary">Ngày yêu cầu: {dayjs(returnRequest.createdAt).format("DD/MM/YYYY HH:mm")}</Text>
      </Space>

      <Space wrap>
        {canApproveOrReject && (
          <>
            <Popconfirm title="Duyệt yêu cầu trả hàng này?" onConfirm={handleApprove}>
              <Button type="primary" loading={approveReturn.isPending}>
                Duyệt
              </Button>
            </Popconfirm>
            <Button danger onClick={() => setRejectOpen(true)}>
              Từ chối
            </Button>
          </>
        )}
        {canMarkReceived && (
          <Popconfirm
            title="Xác nhận đã nhận hàng trả lại?"
            description="Thao tác này sẽ tự động hoàn tiền cho khách và nhập lại tồn kho."
            onConfirm={handleMarkReceived}
          >
            <Button type="primary" loading={markReceived.isPending}>
              Đã nhận hàng
            </Button>
          </Popconfirm>
        )}
      </Space>

      <Modal
        open={rejectOpen}
        title="Từ chối yêu cầu trả hàng"
        onCancel={() => setRejectOpen(false)}
        onOk={() => rejectForm.submit()}
        confirmLoading={rejectReturn.isPending}
        destroyOnHidden
        okText="Từ chối"
        cancelText="Đóng"
      >
        <Form form={rejectForm} layout="vertical" onFinish={handleReject} requiredMark={false}>
          <Form.Item name="reason" label="Lý do từ chối" rules={[{ required: true, message: "Vui lòng nhập lý do" }]}>
            <Input.TextArea rows={3} maxLength={500} showCount placeholder="Lý do từ chối" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
