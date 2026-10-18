"use client";

import { useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Empty, Form, Input, Pagination, Popconfirm, Spin, Typography } from "antd";
import { useAuth } from "@/hooks/useAuth";
import { useProductQuestions } from "@/hooks/useProductQuestions";
import { useAskQuestion } from "@/hooks/useAskQuestion";
import { useDeleteQuestion } from "@/hooks/useDeleteQuestion";
import { toast } from "@/utils/toast";
import { ApiError } from "@/services/apiClient";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const PAGE_SIZE = 10;

interface ProductQAProps {
  productId: string;
}

interface AskFormValues {
  content: string;
}

export default function ProductQA({ productId }: ProductQAProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [page, setPage] = useState(1);
  const [form] = Form.useForm<AskFormValues>();
  const { data, isLoading, isError } = useProductQuestions(productId, { page, pageSize: PAGE_SIZE });
  const askQuestion = useAskQuestion(productId);
  const deleteQuestion = useDeleteQuestion(productId);

  const handleAsk = async (values: AskFormValues) => {
    try {
      await askQuestion.mutateAsync({ content: values.content.trim() });
      toast.success("Đã gửi câu hỏi của bạn");
      form.resetFields();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gửi câu hỏi thất bại, vui lòng thử lại");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteQuestion.mutateAsync(id);
      toast.success("Đã xoá câu hỏi");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Xoá câu hỏi thất bại, vui lòng thử lại");
    }
  };

  return (
    <section id="qa" style={{ marginTop: 48 }}>
      <Title level={3}>Hỏi đáp về sản phẩm</Title>

      {!authLoading &&
        (isAuthenticated ? (
          <Form form={form} layout="vertical" onFinish={handleAsk} style={{ marginBottom: 24, maxWidth: 480 }}>
            <Form.Item
              name="content"
              label="Đặt câu hỏi cho sản phẩm này"
              rules={[
                { required: true, message: "Vui lòng nhập nội dung câu hỏi" },
                { min: 10, message: "Nội dung cần tối thiểu 10 ký tự" },
                { max: 1000, message: "Nội dung tối đa 1000 ký tự" },
              ]}
            >
              <TextArea rows={3} maxLength={1000} showCount placeholder="Bạn muốn hỏi gì về sản phẩm này?" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={askQuestion.isPending}>
              Gửi câu hỏi
            </Button>
          </Form>
        ) : (
          <div style={{ marginBottom: 24 }}>
            <Link href={`/login?returnUrl=${encodeURIComponent(`${pathname}#qa`)}`}>Đăng nhập để đặt câu hỏi</Link>
          </div>
        ))}

      {isLoading ? (
        <div style={{ textAlign: "center", padding: 24 }}>
          <Spin />
        </div>
      ) : isError ? (
        <Text type="danger">Không tải được danh sách câu hỏi</Text>
      ) : !data || data.items.length === 0 ? (
        <Empty description="Chưa có câu hỏi nào" />
      ) : (
        <div>
          {data.items.map((question) => (
            <div key={question.id} style={{ borderBottom: "1px solid var(--color-border)", padding: "16px 0" }}>
              <div style={{ margin: "4px 0" }}>
                <Text strong>{question.authorName}</Text>
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  {dayjs(question.createdAt).format("DD/MM/YYYY")}
                </Text>
              </div>
              <Paragraph style={{ whiteSpace: "pre-wrap", marginBottom: question.answerContent ? 8 : 0 }}>
                {question.content}
              </Paragraph>
              {question.answerContent && (
                <div
                  style={{
                    marginLeft: 16,
                    padding: 12,
                    background: "var(--color-page)",
                    borderRadius: 8,
                  }}
                >
                  <Text strong>Phản hồi từ người bán</Text>
                  {question.answeredAt && (
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      {dayjs(question.answeredAt).format("DD/MM/YYYY")}
                    </Text>
                  )}
                  <Paragraph style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>{question.answerContent}</Paragraph>
                </div>
              )}
              {user?.id === question.userId && (
                <Popconfirm
                  title="Xoá câu hỏi này?"
                  okText="Xoá"
                  cancelText="Đóng"
                  okButtonProps={{ danger: true, loading: deleteQuestion.isPending }}
                  onConfirm={() => handleDelete(question.id)}
                >
                  <Button size="small" danger type="link" style={{ paddingLeft: 0 }}>
                    Xoá
                  </Button>
                </Popconfirm>
              )}
            </div>
          ))}
          <Pagination
            style={{ marginTop: 16, textAlign: "center" }}
            current={data.pagination.page}
            pageSize={data.pagination.pageSize}
            total={data.pagination.totalCount}
            showSizeChanger={false}
            onChange={setPage}
          />
        </div>
      )}
    </section>
  );
}
