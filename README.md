# ZIONShop FE

Storefront & admin back-office cho **ZIONShop** — Next.js 16 (App Router) + TypeScript + antd 5 + TanStack Query.

Backend tương ứng: repo `ZION_BE` (ASP.NET Core, route `api/v1/*`, envelope `{ success, message, data, errors, pagination }`).

## Môi trường

Sao chép `.env.example` thành `.env.local` và chỉnh `NEXT_PUBLIC_API_URL` cho đúng backend đang chạy (mặc định `http://localhost:8080`).

```bash
cp .env.example .env.local
```

## Chạy dự án

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

## Cấu trúc

- `app/(shop)/` — storefront (route group, không ảnh hưởng URL)
- `app/(auth)/` — layout đăng nhập/đăng ký (các trang sẽ thêm ở giai đoạn sau)
- `app/admin/` — back-office, yêu cầu đăng nhập + role `Admin`/`Staff` (`AdminGuard`)
- `services/*.service.ts` — nơi duy nhất gọi API, qua `services/apiClient.ts`
- `hooks/use*.ts` — TanStack Query hook bọc service, page/component chỉ gọi hook
- `types/*.ts` — DTO khớp 1-1 với backend `ZIONShop.Api`
- `constants/roles.ts`, `constants/queryKeys.ts` — hằng số dùng chung, không hardcode chuỗi role hoặc query key rời rạc
