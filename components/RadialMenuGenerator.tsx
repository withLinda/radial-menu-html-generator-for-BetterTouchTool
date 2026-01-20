"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Copy, Edit3, Check, X, FileCode, Download, Shuffle, AlertTriangle, Wand2 } from "lucide-react";
import RadialMenuPreview from "./RadialMenuPreview";
import SearchableIconSelect from "./SearchableIconSelect";
import copyUuidImage from "../images/copy-UUID-BetterTouchTool.png";
import { parseRadialMenuHtml } from "./radialMenuHtmlImport";
import { fontawesomeFreeIconClasses } from "./fontawesomeFreeIconClasses";

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

const COMMON_ICONS = [
  "fa-solid fa-star",
  "fa-solid fa-book",
  "fa-solid fa-house",
  "fa-solid fa-magnifying-glass",
  "fa-solid fa-bars",
  "fa-solid fa-clock",
  "fa-solid fa-camera",
  "fa-solid fa-file-lines",
  "fa-solid fa-comments",
  "fa-solid fa-bug",
  "fa-solid fa-upload",
  "fa-solid fa-pause",
  "fa-solid fa-bell",
  "fa-solid fa-keyboard",
  "fa-solid fa-expand",
  "fa-brands fa-google",
  "fa-brands fa-github",
  "fa-brands fa-youtube",
  "fa-brands fa-wikipedia-w",
];

const ICON_OPTIONS = (() => {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const icon of COMMON_ICONS) {
    if (seen.has(icon)) continue;
    seen.add(icon);
    out.push(icon);
  }

  for (const icon of fontawesomeFreeIconClasses) {
    if (seen.has(icon)) continue;
    seen.add(icon);
    out.push(icon);
  }

  return out;
})();

const ICON_OPTIONS_SET = new Set(ICON_OPTIONS);

