import { test, expect } from "../fixtures/test";

test("mã giảm giá sai hiển thị lỗi, tổng tiền không đổi và vẫn đặt hàng được không cần mã", async ({
  page,
  request,
  adminToken,
  customerToken,
  api,
}) => {
  await api.clearCart(request, customerToken);
  await api.getOrCreateAddressId(request, customerToken);
  const product = await api.createPublishedProduct(request, adminToken, { stock: 10 });

  await page.goto(`/products/${product.slug}`);
  await page.getByRole("button", { name: "Thêm vào giỏ" }).first().click();
  await expect(page.getByText("Đã thêm vào giỏ", { exact: false })).toBeVisible();

  await page.goto("/checkout");

  const expectedTotal = product.price + 30_000;
  const totalText = expectedTotal.toLocaleString("vi-VN");
  await expect(page.getByText(totalText, { exact: false })).toBeVisible();

  await page.getByPlaceholder("Mã giảm giá").fill("SAI-MA-E2E-XYZ");
  await page.getByRole("button", { name: "Áp dụng" }).click();

  await expect(page.getByText("Mã giảm giá không tồn tại")).toBeVisible();
  await expect(page.getByText(totalText, { exact: false })).toBeVisible();

  await page.getByRole("button", { name: "Tiếp theo" }).click();
  await page.getByRole("button", { name: "Tiếp theo" }).click();
  await page.getByRole("button", { name: "Đặt hàng" }).click();

  await page.waitForURL(/\/orders\//, { timeout: 15_000 });
  const order = await api.getOrder(request, customerToken, page.url().match(/\/orders\/([0-9a-fA-F-]+)/)![1]);
  expect(order.total).toBe(expectedTotal);
});
