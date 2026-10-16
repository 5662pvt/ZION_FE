import type { APIRequestContext, APIResponse } from "@playwright/test";

const API_URL = process.env.E2E_API_URL ?? "http://localhost:8080";

export type Role = "admin" | "staff" | "customer";

const CREDENTIALS: Record<Role, { email: string; password: string }> = {
  admin: { email: "admin@zionshop.local", password: "Admin@123" },
  staff: { email: "staff@zionshop.local", password: "Staff@123" },
  customer: { email: "customer@zionshop.local", password: "Customer@123" },
};

interface ApiFieldError {
  field: string | null;
  code: string;
  message: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors: ApiFieldError[];
  pagination?: { page: number; pageSize: number; totalCount: number; totalPages: number };
}

export class ApiCallError extends Error {
  status: number;
  code: string | null;
  errors: ApiFieldError[];

  constructor(action: string, status: number, message: string, errors: ApiFieldError[] = []) {
    super(`${action} failed (${status}): ${message}`);
    this.status = status;
    this.code = errors[0]?.code ?? null;
    this.errors = errors;
  }
}

async function unwrap<T>(res: APIResponse, action: string): Promise<T> {
  const body = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok() || !body.success) {
    throw new ApiCallError(action, res.status(), body.message, body.errors ?? []);
  }
  return body.data;
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export interface AuthSession {
  accessToken: string;
  userId: string;
  email: string;
}

export async function login(request: APIRequestContext, role: Role): Promise<AuthSession> {
  const { email, password } = CREDENTIALS[role];
  const res = await request.post(`${API_URL}/api/v1/auth/login`, { data: { email, password } });
  const data = await unwrap<{ accessToken: string; userId: string; email: string }>(res, `login(${role})`);
  return { accessToken: data.accessToken, userId: data.userId, email: data.email };
}

function uniqueTag(label?: string): string {
  const base = `${Date.now()}${Math.floor(Math.random() * 1_000_000)}`;
  return label ? `${base}${label}` : base;
}

export interface CreatedProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
}

export async function createPublishedProduct(
  request: APIRequestContext,
  adminToken: string,
  opts: { stock: number; price?: number; nameTag?: string }
): Promise<CreatedProduct> {
  const price = opts.price ?? 150_000;
  const tag = uniqueTag(opts.nameTag);
  const name = `Sản phẩm E2E ${tag}`;
  const slug = `e2e-${tag}`;
  const sku = `E2E-${tag}`;

  const categories = await unwrap<{ id: string }[]>(
    await request.get(`${API_URL}/api/v1/categories?tree=false`, { headers: authHeaders(adminToken) }),
    "getCategories"
  );
  const categoryId: string | undefined = categories[0]?.id;

  const created = await unwrap<{ id: string }>(
    await request.post(`${API_URL}/api/v1/products`, {
      headers: authHeaders(adminToken),
      data: { name, slug, sku, price, currency: "VND", categoryId },
    }),
    "createProduct"
  );

  await unwrap(
    await request.post(`${API_URL}/api/v1/products/${created.id}/publish`, { headers: authHeaders(adminToken) }),
    "publishProduct"
  );

  if (opts.stock > 0) {
    await adjustStock(request, adminToken, created.id, opts.stock, "E2E seed stock");
  }

  return { id: created.id, name, slug, sku, price };
}

export async function adjustStock(
  request: APIRequestContext,
  adminToken: string,
  productId: string,
  delta: number,
  reason = "E2E stock adjustment"
): Promise<void> {
  await unwrap(
    await request.post(`${API_URL}/api/v1/inventory/products/${productId}/adjust`, {
      headers: authHeaders(adminToken),
      data: { delta, reason },
    }),
    "adjustStock"
  );
}

export async function clearCart(request: APIRequestContext, customerToken: string): Promise<void> {
  const res = await request.delete(`${API_URL}/api/v1/cart`, { headers: authHeaders(customerToken) });
  await unwrap(res, "clearCart");
}

export async function addCartItem(
  request: APIRequestContext,
  customerToken: string,
  productId: string,
  quantity: number
): Promise<void> {
  await unwrap(
    await request.post(`${API_URL}/api/v1/cart/items`, {
      headers: authHeaders(customerToken),
      data: { productId, quantity },
    }),
    "addCartItem"
  );
}