const RadialMenuGenerator = () => {
  const presetColors = [
    { name: "yellow", hex: "#DBBC7F" },
    { name: "red", hex: "#E67E80" },
    { name: "aqua", hex: "#83C092" },
    { name: "cyan", hex: "#7FBBB3" },
    { name: "orange", hex: "#E69875" },
    { name: "pink", hex: "#D699B6" },
  ];

  const accentPalette = presetColors.map((c) => c.hex);

  const randomFrom = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];

  const shuffle = <T,>(items: T[]) => {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  };

  const createMenuItem = (id: number) => ({
    id,
    uuid: "",
    name: "",
    icon: randomFrom(ICON_OPTIONS),
    iconType: "preset",
    customIcon: "",
    color: randomFrom(accentPalette),
    colorType: "preset",
  });

  const [menuItems, setMenuItems] = useState(() => Array.from({ length: 6 }, (_, index) => createMenuItem(index + 1)));
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [generatedHtmlCopyStatus, setGeneratedHtmlCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const generatedHtmlCopyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [editingHtml, setEditingHtml] = useState(false);
  const [editableHtml, setEditableHtml] = useState("");
  const [showUuidWarning, setShowUuidWarning] = useState(false);
  const [missingUuidCount, setMissingUuidCount] = useState(0);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const actionStatusResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [importHtml, setImportHtml] = useState("");
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [canFixImportHtml, setCanFixImportHtml] = useState(false);

  useEffect(() => {
    return () => {
      if (generatedHtmlCopyResetTimer.current) {
        clearTimeout(generatedHtmlCopyResetTimer.current);
      }
      if (actionStatusResetTimer.current) {
        clearTimeout(actionStatusResetTimer.current);
      }
    };
  }, []);

  const showActionStatus = (message: string) => {
    if (actionStatusResetTimer.current) {
      clearTimeout(actionStatusResetTimer.current);
      actionStatusResetTimer.current = null;
    }

    setActionStatus(message);
    actionStatusResetTimer.current = setTimeout(() => {
      setActionStatus(null);
    }, 2000);
  };

  const addMenuItem = () => {
    setMenuItems([...menuItems, createMenuItem(Date.now())]);
  };

  const randomizeIconsAndColors = () => {
    const icons = shuffle([...ICON_OPTIONS]);
    const colors = shuffle(presetColors.map((c) => c.hex));

    setMenuItems((prev) =>
      prev.map((item, index) => ({
        ...item,
        iconType: "preset",
        icon: icons[index % icons.length],
        customIcon: "",
        colorType: "preset",
        color: colors[index % colors.length],
      }))
    );
  };

  const removeMenuItem = (id: number) => {
    setMenuItems(menuItems.filter((item) => item.id !== id));
  };

  const updateMenuItem = (id: number, field: string, value: any) => {
    setMenuItems(menuItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const updateMenuItemFields = (id: number, fields: Record<string, any>) => {
    setMenuItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...fields } : item)));
  };

  const generateHtml = (items = menuItems) => {
    const jsSingleQuote = (value: string) =>
      `'${value
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/\r/g, "\\r")
        .replace(/\n/g, "\\n")}'`;

    // unique custom colors (non-preset)
    const customColors = [...new Set(
      items
        .filter((item) => !presetColors.find((c) => c.hex === item.color))
        .map((item) => item.color)
    )];

    const customColorStyles =
      customColors.length > 0
        ? `
        /* Custom Colors */
${customColors
  .map(
    (color) => `        .menu-item[style*="${color}"] {
            background-color: ${color} !important;
            box-shadow: 3px 3px 0 0 rgba(0, 0, 0, 0.14);
            text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.12);
        }

        .menu-item[style*="${color}"]:hover {
            color: ${color} !important;
            background: #D3C6AA !important; /* ef.fg to contrast hover */
            text-shadow: none;
        }`
  )
  .join("\n\n")}
`
        : "";

    const menuItemsForHtml = items.map((item) => {
        const iconToUse = item.iconType === "custom" ? item.customIcon : item.icon;
        const iconClass = normalizeFaClass(iconToUse);

        const colorClass = presetColors.find((c) => c.hex === item.color)?.name || "";
        const hasPresetColor = !!colorClass;
        const styleAttr = !hasPresetColor ? ` style="background-color: ${item.color};"` : "";

        return {
          uuid: item.uuid,
          iconClass,
          colorClass: hasPresetColor ? colorClass : "",
          styleAttr,
        };
      });

    const menuItemsHtml = menuItemsForHtml
      .map((item, index) => {
        const number = index + 1;
        return `    <!-- #${number} -->
    <a href="#" class="menu-item${item.colorClass ? " " + item.colorClass : ""}"${item.styleAttr}><i></i></a>`;
      })
      .join("\n");

    const uuidsObjectLiteral = `{
${menuItemsForHtml.map((i, index) => `      UUID${index + 1}: ${jsSingleQuote(i.uuid)},`).join("\n")}
    }`;
    const iconsObjectLiteral = `{
${menuItemsForHtml.map((i, index) => `      ICON${index + 1}: ${jsSingleQuote(i.iconClass)},`).join("\n")}
    }`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <script>
    const UUIDS = ${uuidsObjectLiteral};
    const ICONS = ${iconsObjectLiteral};
  </script>

  <style>
    body {
      padding: 0;
      margin: 0;
      background: transparent;
      color: #D3C6AA; /* ef.fg */
      text-align: center;
      font-family: "Lato", sans-serif;
    }

    @media screen and (max-width: 700px) {
      body { padding: 170px 0 0 0; width: 100% }
    }

    a { color: inherit; }

    .menu-item, .menu-open-button {
      background: #2E383C; /* ef.bg2 */
      border-radius: 100%;
      width: 60px; height: 60px; margin-left: -40px; position: absolute;
      color: #1E2326; /* ef.bg0 for icon contrast when hovered to fg */
      text-align: center; line-height: 60px;
      transform: translate3d(0, 0, 0);
      transition: transform ease-out 200ms;
    }

    .menu-open { display: none; }

    .lines {
      width: 25px; height: 3px; background: #9DA9A0; /* ef.g3 */
      display: block; position: absolute; top: 50%; left: 50%;
      margin-left: -12.5px; margin-top: -1.5px;
      transition: transform 200ms;
    }

    .line-1 { transform: translate3d(0, -8px, 0); }
    .line-2 { transform: translate3d(0, 0, 0); }
    .line-3 { transform: translate3d(0, 8px, 0); }

    .menu-open:checked + .menu-open-button .line-1 { transform: translate3d(0,0,0) rotate(45deg); }
    .menu-open:checked + .menu-open-button .line-2 { transform: translate3d(0,0,0) scale(0.1, 1); }
    .menu-open:checked + .menu-open-button .line-3 { transform: translate3d(0,0,0) rotate(-45deg); }

    .menu {
      margin: auto; position: absolute; top: 0; bottom: 0; left: 0; right: 0;
      width: 60px; height: 60px; text-align: center; box-sizing: border-box; font-size: 26px;
    }

    .menu-item:hover {
      background: #D3C6AA; /* ef.fg */
      color: #2E383C;      /* ef.bg2 */
    }

    /* fan-out animations */
    a.menu-item:nth-of-type(1) { transition-duration: 180ms; }
    a.menu-item:nth-of-type(2) { transition-duration: 180ms; }
    a.menu-item:nth-of-type(3) { transition-duration: 180ms; }
    a.menu-item:nth-of-type(4) { transition-duration: 180ms; }
    a.menu-item:nth-of-type(5) { transition-duration: 180ms; }
    a.menu-item:nth-of-type(6) { transition-duration: 180ms; }
    a.menu-item:nth-of-type(7) { transition-duration: 180ms; }

    .menu-open-button {
      z-index: 2;
      transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
      transition-duration: 400ms;
      transform: scale(1.1, 1.1) translate3d(0, 0, 0);
      cursor: pointer;
      box-shadow: 3px 3px 0 0 rgba(0, 0, 0, 0.14);
      background: #374145; /* ef.bg3 */
    }

    .menu-open-button:hover { transform: scale(1.2, 1.2) translate3d(0, 0, 0); }

    .menu-open:checked + .menu-open-button {
      transition-timing-function: linear;
      transition-duration: 200ms;
      transform: scale(0.8, 0.8) translate3d(0, 0, 0);
    }

    .menu-open:checked ~ .menu-item { transition-timing-function: cubic-bezier(0.935, 0, 0.34, 1.33); }

    .menu-open:checked ~ a.menu-item:nth-of-type(1) { transition-duration: 180ms; transform: translate3d(0.08361px, -104.99997px, 0); }
    .menu-open:checked ~ a.menu-item:nth-of-type(2) { transition-duration: 280ms; transform: translate3d(90.9466px, -52.47586px, 0); }
    .menu-open:checked ~ a.menu-item:nth-of-type(3) { transition-duration: 380ms; transform: translate3d(90.9466px, 52.47586px, 0); }
    .menu-open:checked ~ a.menu-item:nth-of-type(4) { transition-duration: 480ms; transform: translate3d(0.08361px, 104.99997px, 0); }
    .menu-open:checked ~ a.menu-item:nth-of-type(5) { transition-duration: 580ms; transform: translate3d(-90.86291px, 52.62064px, 0); }
    .menu-open:checked ~ a.menu-item:nth-of-type(6) { transition-duration: 680ms; transform: translate3d(-91.03006px, -52.33095px, 0); }
    .menu-open:checked ~ a.menu-item:nth-of-type(7) { transition-duration: 780ms; transform: translate3d(-0.25084px, -104.9997px, 0); }

    /* Everforest accent classes */
    .cyan, .blue    { background-color: #7FBBB3; box-shadow: 3px 3px 0 0 rgba(0,0,0,0.14); text-shadow: 1px 1px 0 rgba(0,0,0,0.12); }
    .cyan:hover, .blue:hover    { color: #7FBBB3; text-shadow: none; }

    .aqua, .green   { background-color: #83C092; box-shadow: 3px 3px 0 0 rgba(0,0,0,0.14); text-shadow: 1px 1px 0 rgba(0,0,0,0.12); }
    .aqua:hover, .green:hover   { color: #83C092; text-shadow: none; }

    .yellow  { background-color: #DBBC7F; box-shadow: 3px 3px 0 0 rgba(0,0,0,0.14); text-shadow: 1px 1px 0 rgba(0,0,0,0.12); }
    .yellow:hover  { background: #1E2326 !important; color: #DBBC7F !important; text-shadow: none; }

    .red     { background-color: #E67E80; box-shadow: 3px 3px 0 0 rgba(0,0,0,0.14); text-shadow: 1px 1px 0 rgba(0,0,0,0.12); }
    .red:hover     { color: #E67E80; text-shadow: none; }

    .pink, .purple  { background-color: #D699B6; box-shadow: 3px 3px 0 0 rgba(0,0,0,0.14); text-shadow: 1px 1px 0 rgba(0,0,0,0.12); }
    .pink:hover, .purple:hover  { color: #D699B6; text-shadow: none; }

    .orange  { background-color: #E69875; box-shadow: 3px 3px 0 0 rgba(0,0,0,0.14); text-shadow: 1px 1px 0 rgba(0,0,0,0.12); }
    .orange:hover  { color: #E69875; text-shadow: none; }

    .credit { margin: 24px 20px 120px 0; text-align: right; color: #D3C6AA; }
    .credit a { padding: 8px 0; color: #D699B6; text-decoration: none; transition: all .3s ease 0s; }
    .credit a:hover { text-decoration: underline; }

    .svg-inline--fa {
      display: inline-block !important;
      height: 100% !important;
      width: 50%;
    }
${customColorStyles}
  </style>

  <link rel="stylesheet" type="text/css" href="./circular.css" media="all">
  <script src="https://kit.fontawesome.com/f90668a2f5.js" crossorigin="anonymous"></script>
  <script>
    window.onload = function() {
      document.querySelectorAll('.menu-item i').forEach((icon, index) => {
        const iconKey = 'ICON' + (index + 1);
        icon.className = ICONS[iconKey] || "";
      });

      document.querySelectorAll('.menu-item').forEach((link, index) => {
        const uuidKey = 'UUID' + (index + 1);
        const uuid = UUIDS[uuidKey];
        if (!uuid) return;
        link.href = 'btt://execute_assigned_actions_for_trigger/?uuid=' + uuid + '&closeFloatingHTMLMenu=1';
      });
    };

    function BTTInitialize() {
      setTimeout(async () => {
        try {
          if (typeof resize_webview === "function") {
            await resize_webview({ width: 500, height: 500 });
          }
        } catch (e) {}

        document.getElementById("menu-open").checked = true;
      }, 0);
    }
    function BTTWillCloseWindow() {
      document.getElementById("menu-open").checked = false;
    }
  </script>
</head>
<body>
  <nav class="menu">
    <input type="checkbox" href="#" class="menu-open" name="menu-open" id="menu-open" onClick="window.location='btt://trigger_named/?trigger_name=dummy&closeFloatingHTMLMenu=1'"/>
    <label class="menu-open-button" for="menu-open">
      <span class="lines line-1"></span>
      <span class="lines line-2"></span>
      <span class="lines line-3"></span>
    </label>
${menuItemsHtml}
</nav>
</body>
</html>`;

    setGeneratedHtml(html);
    setEditableHtml(html);
  };

  const updateUuidWarningForItems = (items: typeof menuItems) => {
    const missing = items.filter((item) => item.uuid.trim().length === 0).length;
    setMissingUuidCount(missing);
    setShowUuidWarning(missing > 0);
    return missing;
  };

  const handleGenerateHtml = () => {
    updateUuidWarningForItems(menuItems);
    generateHtml(menuItems);
  };

  const handleUuidPaste = (itemId: number, pastedText: string) => {
    const pastedUuid = pastedText.trim();
    const nextMenuItems = menuItems.map((item) => (item.id === itemId ? { ...item, uuid: pastedUuid } : item));

    setMenuItems(nextMenuItems);
    updateUuidWarningForItems(nextMenuItems);
    generateHtml(nextMenuItems);
    showActionStatus("HTML updated from pasted UUID.");
  };

  const handleImportHtml = () => {
    const result = parseRadialMenuHtml(importHtml);
    setImportWarnings(result.warnings);
    setCanFixImportHtml(!result.isComplete);

    if (result.items.length === 0) {
      return;
    }

    const nextMenuItems = result.items.map((imported, index) => {
      const iconIsPreset = ICON_OPTIONS_SET.has(imported.iconClass);
      const colorIsPreset = presetColors.some((c) => c.hex.toLowerCase() === imported.colorHex.toLowerCase());

      return {
        id: Date.now() + index,
        uuid: imported.uuid,
        name: "",
        iconType: iconIsPreset ? "preset" : "custom",
        icon: iconIsPreset ? imported.iconClass : randomFrom(COMMON_ICONS),
        customIcon: iconIsPreset ? "" : imported.iconClass,
        colorType: colorIsPreset ? "preset" : "picker",
        color: imported.colorHex,
      };
    });

    setMenuItems(nextMenuItems);
    updateUuidWarningForItems(nextMenuItems);

    setGeneratedHtml(importHtml);
    setEditableHtml(importHtml);
    setEditingHtml(false);
    showActionStatus(result.isComplete ? "Imported menu items from HTML." : "Imported HTML (incomplete — use Fix HTML)."
    );
  };

  const handleFixImportHtml = () => {
    const result = parseRadialMenuHtml(importHtml);
    setImportWarnings(result.warnings);

    if (result.items.length === 0) {
      setCanFixImportHtml(false);
      return;
    }

    const nextMenuItems = result.items.map((imported, index) => {
      const iconIsPreset = ICON_OPTIONS_SET.has(imported.iconClass);
      const colorIsPreset = presetColors.some((c) => c.hex.toLowerCase() === imported.colorHex.toLowerCase());

      return {
        id: Date.now() + index,
        uuid: imported.uuid,
        name: "",
        iconType: iconIsPreset ? "preset" : "custom",
        icon: iconIsPreset ? imported.iconClass : randomFrom(COMMON_ICONS),
        customIcon: iconIsPreset ? "" : imported.iconClass,
        colorType: colorIsPreset ? "preset" : "picker",
        color: imported.colorHex,
      };
    });

    setMenuItems(nextMenuItems);
    updateUuidWarningForItems(nextMenuItems);
    generateHtml(nextMenuItems);
    setCanFixImportHtml(false);
    showActionStatus("Fixed HTML generated.");
  };

  const copyToClipboard = async (text: string, id: number | null = null) => {
    try {
      await navigator.clipboard.writeText(text);
      if (id != null) {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
      return true;
    } catch (err) {
      console.error("Failed to copy:", err);
      return false;
    }
  };

  const handleCopyGeneratedHtml = async () => {
    if (generatedHtmlCopyResetTimer.current) {
      clearTimeout(generatedHtmlCopyResetTimer.current);
      generatedHtmlCopyResetTimer.current = null;
    }

    const ok = await copyToClipboard(generatedHtml);
    setGeneratedHtmlCopyStatus(ok ? "copied" : "error");

    generatedHtmlCopyResetTimer.current = setTimeout(() => {
      setGeneratedHtmlCopyStatus("idle");
    }, 2000);
  };

  const downloadHtml = () => {
    const blob = new Blob([generatedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "radial-menu.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveEditedHtml = () => {
    setGeneratedHtml(editableHtml);
    setEditingHtml(false);
  };

  return (
    <div className="min-h-screen bg-ef-bg0 text-ef-fg relative overflow-hidden">
      <div className="absolute inset-0 opacity-15">
        <div className="absolute -top-24 -left-44 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: "#E67E80" }} />
        <div className="absolute -top-28 -right-56 w-[28rem] h-[28rem] rounded-full blur-3xl" style={{ backgroundColor: "#E69875" }} />
        <div className="absolute bottom-0 right-10 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: "#DBBC7F" }} />
        <div className="absolute -bottom-32 left-10 w-[26rem] h-[26rem] rounded-full blur-3xl" style={{ backgroundColor: "#D699B6" }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="backdrop-blur-2xl bg-gradient-to-r from-ef-bg1/55 to-ef-bg2/40 border-b border-ef-bg4/70 p-4 sm:p-6 mb-6 sm:mb-8 shadow-efsoft">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center text-ef-fg">
            Radial Menu Generator
          </h1>
          <p className="text-center mt-2" style={{ color: "#9DA9A0" }}>
            For BetterTouchTool
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <div className="space-y-8">
              {/* Menu Items Form */}
              <div className="backdrop-blur-2xl bg-gradient-to-br from-ef-bg1/55 to-ef-bg2/35 rounded-2xl p-6 border border-ef-bg4/70 shadow-efsoft">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-ef-fg">
                  <FileCode size={22} />
                  Menu Items Configuration
                </h2>

                <button
                  type="button"
                  onClick={randomizeIconsAndColors}
                  className="mb-4 px-4 py-2.5 rounded-md border transition-all duration-200 flex items-center gap-2 shadow-efsoft"
                  style={{ backgroundColor: "rgba(127,187,179,0.14)", borderColor: "rgba(127,187,179,0.30)", color: "#D3C6AA" }}
                >
                  <Shuffle size={18} />
                  Randomize icons and background color
                </button>

                <div className="space-y-4">
                  {menuItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="backdrop-blur-xl rounded-xl p-4 border border-ef-bg4/70 shadow-efsoft"
                      style={{ backgroundColor: "rgba(39,46,51,0.42)" }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-semibold" style={{ color: "#D3C6AA" }}>
                          #{index + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMenuItem(item.id)}
                          className="h-9 w-9 rounded-md border transition-all duration-200 shadow-efsoft flex items-center justify-center"
                          style={{ backgroundColor: "rgba(230,126,128,0.14)", borderColor: "rgba(230,126,128,0.30)", color: "#E67E80" }}
                          aria-label="Remove menu item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] items-start">
                        <div className="md:col-span-2">
                          <label className="text-sm block mb-1" style={{ color: "#9DA9A0" }}>UUID</label>
                          <input
                            type="text"
                            value={item.uuid}
                            onChange={(e) => updateMenuItem(item.id, "uuid", e.target.value)}
                            onPaste={(e) => {
                              const text = e.clipboardData.getData("text");
                              if (!text.trim()) return;
                              e.preventDefault();
                              handleUuidPaste(item.id, text);
                            }}
                            placeholder="22C9664D-D2AD-478F..."
                            className="w-full px-3 py-2.5 rounded-md bg-ef-bg1/80 border border-ef-bg4/70 outline-none focus:border-ef-yellow/60 focus:ring-2 focus:ring-ef-yellow/20 font-mono text-sm"
                            style={{ color: "#D3C6AA" }}
                          />
                        </div>

                        <div>
                          <label className="text-sm block mb-1" style={{ color: "#9DA9A0" }}>Name (Optional)</label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateMenuItem(item.id, "name", e.target.value)}
                            placeholder="Action name"
                            className="w-full px-3 py-2.5 rounded-md bg-ef-bg1/80 border border-ef-bg4/70 outline-none focus:border-ef-yellow/60 focus:ring-2 focus:ring-ef-yellow/20"
                            style={{ color: "#D3C6AA" }}
                          />
                        </div>

                        <div>
                          <label className="text-sm block mb-1" style={{ color: "#9DA9A0" }}>Icon Class</label>
                          <div>
                            <SearchableIconSelect
                              options={ICON_OPTIONS}
                              value={item.iconType === "custom" ? "__custom__" : item.icon}
                              customLabel={item.iconType === "custom" ? item.customIcon : undefined}
                              onChange={(next) => {
                                if (next === "__custom__") {
                                  updateMenuItemFields(item.id, {
                                    iconType: "custom",
                                    customIcon: item.customIcon?.trim().length ? item.customIcon : item.icon,
                                  });
                                  return;
                                }

                                updateMenuItemFields(item.id, {
                                  iconType: "preset",
                                  icon: next,
                                });
                              }}
                              className="w-full px-3 py-2.5 rounded-md bg-ef-bg1/80 border border-ef-bg4/70 outline-none focus:border-ef-yellow/60 focus:ring-2 focus:ring-ef-yellow/20 cursor-pointer"
                              style={{ color: "#D3C6AA" }}
                            />

                            {item.iconType === "custom" && (
                              <input
                                type="text"
                                value={item.customIcon}
                                onChange={(e) => updateMenuItemFields(item.id, { iconType: "custom", customIcon: e.target.value })}
                                placeholder="e.g., fa-solid fa-house"
                                className="mt-2 w-full px-3 py-2.5 rounded-md bg-ef-bg1/80 border border-ef-bg4/70 outline-none focus:border-ef-yellow/60 focus:ring-2 focus:ring-ef-yellow/20"
                                style={{ color: "#D3C6AA" }}
                              />
                            )}
                          </div>
                        </div>

                        <div className="md:col-span-2 xl:col-span-3">
                          <label className="text-sm block mb-1" style={{ color: "#9DA9A0" }}>Color</label>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <select
                                value={item.colorType === "preset" ? item.color : "__custom__"}
                                onChange={(e) => {
                                  const next = e.target.value;
                                  if (next === "__custom__") {
                                    updateMenuItemFields(item.id, { colorType: "picker" });
                                    return;
                                  }
                                  updateMenuItemFields(item.id, { colorType: "preset", color: next });
                                }}
                                className="min-w-0 flex-1 px-3 py-2.5 rounded-md bg-ef-bg1/80 border border-ef-bg4/70 outline-none focus:border-ef-yellow/60 focus:ring-2 focus:ring-ef-yellow/20"
                                style={{ color: "#D3C6AA" }}
                              >
                                <option value="__custom__">Custom…</option>
                                {presetColors.map((color) => (
                                  <option key={color.hex} value={color.hex}>{color.name}</option>
                                ))}
                              </select>

                              <input
                                type="color"
                                value={item.color}
                                onChange={(e) => updateMenuItemFields(item.id, { colorType: "picker", color: e.target.value })}
                                className="h-11 w-12 shrink-0 rounded-md bg-ef-bg1/80 border border-ef-bg4/70 cursor-pointer"
                                aria-label="Pick color"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <div
                                className="h-11 w-12 shrink-0 rounded-md border border-ef-bg4/70 shadow-efsoft"
                                style={{ backgroundColor: item.color }}
                                aria-hidden="true"
                              />
                              <input
                                type="text"
                                value={item.color}
                                onChange={(e) => updateMenuItemFields(item.id, { colorType: "picker", color: e.target.value })}
                                placeholder="#DBBC7F"
                                className="min-w-0 flex-1 px-3 py-2.5 rounded-md bg-ef-bg1/80 border border-ef-bg4/70 outline-none focus:border-ef-yellow/60 focus:ring-2 focus:ring-ef-yellow/20 text-sm font-mono"
                                style={{ color: "#D3C6AA" }}
                                aria-label="Color hex"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addMenuItem}
                  className="mt-4 px-4 py-2.5 rounded-md border transition-all duration-200 flex items-center gap-2 shadow-efsoft"
                  style={{ backgroundColor: "rgba(39,46,51,0.55)", borderColor: "rgba(65,75,80,0.70)", color: "#D3C6AA" }}
                >
                  <Plus size={18} />
                  Add Menu Item
                </button>

                <div className="mt-4 p-4 rounded-xl border shadow-efsoft" style={{ backgroundColor: "rgba(30,35,38,0.55)", borderColor: "rgba(65,75,80,0.70)" }}>
                  <p className="text-sm" style={{ color: "#D3C6AA" }}>
                    <strong className="text-ef-yellow">Note:</strong> For custom icons, browse free Font Awesome icons at{" "}
                    <a
                      href="https://fontawesome.com/search?f=classic&s=solid&ic=free&o=r"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                      style={{ color: "#DBBC7F" }}
                    >
                      fontawesome.com/search
                    </a>. Use the full class name (e.g., “fa-solid fa-house” or “fa-brands fa-github”).
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              {/* Actions */}
              <div className="backdrop-blur-2xl bg-gradient-to-br from-ef-bg1/55 to-ef-bg2/35 rounded-2xl p-6 border border-ef-bg4/70 shadow-efsoft">
                <h2 className="text-xl font-semibold mb-4 text-ef-fg">Actions</h2>
                <button
                  onClick={handleGenerateHtml}
                  className="w-full px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-efsoft backdrop-blur-sm transform hover:scale-[1.01] border"
                  style={{
                    backgroundColor: "rgba(39,46,51,0.70)",
                    color: "#DBBC7F",
                    borderColor: "rgba(219,188,127,0.22)",
                  }}
                  onMouseEnter={(e) => {
                    const t = e.currentTarget;
                    t.style.backgroundColor = "rgba(46,56,60,0.78)";
                    t.style.borderColor = "rgba(219,188,127,0.35)";
                    t.style.boxShadow = "0 14px 40px rgba(0,0,0,0.18)";
                  }}
                  onMouseLeave={(e) => {
                    const t = e.currentTarget;
                    t.style.backgroundColor = "rgba(39,46,51,0.70)";
                    t.style.borderColor = "rgba(219,188,127,0.22)";
                    t.style.boxShadow = "";
                  }}
                >
                  <FileCode size={20} />
                  Generate HTML
                </button>

                <div className="mt-3 min-h-[20px]" aria-live="polite" style={{ color: "#9DA9A0" }}>
                  {actionStatus}
                </div>

                {showUuidWarning && (
                  <div
                    className="mt-4 rounded-xl border p-4 shadow-efsoft"
                    style={{
                      backgroundColor: "rgba(219,188,127,0.10)",
                      borderColor: "rgba(219,188,127,0.30)",
                      color: "#D3C6AA",
                    }}
                    role="alert"
                  >
                    <p className="text-sm">
                      <span className="inline-flex items-center gap-2">
                        <AlertTriangle size={16} className="text-ef-red" />
                        <strong className="text-ef-yellow">UUID required:</strong>
                      </span>{" "}
                      The Floating radial menu won’t work in BetterTouchTool until you enter the trigger UUID for each item.
                      {missingUuidCount > 0 ? ` Missing UUIDs: ${missingUuidCount}.` : ""}
                    </p>
                    <p className="text-sm mt-2" style={{ color: "#9DA9A0" }}>
                      In BetterTouchTool, right click the item and select <strong>Copy Selected Item UUID</strong>, then paste it into the UUID field.
                      Items without a UUID won’t trigger anything until you add one.
                    </p>
                    <div className="mt-3">
                      <Image
                        src={copyUuidImage}
                        alt="BetterTouchTool context menu showing Copy Selected Item UUID"
                        className="rounded-lg border border-ef-bg4/70"
                        sizes="(max-width: 1024px) 100vw, 520px"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Import Existing HTML (Optional) */}
              <div className="backdrop-blur-2xl bg-gradient-to-br from-ef-bg1/55 to-ef-bg2/35 rounded-2xl p-6 border border-ef-bg4/70 shadow-efsoft flex flex-col">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <h2 className="text-xl font-semibold text-ef-fg">Import Existing HTML (Optional) </h2>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleImportHtml}
                      className="px-4 py-2 rounded-md border transition-all duration-200 flex items-center gap-2 shadow-efsoft w-full sm:w-auto justify-center"
                      style={{ backgroundColor: "rgba(127,187,179,0.14)", borderColor: "rgba(127,187,179,0.30)", color: "#D3C6AA" }}
                    >
                      <FileCode size={18} />
                      Import HTML
                    </button>
                    {canFixImportHtml && (
                      <button
                        onClick={handleFixImportHtml}
                        className="px-4 py-2 rounded-md border transition-all duration-200 flex items-center gap-2 shadow-efsoft w-full sm:w-auto justify-center"
                        style={{ backgroundColor: "rgba(230,152,117,0.18)", borderColor: "rgba(230,152,117,0.32)", color: "#D3C6AA" }}
                      >
                        <Wand2 size={18} />
                        Fix HTML
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  value={importHtml}
                  onChange={(e) => setImportHtml(e.target.value)}
                  placeholder="Paste your existing radial menu HTML here…"
                  className="scrollbar-ef-orange w-full h-56 max-h-[50vh] px-4 py-3 rounded-lg bg-ef-bg0/80 backdrop-blur-md border border-ef-bg4 focus:border-ef-g3 outline-none font-mono text-sm overflow-y-auto"
                  style={{ color: "#D3C6AA" }}
                />

                {importWarnings.length > 0 && (
                  <div
                    className="mt-4 rounded-xl border p-4 shadow-efsoft"
                    style={{ backgroundColor: "rgba(230,126,128,0.10)", borderColor: "rgba(230,126,128,0.30)", color: "#D3C6AA" }}
                    role="alert"
                  >
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <AlertTriangle size={16} className="text-ef-red" />
                      Imported HTML may be incomplete
                    </p>
                    <ul className="text-sm mt-2 list-disc pl-5" style={{ color: "#9DA9A0" }}>
                      {importWarnings.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <RadialMenuPreview items={menuItems} />

              {/* Generated HTML Output */}
              {generatedHtml && (
                <div className="backdrop-blur-2xl bg-gradient-to-br from-ef-bg1/55 to-ef-bg2/35 rounded-2xl p-6 border border-ef-bg4/70 shadow-efsoft flex flex-col">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <h2 className="text-xl font-semibold text-ef-fg">Generated HTML</h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleCopyGeneratedHtml}
                    className="px-4 py-2 rounded-md border transition-all duration-200 flex items-center gap-2 shadow-efsoft w-full sm:w-auto justify-center"
                    style={{ backgroundColor: "rgba(219,188,127,0.14)", borderColor: "rgba(219,188,127,0.30)", color: "#D3C6AA" }}
                  >
                    {generatedHtmlCopyStatus === "copied" ? <Check size={18} className="text-ef-yellow" /> : <Copy size={18} />}
                    {generatedHtmlCopyStatus === "copied" ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={() => setEditingHtml(!editingHtml)}
                    className="px-4 py-2 rounded-md border transition-all duration-200 flex items-center gap-2 shadow-efsoft w-full sm:w-auto justify-center"
                    style={{ backgroundColor: "rgba(214,153,182,0.22)", borderColor: "rgba(214,153,182,0.35)" }}
                  >
                    {editingHtml ? <X size={18} /> : <Edit3 size={18} />}
                    {editingHtml ? "Cancel" : "Edit"}
                  </button>
                  <button
                    onClick={downloadHtml}
                    className="px-4 py-2 rounded-md border transition-all duration-200 flex items-center gap-2 shadow-efsoft w-full sm:w-auto justify-center"
                    style={{ backgroundColor: "rgba(230,152,117,0.18)", borderColor: "rgba(230,152,117,0.32)", color: "#D3C6AA" }}
                  >
                    <Download size={18} />
                    Download
                  </button>
                  <div className="flex items-center" aria-live="polite" style={{ color: "#9DA9A0" }}>
                    {generatedHtmlCopyStatus === "copied" ? "Generated HTML copied." : generatedHtmlCopyStatus === "error" ? "Copy failed." : null}
                  </div>
                </div>
              </div>

              {editingHtml ? (
                <div className="flex flex-col gap-3">
                  <textarea
                    value={editableHtml}
                    onChange={(e) => setEditableHtml(e.target.value)}
                    className="scrollbar-ef-orange w-full h-96 max-h-[60vh] px-4 py-3 rounded-lg bg-ef-bg0/80 backdrop-blur-md border border-ef-bg4 focus:border-ef-g3 outline-none font-mono text-sm overflow-y-auto"
                    style={{ color: "#D3C6AA" }}
                  />
                  <button
                    onClick={saveEditedHtml}
                    className="px-4 py-2 rounded-md border transition-all duration-200 flex items-center gap-2 shadow-efsoft"
                    style={{ backgroundColor: "rgba(219,188,127,0.16)", borderColor: "rgba(219,188,127,0.30)", color: "#D3C6AA" }}
                  >
                    <Check size={18} />
                    Save Changes
                  </button>
                </div>
              ) : (
                <pre className="scrollbar-ef-orange max-h-[60vh] overflow-x-auto overflow-y-auto p-4 rounded-lg bg-ef-bg0/70 backdrop-blur-md border border-ef-bg4">
                  <code className="text-sm" style={{ color: "#D3C6AA" }}>{generatedHtml}</code>
                </pre>
              )}
                </div>
              )}

              {/* Item Summary */}
              {generatedHtml && menuItems.filter((item) => item.uuid.trim().length > 0).length > 0 && (
                <div className="backdrop-blur-2xl bg-gradient-to-br from-ef-bg1/55 to-ef-bg2/35 rounded-2xl p-6 border border-ef-bg4/70 shadow-efsoft">
                  <h2 className="text-xl font-semibold mb-4 text-ef-fg">Menu Items Summary</h2>
                  <div className="space-y-2">
                    {menuItems.filter((item) => item.uuid.trim().length > 0).map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-xl backdrop-blur-xl border border-ef-bg4/70 shadow-efsoft" style={{ backgroundColor: "rgba(30,35,38,0.62)" }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-efsoft" style={{ backgroundColor: item.color }}>
                            <span className="text-ef-bg0 text-lg font-semibold">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: "#D3C6AA" }}>{item.name || `Item ${index + 1}`}</p>
                            <p className="text-sm" style={{ color: "#859289" }}>Icon: {item.iconType === "custom" ? item.customIcon : item.icon}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs px-2 py-1 rounded bg-ef-bg0/70 backdrop-blur-sm border border-ef-bg4/70" style={{ color: "#D3C6AA" }}>
                            {item.uuid}
                          </code>
                          <button
                            onClick={() => copyToClipboard(item.uuid, item.id)}
                            className="p-1 rounded transition-all duration-200 hover:bg-ef-bg1/60"
                            aria-label="Copy UUID"
                          >
                            {copiedId === item.id ? <Check size={16} className="text-ef-yellow" /> : <Copy size={16} />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadialMenuGenerator;
