import Link from "next/link";

const COLUMN_TITLE_STYLE = { color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: "var(--space-3)" };
const LINK_STYLE = { color: "rgba(255,255,255,0.75)", display: "block", marginBottom: "var(--space-2)" };
const TEXT_STYLE = { color: "rgba(255,255,255,0.75)", display: "block", marginBottom: "var(--space-2)" };

export default function ShopFooter() {
  return (
    <footer style={{ background: "var(--color-primary)", color: "#fff", marginTop: "var(--space-8)" }}>
      <div
        style={{
          maxWidth: "var(--content-max)",
          margin: "0 auto",
          padding: "var(--space-7) 16px var(--space-5)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "var(--space-6)",
        }}
      >
        <div>
          <div style={COLUMN_TITLE_STYLE}>Hỗ trợ khách hàng</div>
          <Link href="/account/orders" style={LINK_STYLE}>
            Tra cứu đơn hàng
          </Link>
          <Link href="/account" style={LINK_STYLE}>
            Tài khoản của tôi
          </Link>
          <Link href="/cart" style={LINK_STYLE}>
            Giỏ hàng
          </Link>
        </div>

        <div>
          <div style={COLUMN_TITLE_STYLE}>Chính sách</div>
          <span style={TEXT_STYLE}>Giao hàng: 3-5 ngày làm việc trên toàn quốc.</span>
          <span style={TEXT_STYLE}>Đổi trả: trong 7 ngày nếu sản phẩm còn nguyên vẹn.</span>
        </div>

        <div>
          <div style={COLUMN_TITLE_STYLE}>Liên hệ</div>
          <span style={TEXT_STYLE}>Email: support@zionshop.local</span>
          <span style={TEXT_STYLE}>Hotline: 1900 000 000</span>
        </div>

        <div>
          <div style={COLUMN_TITLE_STYLE}>Phương thức thanh toán</div>
          <span style={TEXT_STYLE}>Thanh toán khi nhận hàng (COD)</span>
          <span style={TEXT_STYLE}>Thẻ (giả lập), Ví điện tử (giả lập), Chuyển khoản (giả lập)</span>
        </div>
      </div>
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.15)",
          textAlign: "center",
          fontSize: 13,
          color: "rgba(255,255,255,0.6)",
          padding: "var(--space-3) 16px",
        }}
      >
        © {new Date().getFullYear()} ZIONShop. All rights reserved.
      </div>
    </footer>
  );
}
