"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Alert, Button, Flex, Image, Popconfirm, Table, Typography, type TableProps } from "antd";
import { formatVnd } from "@/utils/money";
import { toast } from "@/utils/toast";
import { useRemoveCartItem, useUpdateCartItem } from "@/hooks/useCart";
import { ApiError } from "@/services/apiClient";
import { lineTotal } from "@/utils/cartTotals";
import QuantityStepper from "@/components/ui/QuantityStepper";
import type { CartItemDto } from "@/types/cart";
import type { AvailabilityDto } from "@/types/inventory";

const { Text } = Typography;

const UPDATE_DEBOUNCE_MS = 400;

function QuantityInput({ item, max }: { item: CartItemDto; max?: number }) {
  const [quantity, setQuantity] = useState(item.quantity);
  const updateItem = useUpdateCartItem();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleChange(next: number) {
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

  return <QuantityStepper min={1} max={max} value={quantity} onChange={handleChange} />;
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

function StockWarning({ item, available }: { item: CartItemDto; available: number }) {
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const outOfStock = available <= 0;

  function handleFix() {
    if (outOfStock) {
      removeItem.mutate(item.id, {
        onSuccess: () => toast.success("Đã xoá sản phẩm khỏi giỏ"),
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "Xoá sản phẩm thất bại"),
      });
    } else {
      updateItem.mutate(
        { itemId: item.id, quantity: available },
        {
          onError: (err) => toast.error(err instanceof ApiError ? err.message : "Cập nhật số lượng thất bại"),
        }
      );
    }
  }

  return (
    <Alert
      type="warning"
      showIcon
      style={{ marginTop: 8, maxWidth: 280 }}
      message={outOfStock ? "Sản phẩm đã hết hàng" : `Chỉ còn ${available} sản phẩm`}
      action={
        <Button size="small" loading={updateItem.isPending || removeItem.isPending} onClick={handleFix}>
          {outOfStock ? "Xoá khỏi giỏ" : "Cập nhật số lượng"}
        </Button>
      }
    />
  );
}

interface CartTableProps {
  items: CartItemDto[];
  availability?: Record<string, AvailabilityDto>;
  loading?: boolean;
}

export default function CartTable({ items, availability, loading = false }: CartTableProps) {
  const columns: TableProps<CartItemDto>["columns"] = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      render: (name: string, item) => (
        <Flex gap={12} align="flex-start">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={name}
              width={56}
              height={56}
              preview={false}
              style={{ objectFit: "cover", borderRadius: "var(--radius-control)", flexShrink: 0 }}
            />
          ) : (
            <div
              style={{
                width: 56,
                height: 56,
                background: "var(--color-border)",
                borderRadius: "var(--radius-control)",
                flexShrink: 0,
              }}
            />
          )}
          <div style={{ minWidth: 0 }}>
            {item.productSlug ? <Link href={`/products/${item.productSlug}`}>{name}</Link> : <Text>{name}</Text>}
            <div>
              <Text type="secondary">{formatVnd(item.unitPrice)}</Text>
            </div>
          </div>
        </Flex>
      ),
    },
    {
      title: "Số lượng",
      key: "quantity",
      render: (_, item) => {
        const available = availability?.[item.productId]?.available;
        const overLimit = available !== undefined && item.quantity > available;
        return (
          <div>
            <QuantityInput key={item.id} item={item} max={available} />
            {overLimit && <StockWarning item={item} available={available} />}
          </div>
        );
      },
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
      scroll={{ x: 560 }}
      locale={{ emptyText: "Giỏ hàng trống" }}
    />
  );
}
