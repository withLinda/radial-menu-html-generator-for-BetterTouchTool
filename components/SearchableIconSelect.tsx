"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  options: string[];
  value: string;
  onChange: (next: string) => void;
  customLabel?: string;
  className?: string;
  style?: React.CSSProperties;
};

const CUSTOM_VALUE = "__custom__";

type PopoverPosition = {
  left: number;
  top: number;
  width: number;
};

export default function SearchableIconSelect({ options, value, onChange, customLabel, className, style }: Props) {
  const listboxId = useId();
  const optionIdBase = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition | null>(null);
  const [canRenderPortal, setCanRenderPortal] = useState(false);

  useEffect(() => {
    setCanRenderPortal(true);
  }, []);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, query]);

  const entries = useMemo(() => {
    return [CUSTOM_VALUE, ...filteredOptions];
  }, [filteredOptions]);

  const baseEntries = useMemo(() => {
    return [CUSTOM_VALUE, ...options];
  }, [options]);

  const selectedLabel = value === CUSTOM_VALUE ? (customLabel?.trim() ? customLabel : "Custom…") : value;

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (!containerRef.current?.contains(target) && !popoverRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    const opts: AddEventListenerOptions = { capture: true };

    window.addEventListener("pointerdown", onPointerDown, opts);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, opts);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    setQuery("");

    const selectedIndex = baseEntries.findIndex((e) => e === value);
    setActiveIndex(Math.max(0, selectedIndex));

    queueMicrotask(() => {
      searchRef.current?.focus();
      searchRef.current?.select();
    });
  }, [baseEntries, isOpen, value]);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      setPopoverPosition({
        left: rect.left,
        top: rect.bottom,
        width: rect.width,
      });
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    queueMicrotask(() => triggerRef.current?.focus());
  };

  const commit = (next: string) => {
    onChange(next);
    close();
  };

  const moveActive = (delta: number) => {
    setActiveIndex((prev) => {
      const max = entries.length - 1;
      if (max < 0) return 0;
      const next = Math.min(max, Math.max(0, prev + delta));
      return next;
    });
  };

  const openFromTrigger = () => {
    setIsOpen(true);
  };

  const onTriggerKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openFromTrigger();
    }
  };

  const onSearchKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveActive(1);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      moveActive(-1);
      return;
    }

    if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(Math.max(0, entries.length - 1));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const next = entries[activeIndex];
      if (next) commit(next);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const id = `${optionIdBase}-${activeIndex}`;
    const el = document.getElementById(id);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isOpen, optionIdBase]);

  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex((prev) => {
      const max = entries.length - 1;
      if (max < 0) return 0;
      return Math.min(prev, max);
    });
  }, [entries.length, isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setIsOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        className={className}
        style={style}
      >
        <span className="block truncate text-left">{selectedLabel}</span>
      </button>

      {isOpen && canRenderPortal && popoverPosition
        ? createPortal(
            <div
              ref={popoverRef}
              className="rounded-lg border border-ef-bg4/70 bg-ef-bg0/95 backdrop-blur-md shadow-efsoft"
              role="presentation"
              style={{
                position: "fixed",
                zIndex: 9999,
                left: popoverPosition.left,
                top: popoverPosition.top + 8,
                width: popoverPosition.width,
              }}
            >
              <div className="p-2">
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onSearchKeyDown}
                  placeholder="Search icons…"
                  className="w-full px-3 py-2 rounded-md bg-ef-bg1/80 border border-ef-bg4/70 outline-none focus:border-ef-yellow/60 focus:ring-2 focus:ring-ef-yellow/20 text-sm"
                  style={{ color: "#D3C6AA" }}
                  aria-label="Search icons"
                />
              </div>

              <ul
                id={listboxId}
                role="listbox"
                className="max-h-64 overflow-y-auto px-2 pb-2 scrollbar-ef-orange"
                aria-label="Icon options"
              >
                {entries.length === 1 && query.trim().length > 0 && (
                  <li className="px-3 py-2 text-sm" style={{ color: "#9DA9A0" }}>
                    No matches.
                  </li>
                )}

                {entries.map((entry, index) => {
                  const isSelected = entry === value;
                  const isActive = index === activeIndex;
                  const label = entry === CUSTOM_VALUE ? "Custom…" : entry;

                  return (
                    <li
                      key={entry}
                      id={`${optionIdBase}-${index}`}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => commit(entry)}
                      className="cursor-pointer select-none rounded-md px-3 py-2 text-sm"
                      style={{
                        color: "#D3C6AA",
                        backgroundColor: isActive ? "rgba(39,46,51,0.75)" : "transparent",
                        border: isActive ? "1px solid rgba(219,188,127,0.25)" : "1px solid transparent",
                      }}
                    >
                      <span className="block truncate">{label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
