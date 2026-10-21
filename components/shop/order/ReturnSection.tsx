"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { Alert, Button, Form, Input, Modal, Select, Space, Steps, Typography } from "antd";
import { useMarkShippedBack, useRequestReturn } from "@/hooks/useReturns";
import { ApiError } from "@/services/apiClient";
import { toast } from "@/utils/toast";
import { formatVnd } from "@/utils/money";
import { refundMethodLabel, returnReasonLabel, returnStatusLabel } from "@/utils/returns";
import type { OrderDto } from "@/types/orders";
import type { ReturnReason, ReturnRequestStatus } from "@/types/returns";

const { Text, Title } = Typography;
const { TextArea } = Input;

const REASON_VALUES: ReturnReason[] = ["Defective", "WrongItem", "NotAsDescribed", "ChangedMind", "Other"];
const REASON_OPTIONS = REASON_VALUES.map((value) => ({ value, label: returnReasonLabel(value) }));

const STEP_ORDER: ReturnRequestStatus[] = ["Requested", "Approved", "ShippedBack", "Received", "Refunded"];

interface RequestReturnFormValues {
  reason: ReturnReason;
  note?: string;
}

interface ShippedBackFormValues {
  trackingCode?: string;
}

interface ReturnSectionProps {
  order: OrderDto;
}

export default function ReturnSection({ order }: ReturnSectionProps) {
  const [requestOpen, setRequestOpen] = useState(false);
  const [shippedOpen, setShippedOpen] = useState(false);
  const [requestForm] = Form.useForm<RequestReturnFormValues>();
  const [shippedForm] = Form.useForm<ShippedBackFormValues>();
  const requestReturn = useRequestReturn();
  const markShippedBack = useMarkShippedBack();

  const returnRequest = order.returnRequest;
  const canRequestNew = order.status === "Completed" && (!returnRequest || returnRequest.status === "Rejected");

  if (!canRequestNew && !returnRequest) return null;

  function handleRequestSubmit(values: RequestReturnFormValues) {
    requestReturn.mutate(
      { orderId: order.id, body: { reason: values.reason, note: values.note?.trim() || undefined } },
      {
        onSuccess: () => {
          toast.success("Đã gửi yêu cầu trả hàng");
          setRequestOpen(false);
          requestForm.resetFields();
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "Gửi yêu cầu thất bại. Vui lòng thử lại."),
      }
    );
  }

  function handleShippedSubmit(values: ShippedBackFormValues) {
    if (!returnRequest) return;
    markShippedBack.mutate(
      {
        orderId: order.id,
        returnId: returnRequest.id,
        body: { trackingCode: values.trackingCode?.trim() || undefined },
      },
      {
        onSuccess: () => {
          toast.success("Đã xác nhận gửi hàng trả lại");
          setShippedOpen(false);
          shippedForm.resetFields();
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "Cập nhật thất bại. Vui lòng thử lại."),
      }
    );
  }

  return (
    <div style={{ marginTop: 24 }}>
      <Title level={5}>Trả hàng / Hoàn tiền</Title>

      {returnRequest && (
        <>
          {returnRequest.status === "Rejected" ? (
            <Alert
              type="error"
              showIcon
              message="Yêu cầu trả hàng bị từ chối"
              description={returnRequest.rejectReason ?? undefined}
              style={{ marginBottom: 16 }}
            />
          ) : (
            <Steps
              size="small"
              current={STEP_ORDER.indexOf(returnRequest.status)}
              items={STEP_ORDER.map((status) => ({ title: returnStatusLabel(status) }))}
              style={{ marginBottom: 16 }}
            />
          )}

          <Space direction="vertical" size={4} style={{ marginBottom: 16 }}>
            <Text>Lý do: {returnReasonLabel(returnRequest.reason)}</Text>
            {returnRequest.note && <Text type="secondary">Ghi chú: {returnRequest.note}</Text>}
            {returnRequest.returnTrackingCode && (
              <Text type="secondary">Mã vận đơn gửi trả: {returnRequest.returnTrackingCode}</Text>
            )}
            {returnRequest.status === "Refunded" && (
              <Text>
                Đã hoàn {formatVnd(returnRequest.refundAmount)} ({refundMethodLabel(returnRequest.refundMethod)})
                {returnRequest.refundedAt && ` lúc ${dayjs(returnRequest.refundedAt).format("DD/MM/YYYY HH:mm")}`}
              </Text>
            )}
          </Space>

          {returnRequest.status === "Approved" && (
            <Button type="primary" onClick={() => setShippedOpen(true)}>
              Tôi đã gửi hàng
            </Button>
          )}
        </>
      )}

      {canRequestNew && (
        <Button onClick={() => setRequestOpen(true)} style={returnRequest ? { marginTop: 16 } : undefined}>
          Yêu cầu trả hàng
        </Button>
      )}

      <Modal
        open={requestOpen}
        title="Yêu cầu trả hàng"
        onCancel={() => setRequestOpen(false)}
        onOk={() => requestForm.submit()}
        confirmLoading={requestReturn.isPending}
        destroyOnHidden
        okText="Gửi yêu cầu"
        cancelText="Đóng"
      >
        <Form form={requestForm} layout="vertical" onFinish={handleRequestSubmit} requiredMark={false}>
          <Form.Item name="reason" label="Lý do trả hàng" rules={[{ required: true, message: "Vui lòng chọn lý do" }]}>
            <Select options={REASON_OPTIONS} placeholder="Chọn lý do" />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú" rules={[{ max: 1000, message: "Tối đa 1000 ký tự" }]}>
            <TextArea rows={3} maxLength={1000} showCount placeholder="Mô tả thêm (không bắt buộc)" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={shippedOpen}
        title="Xác nhận đã gửi hàng trả lại"
        onCancel={() => setShippedOpen(false)}
        onOk={() => shippedForm.submit()}
        confirmLoading={markShippedBack.isPending}
        destroyOnHidden
        okText="Xác nhận"
        cancelText="Đóng"
      >
        <Form form={shippedForm} layout="vertical" onFinish={handleShippedSubmit} requiredMark={false}>
          <Form.Item name="trackingCode" label="Mã vận đơn (không bắt buộc)">
            <Input placeholder="Mã vận đơn" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
