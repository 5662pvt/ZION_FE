import type { Page } from "@playwright/test";

const CREDENTIALS = {
  customer: { email: "customer@zionshop.local", password: "Customer@123" },
  admin: { email: "admin@zionshop.local", password: "Admin@123" },
} as const;

/**
 * Logs in via the real login form. We re-login per test/page rather than reusing a saved
 * storageState: the backend rotates (invalidates) the refresh token on every /auth/refresh call,
 * so a storageState snapshot captured once only works for its first consumer - every later test
 * that loads the same file gets redirected back to /login.
 */
export async function loginViaUi(page: Page, role: keyof typeof CREDENTIALS): Promise<void> {
  const { email, password } = CREDENTIALS[role];
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 15_000 });
}

/** Searches the storefront product list (scoped to avoid matching the header search box) and opens the result. */
export async function searchAndOpenProduct(page: Page, productName: string): Promise<void> {
  await page.goto("/products");
  const search = page.locator(".products-page").getByPlaceholder("Tìm sản phẩm...");
  await search.fill(productName);
  await search.press("Enter");
  await page.getByRole("link", { name: new RegExp(productName) }).first().click();
}

export type CheckoutPaymentOption = "COD" | "Card" | "EWallet" | "BankTransfer";

const PAYMENT_LABELS: Record<CheckoutPaymentOption, string> = {
  COD: "Thanh toán khi nhận hàng",
  Card: "Thẻ (Visa/Master/JCB)",
  EWallet: "Ví điện tử (Momo, ZaloPay, ShopeePay)",
  BankTransfer: "Chuyển khoản ngân hàng",
};

/** Walks the checkout stepper from the address step (already pre-selected) to the review step. */
export async function proceedToCheckoutReview(page: Page, paymentOption: CheckoutPaymentOption = "COD"): Promise<void> {
  await page.getByRole("button", { name: "Tiếp theo" }).click();

  if (paymentOption !== "COD") {
    await page.getByRole("radio", { name: PAYMENT_LABELS[paymentOption] }).check();
  }
  await page.getByRole("button", { name: "Tiếp theo" }).click();
}
