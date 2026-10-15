"use client";

import { useState, type ReactNode } from "react";
import { Button, Drawer, Space } from "antd";
import { FiFilter } from "react-icons/fi";
import styles from "./FilterBar.module.css";

interface FilterBarProps {
  children: ReactNode;
  action?: ReactNode;
}

export default function FilterBar({ children, action }: FilterBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.bar}>
      <div className={styles.filters}>
        <div className={styles.desktopFilters}>
          <Space wrap>{children}</Space>
        </div>
        <div className={styles.mobileFilters}>
          <Button icon={<FiFilter aria-hidden />} onClick={() => setOpen(true)} aria-label="Mở bộ lọc">
            Lọc
          </Button>
        </div>
      </div>
      {action && <div className={styles.action}>{action}</div>}
      <Drawer title="Lọc" placement="bottom" height="auto" open={open} onClose={() => setOpen(false)}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          {children}
        </Space>
      </Drawer>
    </div>
  );
}
