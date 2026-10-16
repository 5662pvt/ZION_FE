import { test, expect } from "../fixtures/test";
import { loginViaUi, proceedToCheckoutReview } from "../fixtures/ui";

test("admin xác nhận, giao hàng và hoàn tất đơn; khách thấy trạng thái mới trong Đơn hàng của tôi", async ({
  browser,
  request,
  adminToken,
  customerToken,
  api,
}) => {
  await api.clearCart(request, customerToken);
  await api.getOrCreateAddressId(request, customerToken);
  const product = await api.createPublishedProduct(request, adminToken, { stock: 10 });

  const customerContext = await browser.newContext();
  const customerPage = await customerContext.newPage();
  await loginViaUi(customerPage, "customer");

  await customerPage.goto(`/products/${product.slug}`);
  await customerPage.getByRole("button", { name: "Thêm vào giỏ" }).first().click();
  await expect(customerPage.getByText("Đã thêm vào giỏ", { exact: false })).toBeVisible();

  await customerPage.goto("/checkout");
  await proceedToCheckoutReview(customerPage, "COD");
  await customerPage.getByRole("button", { name: "Đặt hàng" }).click();
  await customerPage.waitForURL(/\/orders\//, { timeout: 15_000 });

  const orderId = customerPage.url().match(/\/orders\/([0-9a-fA-F-]+)/)![1];
  const placedOrder = await api.getOrder(request, customerToken, orderId);
  const orderCode = placedOrder.code;

  // COD tự chuyển PendingStock -> Confirmed bất đồng bộ sau khi giữ hàng xong (không có bước "xác nhận" thủ công).
  await api.waitForOrderStatus(request, customerToken, orderId, ["Confirmed"], 20_000);

  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await loginViaUi(adminPage, "admin");

  await adminPage.goto("/admin/orders");
  await adminPage.getByPlaceholder("Mã đơn / tên / SĐT").fill(orderCode);
  await adminPage.getByPlaceholder("Mã đơn / tên / SĐT").press("Enter");
  await adminPage.getByRole("link", { name: orderCode }).click();
  await adminPage.waitForURL(/\/admin\/orders\//, { timeout: 15_000 });

  await adminPage.getByRole("button", { name: "Giao hàng" }).click();
  await adminPage.getByRole("button", { name: "Đồng ý" }).click();
  await expect(adminPage.getByText("Đã chuyển đơn sang giao hàng")).toBeVisible();

  await adminPage.getByRole("button", { name: "Hoàn tất" }).click();
  await adminPage.getByRole("button", { name: "Đồng ý" }).click();
  await expect(adminPage.getByText("Đã hoàn tất đơn hàng")).toBeVisible();

  const finalOrder = await api.getOrder(request, customerToken, orderId);
  expect(finalOrder.status).toBe("Completed");

  await customerPage.goto("/account/orders");
  const row = customerPage.getByRole("link", { name: orderCode });
  await expect(row).toBeVisible();
  const rowContainer = customerPage.locator("tr", { has: row }).first();
  await expect(rowContainer).toContainText("Hoàn tất");

  await customerContext.close();
  await adminContext.close();
});
