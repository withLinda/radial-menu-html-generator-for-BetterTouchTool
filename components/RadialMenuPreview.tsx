"use client";

import React, { useMemo, useState } from "react";

type PreviewItem = {
  id: number;
  uuid: string;
  name?: string;
  color: string;
  iconType?: string;
  icon?: string;
  customIcon?: string;
};

type PreviewSize = "sm" | "md" | "lg";

const WEBVIEW_SIZE_PX = 500;

const sizeToPx: Record<PreviewSize, number> = {
  sm: 240,
  md: 320,
  lg: 420,
};

// Mirrors the fixed fan-out positions in the generated HTML/CSS.
const fanOutTransforms = [
  "translate3d(0.08361px, -104.99997px, 0)",
  "translate3d(90.9466px, -52.47586px, 0)",
  "translate3d(90.9466px, 52.47586px, 0)",
  "translate3d(0.08361px, 104.99997px, 0)",
  "translate3d(-90.86291px, 52.62064px, 0)",
  "translate3d(-91.03006px, -52.33095px, 0)",
  "translate3d(-0.25084px, -104.9997px, 0)",
];

function normalizeFaClass(value: string | undefined | null) {
  const raw = (value ?? "").trim();
  if (!raw) return "fa-solid fa-star";

  const tokens = raw.split(/\s+/).filter(Boolean);
  const styleTokens = new Set(["fa-solid", "fa-regular", "fa-brands", "fas", "far", "fab"]);

  const style = tokens.find((t) => styleTokens.has(t)) ?? "fa-solid";
  const nonStyleTokens = tokens.filter((t) => !styleTokens.has(t));

  const iconTokenOriginal = nonStyleTokens.find((t) => t.startsWith("fa-")) ?? nonStyleTokens[0] ?? "fa-star";
  const iconToken = iconTokenOriginal.startsWith("fa-") ? iconTokenOriginal : `fa-${iconTokenOriginal}`;
  const modifiers = nonStyleTokens.filter((t) => t !== iconTokenOriginal);

  return [style, iconToken, ...modifiers].join(" ").trim();
}

