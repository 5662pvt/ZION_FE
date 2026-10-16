import { test, expect } from "../fixtures/test";
import { proceedToCheckoutReview } from "../fixtures/ui";
import { ApiCallError } from "../fixtures/api";

test.describe("Chống đặt hàng trùng", () => {
  test("UI: double-click nút Đặt hàng chỉ tạo đúng 1 đơn", async ({ page, request, adminToken, customerToken, api }) => {
    await api.clearCart(request, customerToken);
    await api.getOrCreateAddressId(request, customerToken);
    const product = await api.createPublishedProduct(request, adminToken, { stock: 10 });

    await page.goto(`/products/${product.slug}`);
    await page.getByRole("button", { name: "Thêm vào giỏ" }).first().click();
    await expect(page.getByText("Đã thêm vào giỏ", { exact: false })).toBeVisible();

    await page.goto("/checkout");
    await proceedToCheckoutReview(page, "COD");

    const ordersCountBefore = await api.myOrdersCount(request, customerToken);

    // dblclick() mô phỏng double-click thật (down-up-down-up liên tiếp) trong 1 action của Playwright -
    // sát với hành vi người dùng bấm nhanh 2 lần hơn là tự bắn 2 click rời rạc.
    await page.getByRole("button", { name: "Đặt hàng" }).dblclick();

    await page.waitForURL(/\/orders\//, { timeout: 15_000 });

    const ordersCountAfter = await api.myOrdersCount(request, customerToken);
    expect(ordersCountAfter).toBe(ordersCountBefore + 1);
  });
});

test.describe("API: Idempotency-Key", () => {
  test("cùng key + cùng body trả về cùng đơn, cùng key + body khác bị 409", async ({ request, adminToken, customerToken, api }) => {
    await api.clearCart(request, customerToken);
    const address = await api.getOrCreateAddressId(request, customerToken);
    const product = await api.createPublishedProduct(request, adminToken, { stock: 10 });
    await api.addCartItem(request, customerToken, product.id, 1);

    const idempotencyKey = `e2e-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const body = { addressId: address.id, paymentMethod: "COD" as const, note: "Lần đặt đầu tiên" };

    const first = await api.placeOrder(request, customerToken, body, idempotencyKey);
    expect(first.replayed).toBe(false);

    const second = await api.placeOrder(request, customerToken, body, idempotencyKey);
    expect(second.order.id).toBe(first.order.id);
    expect(second.replayed).toBe(true);

    let caught: ApiCallError | null = null;
    try {
      await api.placeOrder(request, customerToken, { ...body, note: "Nội dung khác" }, idempotencyKey);
    } catch (err) {
      caught = err as ApiCallError;
    }

    expect(caught).not.toBeNull();
    expect(caught!.status).toBe(409);
    expect(caught!.code).toBe("Orders.IdempotencyKeyReused");
  });
});
