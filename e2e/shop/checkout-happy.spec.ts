import { test, expect } from "../fixtures/test";
import { searchAndOpenProduct, proceedToCheckoutReview } from "../fixtures/ui";

test("khách mua hàng COD thành công qua 3 bước thanh toán", async ({ page, request, adminToken, customerToken, api }) => {
  await api.clearCart(request, customerToken);
  await api.getOrCreateAddressId(request, customerToken);
  const product = await api.createPublishedProduct(request, adminToken, { stock: 10 });

  await searchAndOpenProduct(page, product.name);
  await expect(page).toHaveURL(new RegExp(`/products/${product.slug}`));

  await page.getByRole("button", { name: "Thêm vào giỏ" }).first().click();
  await expect(page.getByText("Đã thêm vào giỏ", { exact: false })).toBeVisible();

  await page.goto("/cart");
  await expect(page.getByText(product.name)).toBeVisible();

  await page.locator(".cart-summary-desktop").getByRole("button", { name: "Thanh toán" }).click();
  await expect(page).toHaveURL(/\/checkout$/);

  await expect(page.getByRole("radio").first()).toBeChecked();
  await proceedToCheckoutReview(page, "COD");

  await expect(page.getByText("Thanh toán khi nhận hàng", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Đặt hàng" }).click();

  await page.waitForURL(/\/orders\//, { timeout: 15_000 });
  await expect(page.getByText(/Đơn hàng ZS/)).toBeVisible();

  const orderId = page.url().match(/\/orders\/([0-9a-fA-F-]+)/)?.[1];
  expect(orderId).toBeTruthy();

  const expectedTotal = product.price + 30_000; // + phí vận chuyển mặc định (dưới ngưỡng miễn phí)
  const order = await api.getOrder(request, customerToken, orderId!);
  expect(order.total).toBe(expectedTotal);

  await page.goto("/account/orders");
  const row = page.getByRole("link", { name: order.code });
  await expect(row).toBeVisible();
  const rowContainer = page.locator("tr", { has: row }).first();
  await expect(rowContainer).toContainText(expectedTotal.toLocaleString("vi-VN"));
});
