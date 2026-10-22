interface XuCoinIconProps {
  size?: number;
}

export default function XuCoinIcon({ size = 16 }: XuCoinIconProps) {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #ffd666, #d4a017)",
        color: "#7a4f01",
        fontSize: size * 0.6,
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      X
    </span>
  );
}
