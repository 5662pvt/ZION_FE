import { Alert, Button } from "antd";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = "Đã có lỗi xảy ra, vui lòng thử lại", onRetry }: ErrorStateProps) {
  return (
    <Alert
      type="error"
      showIcon
      message={message}
      action={
        onRetry && (
          <Button size="small" onClick={onRetry}>
            Thử lại
          </Button>
        )
      }
    />
  );
}
