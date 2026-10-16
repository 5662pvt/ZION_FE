# E2E Tests (Playwright)

Bộ test E2E đầu tiên cho ZION_FE, chạy trên trình duyệt thật (Chromium headless shell) với BE thật.

## Yêu cầu trước khi chạy

- Backend API đang chạy ở `http://localhost:8080` (môi trường Development, Postgres local, RabbitMQ, Redis, rate limit đã được nâng — vd `RateLimiting__AuthPermitLimit=1000`). Kiểm tra: `GET http://localhost:8080/health/live`.
- Các tài khoản đã seed sẵn (email đã confirm):
  - `admin@zionshop.local` / `Admin@123` (roles Admin + Customer)
  - `staff@zionshop.local` / `Staff@123`
  - `customer@zionshop.local` / `Customer@123`
- Đã cài Chromium headless shell cho Playwright (`npx playwright install` — đã cài sẵn trong môi trường CI/dev chuẩn, không cần cài lại).
- Không cần tự chạy `npm run dev` — Playwright tự khởi động Next dev server ở cổng 3000 qua `webServer` trong `playwright.config.ts` (`reuseExistingServer: true`, chỉ một Next dev server được phép chạy trong thư mục này do giới hạn của Next 16).

## Chạy test

```bash
npm run e2e            # chạy toàn bộ suite (headless)
npm run e2e:ui         # chạy ở UI mode để xem từng bước
npm run e2e:report     # mở lại report HTML lần chạy gần nhất
```

Biến môi trường override (tuỳ chọn): `E2E_BASE_URL` (mặc định `http://localhost:3000`), `E2E_API_URL` (mặc định `http://localhost:8080`).

## Cấu trúc

- `playwright.config.ts` — project `setup` (đăng nhập, lưu `storageState`) chạy trước, project `chromium` phụ thuộc vào nó. `workers: 1` vì các test dùng chung tài khoản customer đã seed và giỏ hàng của tài khoản đó.
- `e2e/setup/auth.setup.ts` — đăng nhập qua UI cho `customer` và `admin`, lưu `storageState` vào `e2e/.auth/*.json` (gitignored). `accessToken` của app chỉ nằm trong biến JS (không ở localStorage) nhưng `refreshToken` có trong localStorage — khi mở lại bằng `storageState`, `AuthProvider` tự gọi `/auth/refresh` lúc mount để khôi phục access token, nên `storageState` là đủ, không cần đăng nhập lại qua UI trong mỗi test.
- `e2e/fixtures/api.ts` — helper gọi BE trực tiếp qua Playwright `request` (đăng nhập lấy token, tạo + publish sản phẩm, chỉnh tồn kho, xoá giỏ hàng, lấy/tạo địa chỉ giao hàng, đọc đơn hàng, đặt hàng kèm Idempotency-Key).
- `e2e/fixtures/test.ts` — mở rộng `test` của Playwright với fixture `adminToken`, `customerToken`, `api`.
- `e2e/fixtures/ui.ts` — helper UI dùng chung (tìm sản phẩm ở trang `/products`, đi qua các bước checkout).
- `e2e/shop/*.spec.ts`, `e2e/admin/*.spec.ts` — các spec nghiệp vụ.

## Các spec

| File | Nội dung |
| --- | --- |
| `shop/checkout-happy.spec.ts` | Tìm sản phẩm ở trang sản phẩm → thêm giỏ → qua 3 bước thanh toán (địa chỉ có sẵn qua API, COD) → đặt hàng → vào trang chi tiết đơn → đơn xuất hiện trong "Đơn hàng của tôi" với tổng tiền đúng. |
| `shop/checkout-fake-payment.spec.ts` | Thanh toán online qua cổng giả lập, mô phỏng thành công, kiểm tra cả UI và API đơn chuyển trạng thái "Đã thanh toán". |
| `admin/order-processing.spec.ts` | Khách đặt hàng COD (qua UI) → đơn tự chuyển "Đã xác nhận" (bất đồng bộ) → admin bấm Giao hàng → Hoàn tất → khách thấy trạng thái mới trong "Đơn hàng của tôi". |
| `shop/out-of-stock.spec.ts` | (a) Sản phẩm chỉ còn 1: không thể tăng số lượng chọn mua vượt tồn kho (nút "Tăng số lượng" bị khoá). (b) Thêm vào giỏ lúc còn hàng, admin chỉnh tồn kho về 0, đặt hàng bị chặn với thông báo "Không đủ hàng". |
| `shop/coupon-invalid.spec.ts` | Nhập mã giảm giá sai ở trang thanh toán → hiển thị lỗi "Mã giảm giá không tồn tại", tổng tiền không đổi, vẫn đặt hàng được không cần mã. |
| `shop/duplicate-submit.spec.ts` | (UI) Double-click nút "Đặt hàng" chỉ tạo đúng 1 đơn. (API) Gọi `POST /orders` 2 lần cùng `Idempotency-Key` + cùng body → cùng `orderId`, lần 2 có header `Idempotent-Replayed: true`; cùng key nhưng body khác → 409 `Orders.IdempotencyKeyReused`. |

## Debug khi fail

- Mỗi lần fail tự lưu trace, screenshot, video (`trace: 'retain-on-failure'`, …). Xem report: `npm run e2e:report`, mở trace bằng nút "trace" trong report hoặc `npx playwright show-trace <file>.zip`.
- Chạy 1 file/1 test cụ thể: `npx playwright test e2e/shop/out-of-stock.spec.ts` hoặc `npx playwright test -g "tên test"`.
- Chạy có đầu UI thật (không headless) để xem trực tiếp: `npx playwright test --headed`.