export interface AddressRef {
  id: string;
  recipientName: string;
}

/** Returns an existing address for the customer, or creates one with valid test data if none exist. */
export async function getOrCreateAddressId(request: APIRequestContext, customerToken: string): Promise<AddressRef> {
  const existing = await unwrap<{ id: string; recipientName: string; isDefault: boolean }[]>(
    await request.get(`${API_URL}/api/v1/users/me/addresses`, { headers: authHeaders(customerToken) }),
    "listAddresses"
  );
  if (existing.length > 0) {
    const chosen = existing.find((a) => a.isDefault) ?? existing[0];
    return { id: chosen.id, recipientName: chosen.recipientName };
  }

  const recipientName = "Nguyễn E2E Test";
  const created = await unwrap<{ id: string; recipientName: string }>(
    await request.post(`${API_URL}/api/v1/users/me/addresses`, {
      headers: authHeaders(customerToken),
      data: {
        recipientName,
        phoneNumber: "0912345678",
        province: "Hà Nội",
        ward: "Phường Ba Đình",
        streetAddress: "123 Đường Láng",
        isDefault: true,
      },
    }),
    "addAddress"
  );
  return { id: created.id, recipientName: created.recipientName };
}

export interface OrderDto {
  id: string;
  code: string;
  status: string;
  total: number;
  cancelReason: string | null;
}

export async function myOrders(request: APIRequestContext, customerToken: string): Promise<OrderDto[]> {
  const res = await request.get(`${API_URL}/api/v1/orders/mine?pageSize=100`, { headers: authHeaders(customerToken) });
  return unwrap<OrderDto[]>(res, "myOrders");
}

/**
 * Total order count for the current user, read from `pagination.totalCount` (pageSize=1).
 * Use this instead of `myOrders(...).length` for before/after assertions: the seeded customer
 * account accumulates orders across runs, so a fixed-page `myOrders` list saturates and silently
 * breaks "+1" / "unchanged" count comparisons once the account has more orders than the page size.
 */
export async function myOrdersCount(request: APIRequestContext, token: string): Promise<number> {
  const res = await request.get(`${API_URL}/api/v1/orders/mine?pageSize=1`, { headers: authHeaders(token) });
  const body = (await res.json()) as ApiEnvelope<OrderDto[]>;
  if (!res.ok() || !body.success) {
    throw new ApiCallError("myOrdersCount", res.status(), body.message, body.errors ?? []);
  }
  return body.pagination?.totalCount ?? body.data.length;
}

export async function getOrder(request: APIRequestContext, token: string, orderId: string): Promise<OrderDto> {
  const res = await request.get(`${API_URL}/api/v1/orders/${orderId}`, { headers: authHeaders(token) });
  return unwrap<OrderDto>(res, "getOrder");
}

export async function waitForOrderStatus(
  request: APIRequestContext,
  token: string,
  orderId: string,
  statuses: string[],
  timeoutMs = 20_000
): Promise<OrderDto> {
  const start = Date.now();
  let last: OrderDto | null = null;
  while (Date.now() - start < timeoutMs) {
    last = await getOrder(request, token, orderId);
    if (statuses.includes(last.status)) return last;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(
    `Timed out waiting for order ${orderId} to reach one of [${statuses.join(", ")}] - last status: ${last?.status}`
  );
}

export async function placeOrder(
  request: APIRequestContext,
  customerToken: string,
  body: { addressId: string; paymentMethod: "COD" | "Online"; note?: string; couponCode?: string },
  idempotencyKey?: string
): Promise<{ order: OrderDto; status: number; replayed: boolean }> {
  const res = await request.post(`${API_URL}/api/v1/orders`, {
    headers: {
      ...authHeaders(customerToken),
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    data: body,
  });
  const envelopeBody = (await res.json()) as ApiEnvelope<OrderDto>;
  if (!res.ok() || !envelopeBody.success) {
    throw new ApiCallError("placeOrder", res.status(), envelopeBody.message, envelopeBody.errors ?? []);
  }
  return {
    order: envelopeBody.data,
    status: res.status(),
    replayed: res.headers()["idempotent-replayed"] === "true",
  };
}
