"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button, Image, InputNumber, Popconfirm, Table, type TableProps } from "antd";
import { formatVnd } from "@/utils/money";
import { toast } from "@/utils/toast";
import { useRemoveCartItem, useUpdateCartItem } from "@/hooks/useCart";
import { ApiError } from "@/services/apiClient";
import { lineTotal } from "@/utils/cartTotals";
import type { CartItemDto } from "@/types/cart";

const UPDATE_DEBOUNCE_MS = 400;

function QuantityInput({ item }: { item: CartItemDto }) {
  const [quantity, setQuantity] = useState(item.quantity);
  const updateItem = useUpdateCartItem();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleChange(value: number | null) {
    const next = value ?? 1;
    setQuantity(next);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      updateItem.mutate(
        { itemId: item.id, quantity: next },
        {
          onError: (err) => toast.error(err instanceof ApiError ? err.message : "Cập nhật số lượng thất bại"),
        }
      );
    }, UPDATE_DEBOUNCE_MS);
  }

  return <InputNumber min={1} max={99} value={quantity} onChange={handleChange} />;
}

function RemoveButton({ itemId }: { itemId: string }) {
  const removeItem = useRemoveCartItem();

  function handleRemove() {
    removeItem.mutate(itemId, {
      onSuccess: () => toast.success("Đã xoá sản phẩm khỏi giỏ"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Xoá sản phẩm thất bại"),
    });
  }

  return (
    <Popconfirm title="Xoá sản phẩm này khỏi giỏ?" onConfirm={handleRemove}>
      <Button danger size="small" loading={removeItem.isPending}>
        Xoá
      </Button>
    </Popconfirm>
  );
}

interface CartTableProps {
  items: CartItemDto[];
  loading?: boolean;
}

export default function CartTable({ items, loading = false }: CartTableProps) {
  const columns: TableProps<CartItemDto>["columns"] = [
    {
      title: "Ảnh",
      key: "image",
      width: 72,
      render: (_, item) =>
        item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.productName}
            width={56}
            height={56}
            preview={false}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div style={{ width: 56, height: 56, background: "#f0f0f0" }} />
        ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      render: (name: string, item) =>
        item.productSlug ? <Link href={`/products/${item.productSlug}`}>{name}</Link> : name,
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      render: (price: number) => formatVnd(price),
    },
    {
      title: "Số lượng",
      key: "quantity",
      render: (_, item) => <QuantityInput key={item.id} item={item} />,
    },
    {
      title: "Thành tiền",
      key: "lineTotal",
      render: (_, item) => formatVnd(lineTotal(item)),
    },
    {
      title: "",
      key: "actions",
      render: (_, item) => <RemoveButton itemId={item.id} />,
    },
  ];

  return (
    <Table<CartItemDto>
      rowKey="id"
      loading={loading}
      dataSource={items}
      columns={columns}
      pagination={false}
      locale={{ emptyText: "Giỏ hàng trống" }}
    />
  );
}
