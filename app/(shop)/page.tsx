"use client";

import { useCategoryTree } from "@/hooks/useCategories";
import HeroSection from "@/components/shop/home/HeroSection";
import CategoryTiles from "@/components/shop/home/CategoryTiles";
import NewProductsRow from "@/components/shop/home/NewProductsRow";
import CategorySection from "@/components/shop/home/CategorySection";
import PolicyStrip from "@/components/shop/home/PolicyStrip";

export default function HomePage() {
  const { data: categories, isLoading: categoriesLoading } = useCategoryTree();

  return (
    <div>
      <HeroSection />

      <section className="home-section home-section--white">
        <div className="home-container">
          <CategoryTiles />
        </div>
      </section>

      <section className="home-section home-section--sky">
        <div className="home-container">
          <NewProductsRow />
        </div>
      </section>

      {!categoriesLoading &&
        (categories ?? []).map((category, index) => (
          <section
            key={category.id}
            className={`home-section ${index % 2 === 0 ? "home-section--white" : "home-section--sky"}`}
          >
            <div className="home-container">
              <CategorySection category={category} />
            </div>
          </section>
        ))}

      <section className="home-section home-section--white">
        <div className="home-container">
          <PolicyStrip />
        </div>
      </section>

      <style jsx>{`
        .home-section {
          padding: 32px 16px;
        }
        .home-section--white {
          background: var(--color-surface);
        }
        .home-section--sky {
          background: var(--color-accent);
        }
        .home-container {
          max-width: var(--content-max);
          margin: 0 auto;
        }
        @media (min-width: 640px) {
          .home-section {
            padding: 48px 24px;
          }
        }
      `}</style>
    </div>
  );
}
