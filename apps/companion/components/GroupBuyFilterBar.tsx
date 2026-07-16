'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  DEFAULT_PRODUCT_CATEGORY_TAB,
  PRODUCT_CATEGORY_TABS,
  type ProductCategoryTabId,
} from '@/lib/regions/product-categories';
import {
  DEFAULT_REGION_TAB,
  REGION_TABS,
  type RegionTabId,
} from '@/lib/regions/product-tabs';
import { PAGE_GUTTER_CLASS } from '@/lib/layout/page-container';
import { cn } from '@/lib/utils';

type Props = {
  region: RegionTabId;
  category: ProductCategoryTabId;
  onRegionChange: (value: RegionTabId) => void;
  onCategoryChange: (value: ProductCategoryTabId) => void;
};

type MenuKey = 'region' | 'category' | null;

function FilterDropdown<T extends string>({
  label,
  icon,
  value,
  options,
  open,
  onToggle,
  onSelect,
}: {
  label: string;
  icon: string;
  value: T;
  options: { id: T; label: string }[];
  open: boolean;
  onToggle: () => void;
  onSelect: (value: T) => void;
}) {
  const listId = useId();
  const selected = options.find((o) => o.id === value)?.label ?? options[0]?.label;

  return (
    <div className="relative min-w-0 flex-1">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={onToggle}
        className={cn(
          'flex h-9 w-full items-center gap-1 rounded-xl border border-border bg-card px-2.5 text-left text-sm font-semibold transition-colors',
          open
            ? 'border-primary text-primary'
            : 'text-foreground hover:bg-secondary/60',
        )}
      >
        <span className="shrink-0" aria-hidden>
          {icon}
        </span>
        <span className="min-w-0 flex-1 truncate">
          <span className="text-muted-foreground">{label}: </span>
          {selected}
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180 text-primary',
          )}
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-[var(--shadow-card)]"
        >
          {options.map((option) => {
            const isActive = option.id === value;
            return (
              <li key={option.id} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => onSelect(option.id)}
                  className={cn(
                    'flex w-full px-3 py-2 text-left text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-muted text-primary'
                      : 'text-foreground hover:bg-secondary',
                  )}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** 공동구매 목록 — 지역/항목 드롭다운 필터 (AND) */
export function GroupBuyFilterBar({
  region = DEFAULT_REGION_TAB,
  category = DEFAULT_PRODUCT_CATEGORY_TAB,
  onRegionChange,
  onCategoryChange,
}: Props) {
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenu) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenMenu(null);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openMenu]);

  return (
    <div ref={rootRef} className={cn(PAGE_GUTTER_CLASS, 'flex items-center gap-2 pb-3 pt-1')}>
      <FilterDropdown
        label="지역"
        icon="📍"
        value={region}
        options={REGION_TABS.map((t) => ({ id: t.id, label: t.label }))}
        open={openMenu === 'region'}
        onToggle={() =>
          setOpenMenu((prev) => (prev === 'region' ? null : 'region'))
        }
        onSelect={(value) => {
          onRegionChange(value);
          setOpenMenu(null);
        }}
      />
      <FilterDropdown
        label="항목"
        icon="🏷️"
        value={category}
        options={PRODUCT_CATEGORY_TABS.map((t) => ({
          id: t.id,
          label: t.label,
        }))}
        open={openMenu === 'category'}
        onToggle={() =>
          setOpenMenu((prev) => (prev === 'category' ? null : 'category'))
        }
        onSelect={(value) => {
          onCategoryChange(value);
          setOpenMenu(null);
        }}
      />
    </div>
  );
}
