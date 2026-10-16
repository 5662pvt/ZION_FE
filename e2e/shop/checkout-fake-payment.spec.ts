import { test, expect } from "../fixtures/test";
import { proceedToCheckoutReview } from "../fixtures/ui";

test("khách thanh toán online qua cổng giả lập và đơn chuyển sang đã thanh toán", async ({
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
  await proceedToCheckoutReview(page, "Card");
  await expect(page.getByText("Thẻ (Visa/Master/JCB)")).toBeVisible();

  await page.getByRole("button", { name: "Đặt hàng" }).click();

  // Đơn đang PendingStock (giữ hàng bất đồng bộ) rồi chuyển AwaitingPayment, FE tự tạo payment intent
  // và chuyển sang trang cổng thanh toán giả lập.
  await page.waitForURL(/\/checkout\/pay\//, { timeout: 25_000 });
  await expect(page.getByText("Cổng thanh toán thử nghiệm")).toBeVisible();

  await page.getByRole("button", { name: "Thanh toán thành công" }).click();

  await page.waitForURL(/\/orders\/.+\?payment=success/, { timeout: 15_000 });
  await expect(page.getByText("Thanh toán thành công, đang chờ xác nhận đơn hàng.")).toBeVisible();

  const orderId = page.url().match(/\/orders\/([0-9a-fA-F-]+)/)?.[1];
  expect(orderId).toBeTruthy();

  // Đơn chuyển Paid bất đồng bộ (webhook/sự kiện xử lý thanh toán) - chờ qua API rồi xác nhận UI cũng cập nhật theo.
  const order = await api.waitForOrderStatus(request, customerToken, orderId!, ["Paid"], 20_000);
  expect(order.status).toBe("Paid");

  await expect(page.getByText("Đã thanh toán", { exact: true }).first()).toBeVisible({ timeout: 20_000 });
});
