const ANNOUNCEMENT_TEXT = "Miễn phí vận chuyển cho đơn hàng đủ điều kiện";

export default function AnnouncementBar() {
  if (!ANNOUNCEMENT_TEXT) return null;

  return (
    <div
      style={{
        background: "var(--color-primary)",
        color: "#fff",
        textAlign: "center",
        fontSize: 13,
        padding: "6px 16px",
      }}
    >
      {ANNOUNCEMENT_TEXT}
    </div>
  );
}
