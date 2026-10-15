"use client";

import { Pagination, Skeleton, Space, Table, type TableProps } from "antd";
import type { Key, ReactNode } from "react";
import EmptyState from "@/components/ui/EmptyState";
import styles from "./ResponsiveTable.module.css";

interface ResponsiveTablePagination {
  current: number;
  pageSize: number;
  total: number;
}

interface ResponsiveTableProps<T> {
  rowKey: keyof T | ((record: T) => Key);
  columns: TableProps<T>["columns"];
  dataSource: T[];
  loading: boolean;
  pagination: ResponsiveTablePagination;
  onPageChange: (page: number, pageSize: number) => void;
  emptyText: string;
  renderCard: (record: T) => ReactNode;
}

function getKey<T>(record: T, rowKey: ResponsiveTableProps<T>["rowKey"]): Key {
  return typeof rowKey === "function" ? rowKey(record) : (record[rowKey] as unknown as Key);
}

export default function ResponsiveTable<T extends object>({
  rowKey,
  columns,
  dataSource,
  loading,
  pagination,
  onPageChange,
  emptyText,
  renderCard,
}: ResponsiveTableProps<T>) {
  return (
    <>
      <div className={styles.tableView}>
        <Table<T>
          rowKey={rowKey as TableProps<T>["rowKey"]}
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          locale={{ emptyText }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            onChange: onPageChange,
          }}
        />
      </div>
      <div className={styles.cardView}>
        {loading ? (
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Skeleton active paragraph={{ rows: 2 }} className={styles.cardSkeleton} />
            <Skeleton active paragraph={{ rows: 2 }} className={styles.cardSkeleton} />
            <Skeleton active paragraph={{ rows: 2 }} className={styles.cardSkeleton} />
          </Space>
        ) : dataSource.length === 0 ? (
          <EmptyState description={emptyText} />
        ) : (
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            {dataSource.map((record) => (
              <div key={getKey(record, rowKey)}>{renderCard(record)}</div>
            ))}
          </Space>
        )}
        {!loading && dataSource.length > 0 && (
          <div className={styles.pagination}>
            <Pagination
              size="small"
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={onPageChange}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    </>
  );
}
