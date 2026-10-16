import { test as base, expect } from "@playwright/test";
import * as api from "./api";
import { loginViaUi } from "./ui";

interface Fixtures {
  adminToken: string;
  customerToken: string;
  api: typeof api;
}

export const test = base.extend<Fixtures>({
  // Mỗi test tự đăng nhập lại qua UI (xem lý do ở loginViaUi) - trả về trang đã đăng nhập làm khách hàng.
  page: async ({ page }, provide) => {
    await loginViaUi(page, "customer");
    await provide(page);
  },
  adminToken: async ({ request }, provide) => {
    const session = await api.login(request, "admin");
    await provide(session.accessToken);
  },
  customerToken: async ({ request }, provide) => {
    const session = await api.login(request, "customer");
    await provide(session.accessToken);
  },
  api: async ({}, provide) => {
    await provide(api);
  },
});

export { expect };
