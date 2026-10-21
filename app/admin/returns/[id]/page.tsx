"use client";

import { useParams } from "next/navigation";
import AdminReturnDetail from "@/components/admin/returns/AdminReturnDetail";

export default function AdminReturnDetailPage() {
  const params = useParams<{ id: string }>();
  return <AdminReturnDetail returnId={params.id} />;
}