export default function RadialMenuPreview({ items }: { items: PreviewItem[] }) {
  const [isOpen, setIsOpen] = useState(true);
  const [size, setSize] = useState<PreviewSize>("lg");

  const previewItems = useMemo(() => items, [items]);
  const boxSize = sizeToPx[size];
  const scale = boxSize / WEBVIEW_SIZE_PX;

  return (
    <div
      className="backdrop-blur-2xl bg-gradient-to-br from-ef-bg1/55 to-ef-bg2/35 rounded-2xl p-6 border border-ef-bg4/70 shadow-efsoft"
      aria-label="Radial menu preview"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-xl font-semibold text-ef-fg">Preview</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="px-3 py-2 rounded-md border transition-all duration-200 shadow-efsoft"
            style={{ backgroundColor: "rgba(39,46,51,0.55)", borderColor: "rgba(65,75,80,0.70)", color: "#D3C6AA" }}
          >
            {isOpen ? "Close" : "Open"}
          </button>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as PreviewSize)}
            className="px-3 py-2 rounded-md bg-ef-bg1/80 border border-ef-bg4/70 outline-none focus:border-ef-yellow/60 focus:ring-2 focus:ring-ef-yellow/20"
            style={{ color: "#D3C6AA" }}
            aria-label="Preview size"
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </div>
      </div>

      <div
        className="rounded-xl border border-ef-bg4/70 overflow-hidden"
        style={{ backgroundColor: "rgba(30,35,38,0.55)" }}
      >
        <div
          className="relative mx-auto"
          style={{ width: boxSize, height: boxSize }}
        >
          <div
            className="absolute left-1/2 top-1/2"
            style={
              {
                width: WEBVIEW_SIZE_PX,
                height: WEBVIEW_SIZE_PX,
                transform: `translate(-50%, -50%) scale(${scale})`,
                transformOrigin: "center",
              } as React.CSSProperties
            }
          >
            <div className="relative" style={{ width: WEBVIEW_SIZE_PX, height: WEBVIEW_SIZE_PX }}>
              <nav className="radial-preview-menu" aria-label="Radial preview menu">
                <input
                  type="checkbox"
                  className="menu-open"
                  id="preview-menu-open"
                  checked={isOpen}
                  onChange={(e) => setIsOpen(e.target.checked)}
                />
                <label className="menu-open-button" htmlFor="preview-menu-open" aria-label="Toggle menu">
                  <span className="lines line-1" />
                  <span className="lines line-2" />
                  <span className="lines line-3" />
                </label>

                {previewItems.length === 0 ? (
                  <div className="preview-empty">No items to preview.</div>
                ) : (
                  previewItems.map((item, index) => {
                    const number = index + 1;
                    const transform =
                      isOpen && index < fanOutTransforms.length ? fanOutTransforms[index] : "translate3d(0, 0, 0)";
                    const transitionDurationMs = 180 + Math.min(index, 6) * 100;

                    return (
                      <a
                        key={item.id}
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="menu-item preview-item"
                        style={
                          {
                            backgroundColor: item.color,
                            transform,
                            transitionDuration: `${transitionDurationMs}ms`,
                          } as React.CSSProperties
                        }
                        aria-label={item.name?.trim() ? item.name : `Item ${number}`}
                        title={item.name?.trim() ? item.name : `Item ${number}`}
                      >
                        <i
                          className={normalizeFaClass(item.iconType === "custom" ? item.customIcon : item.icon)}
                          aria-hidden="true"
                        />
                      </a>
                    );
                  })
                )}
              </nav>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .radial-preview-menu {
          position: absolute;
          inset: 0;
          margin: auto;
          width: 60px;
          height: 60px;
          text-align: center;
          box-sizing: border-box;
          font-size: 26px;
        }

        .menu-item,
        .menu-open-button {
          background: #2e383c;
          border-radius: 999px;
          width: 60px;
          height: 60px;
          margin-left: -40px;
          position: absolute;
          color: #1e2326;
          text-align: center;
          line-height: 60px;
          transform: translate3d(0, 0, 0);
          transition: transform ease-out 200ms;
          box-shadow: 3px 3px 0 0 rgba(0, 0, 0, 0.14);
          text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.12);
        }

        .menu-open {
          display: none;
        }

        .menu-open-button {
          z-index: 2;
          cursor: pointer;
          background: #374145;
          transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transition-duration: 400ms;
          transform: scale(1.1, 1.1) translate3d(0, 0, 0);
        }

        .menu-open-button:hover {
          transform: scale(1.2, 1.2) translate3d(0, 0, 0);
        }

        .lines {
          width: 25px;
          height: 3px;
          background: #9da9a0;
          display: block;
          position: absolute;
          top: 50%;
          left: 50%;
          margin-left: -12.5px;
          margin-top: -1.5px;
          transition: transform 200ms;
        }

        .line-1 {
          transform: translate3d(0, -8px, 0);
        }
        .line-2 {
          transform: translate3d(0, 0, 0);
        }
        .line-3 {
          transform: translate3d(0, 8px, 0);
        }

        .menu-open:checked + .menu-open-button .line-1 {
          transform: translate3d(0, 0, 0) rotate(45deg);
        }
        .menu-open:checked + .menu-open-button .line-2 {
          transform: translate3d(0, 0, 0) scale(0.1, 1);
        }
        .menu-open:checked + .menu-open-button .line-3 {
          transform: translate3d(0, 0, 0) rotate(-45deg);
        }

        .menu-item:hover {
          background: #d3c6aa !important;
          color: #2e383c !important;
          text-shadow: none;
        }

        .preview-empty {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 220px;
          text-align: center;
          font-size: 13px;
          color: rgba(211, 198, 170, 0.85);
        }

        :global(.radial-preview-menu .svg-inline--fa) {
          display: inline-block !important;
          height: 100% !important;
          width: 50%;
        }
      `}</style>
    </div>
  );
}
