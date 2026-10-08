export default function ShopFooter() {
  return (
    <footer
      style={{
        padding: "24px",
        textAlign: "center",
        color: "#8c8c8c",
        borderTop: "1px solid #f0f0f0",
        marginTop: 48,
      }}
    >
      © {new Date().getFullYear()} ZIONShop. All rights reserved.
    </footer>
  );
}
