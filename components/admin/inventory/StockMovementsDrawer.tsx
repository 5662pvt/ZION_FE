"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { Alert, Drawer, Table, type TableProps } from "antd";
import { useStockMovements } from "@/hooks/useAdminInventory";
import type { InventoryItemDto, StockMovementDto, StockMovementType } from "@/types/inventory";

const MOVEMENT_TYPE_LABEL: Record<StockMovementType, string> = {
  Reserve: "Giữ hàng",
  Release: "Nhả hàng",
  Commit: "Trừ kho",
  Return: "Trả kho",
  Adjust: "Điều chỉnh",
  Expire: "Hết hạn giữ",
};

interface StockMovementsDrawerProps {
  open: boolean;
  item: InventoryItemDto | null;
  onClose: () => void;
}

export default function StockMovementsDrawer({ open, item, onClose }: StockMovementsDrawerProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useStockMovements(item?.productId ?? "", { page, pageSize });

  const columns: TableProps<StockMovementDto>["columns"] = [
    {
      title: "Loại",
      dataIndex: "type",
      render: (type: StockMovementType) => MOVEMENT_TYPE_LABEL[type] ?? type,
    },
    { title: "Số lượng", dataIndex: "quantity", align: "right" },
    { title: "Tham chiếu", dataIndex: "reference", render: (v: string | null) => v ?? "—" },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      render: (value: string) => dayjs(value).format("DD/MM/YYYY HH:mm"),
    },
    { title: "Người thực hiện", dataIndex: "createdBy", render: (v: string | null) => v ?? "—" },
  ];

  return (
    <Drawer
      title={item ? `Lịch sử tồn kho — ${item.productName}` : "Lịch sử tồn kho"}
      open={open}
      onClose={onClose}
      width={640}
      destroyOnHidden
    >
      {isError ? (
        <Alert type="error" message="Không tải được lịch sử tồn kho" />
      ) : (
        <Table<StockMovementDto>
          rowKey="id"
          loading={isLoading}
          dataSource={data?.items ?? []}
          columns={columns}
          locale={{ emptyText: "Chưa có lịch sử" }}
          pagination={{
            current: data?.pagination.page ?? page,
            pageSize: data?.pagination.pageSize ?? pageSize,
            total: data?.pagination.totalCount ?? 0,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      )}
    </Drawer>
  );
}
