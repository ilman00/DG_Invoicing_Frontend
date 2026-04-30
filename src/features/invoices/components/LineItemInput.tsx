// ─── LineItemInput: catalog picker + free-type fallback ──────────────────────

import { useItems } from '../../../hooks/useItems';
import { Plus, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { Item } from '../../../types';
import type { LineItemFormValue } from './invoiceForm';
import { inputCls } from './invoiceForm';
// import { inputCls } from '../../../lib/utils';

interface LineItemInputProps {
  value: LineItemFormValue;
  onChange: (updated: Partial<LineItemFormValue>) => void;
}

export const LineItemInput = ({ value, onChange }: LineItemInputProps) => {
  const { items } = useItems();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value.item_name ?? '');
  const [mode, setMode] = useState<'catalog' | 'custom'>(
    value.item_id ? 'catalog' : 'custom'
  );
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? items.filter(
        (i) =>
          i.name.toLowerCase().includes(query.toLowerCase()) ||
          (i.name_ar ?? '').includes(query)
      )
    : items;

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectFromCatalog = (item: Item) => {
    setMode('catalog');
    setQuery(item.name);
    setOpen(false);
    onChange({
      item_id:      item.id,
      item_name:    item.name,
      item_name_ar: item.name_ar ?? undefined,
      unit_price:   Number(item.price),
    });
  };

  const switchToCustom = () => {
    setMode('custom');
    setQuery('');
    setOpen(false);
    onChange({ item_id: undefined, item_name: '', item_name_ar: undefined, unit_price: 0 });
  };

  return (
    <div ref={ref} className="relative">
      {mode === 'catalog' ? (
        // ── Catalog selection display ──
        <div className="flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2.5 text-sm">
          <span className="flex-1 truncate font-medium text-slate-800">
            {value.item_name}
          </span>
          {value.item_name_ar && (
            <span className="shrink-0 text-[10px] text-slate-400" dir="rtl">
              {value.item_name_ar}
            </span>
          )}
          <button
            type="button"
            onClick={switchToCustom}
            className="shrink-0 text-slate-400 hover:text-slate-700 transition"
            title="Clear selection"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        // ── Search / free-type input ──
        <input
          type="text"
          required
          autoComplete="off"
          placeholder="Search catalog or type custom…"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            // keep item_name in sync for free-type
            onChange({ item_id: undefined, item_name: e.target.value, item_name_ar: undefined });
          }}
          className={inputCls}
        />
      )}

      {/* ── Dropdown ── */}
      {open && mode !== 'catalog' && (
        <div className="absolute z-50 mt-1 w-[280px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/80">
          
          {/* Catalog results */}
          {filtered.length > 0 && (
            <>
              <div className="px-3 pt-2.5 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  From catalog
                </span>
              </div>
              <ul className="max-h-44 overflow-y-auto">
                {filtered.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => selectFromCatalog(item)}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition hover:bg-slate-50"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-semibold text-slate-800">
                          {item.name}
                        </div>
                        {item.name_ar && (
                          <div className="truncate text-[11px] text-slate-400" dir="rtl">
                            {item.name_ar}
                          </div>
                        )}
                      </div>
                      <span className="shrink-0 text-xs font-medium text-slate-500">
                        {Number(item.price).toFixed(2)} SAR
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Divider + use-as-custom option */}
          {query.trim() && (
            <>
              {filtered.length > 0 && <div className="mx-3 border-t border-slate-100" />}
              <button
                type="button"
                onClick={() => {
                  setMode('custom');
                  setOpen(false);
                  onChange({ item_id: undefined, item_name: query.trim(), item_name_ar: undefined });
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-slate-600 hover:bg-slate-50 transition"
              >
                <Plus size={12} className="text-slate-400" />
                Use "<span className="font-semibold">{query.trim()}</span>" as custom item
              </button>
            </>
          )}

          {filtered.length === 0 && !query.trim() && (
            <p className="px-3 py-4 text-center text-xs text-slate-400">
              Start typing to search or enter a custom name
            </p>
          )}
        </div>
      )}
    </div>
  );
};