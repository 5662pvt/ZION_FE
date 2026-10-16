import { test as setup } from "@playwright/test";
import path from "node:path";

const ACCOUNTS = {
  customer: { email: "customer@zionshop.local", password: "Customer@123" },
  admin: { email: "admin@zionshop.local", password: "Admin@123" },
} as const;

async function loginAndSave(
  page: import("@playwright/test").Page,
  email: string,
  password: string,
  storageStatePath: string
): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 15_000 });
  await page.context().storageState({ path: storageStatePath });
}

setup("đăng nhập khách hàng và lưu session", async ({ page }) => {
  await loginAndSave(page, ACCOUNTS.customer.email, ACCOUNTS.customer.password, path.join(__dirname, "..", ".auth", "customer.json"));
});

setup("đăng nhập admin và lưu session", async ({ page }) => {
  await loginAndSave(page, ACCOUNTS.admin.email, ACCOUNTS.admin.password, path.join(__dirname, "..", ".auth", "admin.json"));
});
