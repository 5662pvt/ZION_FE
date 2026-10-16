import { test, expect } from "../fixtures/test";
import { proceedToCheckoutReview } from "../fixtures/ui";

test("sản phẩm chỉ còn 1: không mua được số lượng vượt tồn kho và đơn bị chặn khi hết hàng", async ({
  page,
  request,
  adminToken,
  customerToken,
  api,
}) => {
  await api.clearCart(request, customerToken);
  await api.getOrCreateAddressId(request, customerToken);
  const product = await api.createPublishedProduct(request, adminToken, { stock: 1 });

  // (a) Trang chi tiết sản phẩm chặn việc chọn số lượng vượt tồn kho còn lại.
  await page.goto(`/products/${product.slug}`);
  await expect(page.getByText("Chỉ còn 1 sản phẩm")).toBeVisible();

  const increaseButton = page.getByRole("button", { name: "Tăng số lượng" });
  await expect(increaseButton).toBeDisabled();
  await increaseButton.click({ force: true }).catch(() => undefined);
  await expect(page.getByRole("spinbutton", { name: "Số lượng" })).toHaveValue("1");

  // (b) Thêm vào giỏ lúc còn hàng, sau đó admin chỉnh tồn kho về 0 - đặt hàng phải bị chặn.
  await page.getByRole("button", { name: "Thêm vào giỏ" }).first().click();
  await expect(page.getByText("Đã thêm vào giỏ", { exact: false })).toBeVisible();

  const ordersCountBefore = await api.myOrdersCount(request, customerToken);

  await api.adjustStock(request, adminToken, product.id, -1, "E2E: hết hàng trước khi đặt");

  await page.goto("/checkout");
  await proceedToCheckoutReview(page, "COD");
  await page.getByRole("button", { name: "Đặt hàng" }).click();

  await expect(page.getByText("Không đủ hàng", { exact: true })).toBeVisible();
  await expect(page.getByText(new RegExp(`Không đủ hàng cho: ${product.name}.*Vui lòng cập nhật giỏ hàng`))).toBeVisible();
  await expect(page).toHaveURL(/\/checkout$/);

  const ordersCountAfter = await api.myOrdersCount(request, customerToken);
  expect(ordersCountAfter).toBe(ordersCountBefore);
});
