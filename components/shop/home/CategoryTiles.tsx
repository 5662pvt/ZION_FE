"use client";

import Link from "next/link";
import { Skeleton } from "antd";
import { FiBox, FiCoffee, FiGift, FiGrid, FiHeart, FiShoppingBag, FiStar, FiTag } from "react-icons/fi";
import { useCategoryTree } from "@/hooks/useCategories";

const TILE_ICONS = [FiGrid, FiShoppingBag, FiHeart, FiStar, FiGift, FiTag, FiBox, FiCoffee];

export default function CategoryTiles() {
  const { data: categories, isLoading } = useCategoryTree();

  if (!isLoading && (!categories || categories.length === 0)) return null;

  return (
    <div className="category-tiles">
      {isLoading
        ? Array.from({ length: 6 }).map((_, index) => (
            <Skeleton.Button key={index} active className="category-tile-skeleton" />
          ))
        : (categories ?? []).map((category, index) => {
            const Icon = TILE_ICONS[index % TILE_ICONS.length];
            return (
              <Link key={category.id} href={`/products?categoryId=${category.id}`} className="category-tile">
                <span className="category-tile-icon">
                  <Icon size={20} aria-hidden />
                </span>
                <span className="category-tile-name">{category.name}</span>
              </Link>
            );
          })}
      <style jsx>{`
        .category-tiles {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding-bottom: 4px;
        }
        .category-tile,
        .category-tile-skeleton {
          flex-shrink: 0;
          scroll-snap-align: start;
        }
        .category-tile-skeleton {
          min-width: 120px;
          height: 72px;
        }
        .category-tile {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-width: 96px;
          min-height: 44px;
          padding: var(--space-4) var(--space-3);
          border-radius: var(--radius-card);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-card);
          text-align: center;
        }
        .category-tile-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          border-radius: 50%;
          background: var(--color-accent);
          color: var(--color-action);
        }
        .category-tile-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text);
        }
        @media (min-width: 1024px) {
          .category-tiles {
            display: grid;
            grid-template-columns: repeat(6, minmax(0, 1fr));
            overflow-x: visible;
          }
          .category-tile,
          .category-tile-skeleton {
            min-width: 0;
          }
        }
      `}</style>
    </div>
  );
}
