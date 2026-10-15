import { Flex, Typography } from "antd";

const { Text } = Typography;

const POLICY_ITEMS = ["Giao hàng nhanh chóng toàn quốc", "Đổi trả trong 7 ngày", "Thanh toán an toàn, bảo mật"];

export default function PolicyStrip() {
  return (
    <Flex wrap="wrap" gap={24} justify="center">
      {POLICY_ITEMS.map((item) => (
        <Text key={item} style={{ color: "var(--color-muted)", fontWeight: 500 }}>
          {item}
        </Text>
      ))}
    </Flex>
  );
}
