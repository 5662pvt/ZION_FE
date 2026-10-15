"use client";

import { Suspense } from "react";
import { Drawer, Input } from "antd";
import { FiX } from "react-icons/fi";
import SearchAutocomplete from "./SearchAutocomplete";

interface MobileSearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileSearchOverlay({ open, onClose }: MobileSearchOverlayProps) {
  return (
    <Drawer
      placement="top"
      height="100%"
      open={open}
      onClose={onClose}
      closeIcon={<FiX size={20} aria-hidden />}
      title="Tìm sản phẩm"
      destroyOnHidden
    >
      <Suspense fallback={<Input placeholder="Tìm sản phẩm..." disabled />}>
        <SearchAutocomplete autoFocus onNavigate={onClose} />
      </Suspense>
    </Drawer>
  );
}
