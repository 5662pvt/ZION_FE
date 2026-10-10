"use client";

import { useParams } from "next/navigation";
import AdminOrderDetail from "@/components/admin/orders/AdminOrderDetail";

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  return <AdminOrderDetail orderId={params.id} />;
}
