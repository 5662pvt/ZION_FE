import type { ThemeConfig } from "antd";

const COLOR_PRIMARY = "#142B4A";
const COLOR_ACTION = "#0F9D8A";
const COLOR_ACTION_HOVER = "#0B7F72";
const COLOR_PAGE = "#F6F8FB";
const COLOR_SURFACE = "#FFFFFF";
const COLOR_TEXT = "#172B4D";
const COLOR_MUTED = "#66758A";
const COLOR_BORDER = "#E2E8F0";
const COLOR_SUCCESS = "#16845B";
const COLOR_WARNING = "#B7791F";
const COLOR_DANGER = "#C2413B";
const COLOR_ACCENT_BG = "#E8F4FF";
const COLOR_ACCENT_BORDER = "#B8DEFA";
const COLOR_SUCCESS_BG = "#E7F5EE";
const COLOR_SUCCESS_BORDER = "#A7D9BF";
const COLOR_WARNING_BG = "#FBF3E4";
const COLOR_WARNING_BORDER = "#EBCF96";
const COLOR_ERROR_BG = "#FBECEB";
const COLOR_ERROR_BORDER = "#EDB5B2";
const FONT_FAMILY = "var(--font-inter), system-ui, \"Segoe UI\", sans-serif";

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: COLOR_ACTION,
    colorLink: COLOR_ACTION,
    colorLinkHover: COLOR_ACTION_HOVER,
    colorSuccess: COLOR_SUCCESS,
    colorWarning: COLOR_WARNING,
    colorError: COLOR_DANGER,
    colorInfo: COLOR_PRIMARY,
    colorInfoBg: COLOR_ACCENT_BG,
    colorInfoBorder: COLOR_ACCENT_BORDER,
    colorSuccessBg: COLOR_SUCCESS_BG,
    colorSuccessBorder: COLOR_SUCCESS_BORDER,
    colorWarningBg: COLOR_WARNING_BG,
    colorWarningBorder: COLOR_WARNING_BORDER,
    colorErrorBg: COLOR_ERROR_BG,
    colorErrorBorder: COLOR_ERROR_BORDER,
    colorText: COLOR_TEXT,
    colorTextSecondary: COLOR_MUTED,
    colorBorder: COLOR_BORDER,
    colorBgLayout: COLOR_PAGE,
    colorBgContainer: COLOR_SURFACE,
    borderRadius: 8,
    borderRadiusLG: 12,
    fontFamily: FONT_FAMILY,
    controlHeight: 40,
    controlHeightLG: 44,
  },
  components: {
    Layout: {
      headerBg: COLOR_SURFACE,
      siderBg: COLOR_PRIMARY,
      bodyBg: COLOR_PAGE,
    },
    Menu: {
      darkItemBg: COLOR_PRIMARY,
      darkItemSelectedBg: COLOR_ACTION,
      darkItemColor: "rgba(255, 255, 255, 0.85)",
      darkItemHoverColor: "#FFFFFF",
    },
    Button: {
      primaryShadow: "none",
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 44,
    },
    Card: {
      borderRadiusLG: 12,
      boxShadowTertiary: "0 2px 8px rgb(20 43 74 / 6%)",
    },
    Table: {
      headerBg: "#F8FAFC",
      cellPaddingBlock: 14,
    },
  },
};

export default antdTheme;
