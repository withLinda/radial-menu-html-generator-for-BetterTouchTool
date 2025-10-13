"use client";

import React, { useState } from "react";
import { Plus, Trash2, Copy, Edit3, Check, X, FileCode, Download } from "lucide-react";

/**
 * This component matches the attached TSX structure & logic,
 * but all colors are refit to the Everforest Dark Hard palette.
 * Main background uses ef.bg0 (#1E2326).
 */
const RadialMenuGenerator = () => {
  const [menuItems, setMenuItems] = useState([
    { id: 1, uuid: "", name: "", icon: "fa-star", iconType: "preset", customIcon: "", color: "#7FBBB3", colorType: "picker" },
  ]);
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [editingHtml, setEditingHtml] = useState(false);
  const [editableHtml, setEditableHtml] = useState("");

  // Everforest preset accents used in summaries & presets
  const presetColors = [
    { name: "red", hex: "#E67E80" },
    { name: "yellow", hex: "#DBBC7F" },
    { name: "green", hex: "#83C092" }, // close to aqua/green accent
    { name: "blue", hex: "#7FBBB3" },  // cyan
    { name: "purple", hex: "#D699B6" },
    { name: "orange", hex: "#E69875" },
    { name: "lightblue", hex: "#83C092" } // mapped to aqua to stay in palette
  ];

  const commonIcons = [
    "fa-star", "fa-book", "fa-google", "fa-search", "fa-hamburger",
    "fa-window-restore", "fa-clock", "fa-camera", "fa-file-word",
    "fa-wikipedia-w", "fa-hubspot", "fa-youtube-play", "fa-upload",
    "fa-connectdevelop", "fa-bug", "fa-firefox", "fa-pause", "fa-comments",
    "fa-bell", "fa-eject", "fa-keyboard", "fa-expand-arrows-alt"
  ];

  const addMenuItem = () => {
    const newItem = {
      id: Date.now(),
      uuid: "",
      name: "",
      icon: "fa-star",
      iconType: "preset",
      customIcon: "",
      color: "#7FBBB3",
      colorType: "picker",
    };
    setMenuItems([...menuItems, newItem]);
  };

  const removeMenuItem = (id: number) => {
    setMenuItems(menuItems.filter((item) => item.id !== id));
  };

  const updateMenuItem = (id: number, field: string, value: any) => {
    setMenuItems(menuItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const generateHtml = () => {
    // unique custom colors (non-preset)
    const customColors = [...new Set(
      menuItems
        .filter((item) => item.uuid && !presetColors.find((c) => c.hex === item.color))
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

    const menuItemsHtml = menuItems
      .filter((item) => item.uuid)
      .map((item) => {
        const iconToUse = item.iconType === "custom" ? item.customIcon : item.icon;
        const iconPrefix = iconToUse.includes("brands")
          ? "fab"
          : iconToUse.includes("regular")
          ? "far"
          : iconToUse.includes("solid")
          ? "fas"
          : "fa";
        const iconClass = iconToUse.startsWith("fa-") ? iconToUse : `fa-${iconToUse}`;

        const colorClass = presetColors.find((c) => c.hex === item.color)?.name || "";
        const hasPresetColor = !!colorClass;
        const styleAttr = !hasPresetColor ? ` style="background-color: ${item.color};"` : "";

        return `    <a href="btt://execute_assigned_actions_for_trigger/?uuid=${item.uuid}&closeFloatingHTMLMenu=1" class="menu-item${hasPresetColor ? " " + colorClass : ""}"${styleAttr}> <i class="${iconPrefix} ${iconClass}"></i> </a>`;
      })
      .join("\n");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
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
    .menu-item:nth-child(3) { transition-duration: 180ms; }
    .menu-item:nth-child(4) { transition-duration: 180ms; }
    .menu-item:nth-child(5) { transition-duration: 180ms; }
    .menu-item:nth-child(6) { transition-duration: 180ms; }
    .menu-item:nth-child(7) { transition-duration: 180ms; }
    .menu-item:nth-child(8) { transition-duration: 180ms; }
    .menu-item:nth-child(9) { transition-duration: 180ms; }

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

    .menu-open:checked ~ .menu-item:nth-child(3) { transition-duration: 180ms; transform: translate3d(0.08361px, -104.99997px, 0); }
    .menu-open:checked ~ .menu-item:nth-child(4) { transition-duration: 280ms; transform: translate3d(90.9466px, -52.47586px, 0); }
    .menu-open:checked ~ .menu-item:nth-child(5) { transition-duration: 380ms; transform: translate3d(90.9466px, 52.47586px, 0); }
    .menu-open:checked ~ .menu-item:nth-child(6) { transition-duration: 480ms; transform: translate3d(0.08361px, 104.99997px, 0); }
    .menu-open:checked ~ .menu-item:nth-child(7) { transition-duration: 580ms; transform: translate3d(-90.86291px, 52.62064px, 0); }
    .menu-open:checked ~ .menu-item:nth-child(8) { transition-duration: 680ms; transform: translate3d(-91.03006px, -52.33095px, 0); }
    .menu-open:checked ~ .menu-item:nth-child(9) { transition-duration: 780ms; transform: translate3d(-0.25084px, -104.9997px, 0); }

    /* Everforest accent classes */
    .blue    { background-color: #7FBBB3; box-shadow: 3px 3px 0 0 rgba(0,0,0,0.14); text-shadow: 1px 1px 0 rgba(0,0,0,0.12); }
    .blue:hover    { color: #7FBBB3; text-shadow: none; }

    .green   { background-color: #83C092; box-shadow: 3px 3px 0 0 rgba(0,0,0,0.14); text-shadow: 1px 1px 0 rgba(0,0,0,0.12); }
    .green:hover   { color: #83C092; text-shadow: none; }

    .red     { background-color: #E67E80; box-shadow: 3px 3px 0 0 rgba(0,0,0,0.14); text-shadow: 1px 1px 0 rgba(0,0,0,0.12); }
    .red:hover     { color: #E67E80; text-shadow: none; }

    .purple  { background-color: #D699B6; box-shadow: 3px 3px 0 0 rgba(0,0,0,0.14); text-shadow: 1px 1px 0 rgba(0,0,0,0.12); }
    .purple:hover  { color: #D699B6; text-shadow: none; }

    .orange  { background-color: #E69875; box-shadow: 3px 3px 0 0 rgba(0,0,0,0.14); text-shadow: 1px 1px 0 rgba(0,0,0,0.12); }
    .orange:hover  { color: #E69875; text-shadow: none; }

    .lightblue { background-color: #83C092; box-shadow: 3px 3px 0 0 rgba(0,0,0,0.14); text-shadow: 1px 1px 0 rgba(0,0,0,0.12); }
    .lightblue:hover { color: #83C092; text-shadow: none; }

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
    function BTTInitialize() {
      setTimeout(() => {
        document.getElementById("menu-open").checked = true;
      }, 0);
    }
    function BTTWillCloseWindow() {
      document.getElementById("menu-open").checked = false;
    }
  </script>
</head>
<nav class="menu">
  <div id="test"></div>
  <input type="checkbox" href="#" class="menu-open" name="menu-open" id="menu-open" onClick="window.location='btt://trigger_named/?trigger_name=dummy&closeFloatingHTMLMenu=1'"/>
  <label class="menu-open-button" for="menu-open">
    <span class="lines line-1"></span>
    <span class="lines line-2"></span>
    <span class="lines line-3"></span>
  </label>
${menuItemsHtml}
</nav>
</html>`;

    setGeneratedHtml(html);
    setEditableHtml(html);
  };

  const copyToClipboard = async (text: string, id: number | null = null) => {
    try {
      await navigator.clipboard.writeText(text);
      if (id) {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
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
    <div className="min-h-screen text-ef-fg relative overflow-hidden" style={{ backgroundColor: "#1E2326" }}>
      {/* Background blobs swapped to Everforest accents */}
      <div className="absolute inset-0 opacity-25">
        <div className="absolute top-0 -left-40 w-80 h-80 rounded-full mix-blend-multiply blur-3xl" style={{ backgroundColor: "#E67E80" }} />
        <div className="absolute top-0 -right-40 w-80 h-80 rounded-full mix-blend-multiply blur-3xl" style={{ backgroundColor: "#DBBC7F" }} />
        <div className="absolute bottom-0 left-40 w-80 h-80 rounded-full mix-blend-multiply blur-3xl" style={{ backgroundColor: "#7FBBB3" }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="backdrop-blur-xl bg-gradient-to-r from-ef-bg1/60 to-ef-bg2/60 border-b border-ef-bg4 p-6 mb-8 shadow-efsoft">
          <h1 className="text-3xl font-bold text-center" style={{ color: "#83C092" }}>
            Radial Menu Generator
          </h1>
          <p className="text-center mt-2" style={{ color: "#9DA9A0" }}>
            For BetterTouchTool
          </p>
        </div>

        <div className="max-w-6xl mx-auto p-6 space-y-8">
          {/* Menu Items Form */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-ef-bg1/70 to-ef-bg2/50 rounded-xl p-6 border border-ef-bg4 shadow-efsoft">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: "#7FBBB3" }}>
              <FileCode size={24} />
              Menu Items Configuration
            </h2>

            <div className="space-y-4">
              {menuItems.map((item, index) => (
                <div key={item.id} className="backdrop-blur-md rounded-lg p-4 border border-ef-bg4 shadow-efsoft" style={{ backgroundColor: "rgba(39,46,51,0.5)" }}>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    <div>
                      <label className="text-sm block mb-1" style={{ color: "#9DA9A0" }}>UUID</label>
                      <input
                        type="text"
                        value={item.uuid}
                        onChange={(e) => updateMenuItem(item.id, "uuid", e.target.value)}
                        placeholder="22C9664D-D2AD-478F..."
                        className="w-full px-3 py-2 rounded-md bg-ef-bg1 border border-ef-bg4 focus:border-ef-g3 outline-none"
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
                        className="w-full px-3 py-2 rounded-md bg-ef-bg1 border border-ef-bg4 focus:border-ef-g3 outline-none"
                        style={{ color: "#D3C6AA" }}
                      />
                    </div>

                    <div>
                      <label className="text-sm block mb-1" style={{ color: "#9DA9A0" }}>Icon Class</label>
                      <div className="space-y-2">
                        <select
                          value={item.iconType}
                          onChange={(e) => updateMenuItem(item.id, "iconType", e.target.value)}
                          className="w-full px-3 py-2 rounded-md bg-ef-bg1 border border-ef-bg4 focus:border-ef-g3 outline-none"
                          style={{ color: "#D3C6AA" }}
                        >
                          <option value="preset">Select from list</option>
                          <option value="custom">Custom icon class</option>
                        </select>
                        {item.iconType === "preset" ? (
                          <select
                            value={item.icon}
                            onChange={(e) => updateMenuItem(item.id, "icon", e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-ef-bg1 border border-ef-bg4 focus:border-ef-g3 outline-none"
                            style={{ color: "#D3C6AA" }}
                          >
                            {commonIcons.map((icon) => (
                              <option key={icon} value={icon}>{icon}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={item.customIcon}
                            onChange={(e) => updateMenuItem(item.id, "customIcon", e.target.value)}
                            placeholder="e.g., fa-solid fa-house"
                            className="w-full px-3 py-2 rounded-md bg-ef-bg1 border border-ef-bg4 focus:border-ef-g3 outline-none"
                            style={{ color: "#D3C6AA" }}
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm block mb-1" style={{ color: "#9DA9A0" }}>Color</label>
                      <div className="space-y-2">
                        <select
                          value={item.colorType}
                          onChange={(e) => {
                            updateMenuItem(item.id, "colorType", e.target.value);
                            if (e.target.value === "preset") {
                              updateMenuItem(item.id, "color", presetColors[0].hex);
                            }
                          }}
                          className="w-full px-3 py-2 rounded-md bg-ef-bg1 border border-ef-bg4 focus:border-ef-g3 outline-none"
                          style={{ color: "#D3C6AA" }}
                        >
                          <option value="picker">Custom color</option>
                          <option value="preset">Preset colors</option>
                        </select>
                        {item.colorType === "preset" ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={item.color}
                              onChange={(e) => updateMenuItem(item.id, "color", e.target.value)}
                              className="flex-1 px-3 py-2 rounded-md bg-ef-bg1 border border-ef-bg4 focus:border-ef-g3 outline-none"
                              style={{ color: "#D3C6AA" }}
                            >
                              {presetColors.map((color) => (
                                <option key={color.hex} value={color.hex}>{color.name}</option>
                              ))}
                            </select>
                            <div className="w-8 h-8 rounded border border-ef-bg4" style={{ backgroundColor: item.color }} />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={item.color}
                              onChange={(e) => updateMenuItem(item.id, "color", e.target.value)}
                              className="w-full h-10 rounded-md bg-ef-bg1 border border-ef-bg4 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={item.color}
                              onChange={(e) => updateMenuItem(item.id, "color", e.target.value)}
                              placeholder="#7FBBB3"
                              className="w-24 px-2 py-2 rounded-md bg-ef-bg1 border border-ef-bg4 focus:border-ef-g3 outline-none text-sm"
                              style={{ color: "#D3C6AA" }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeMenuItem(item.id)}
                      className="px-3 py-2 rounded-md border transition-all duration-200 shadow-efsoft"
                      style={{ backgroundColor: "rgba(230,126,128,0.18)", borderColor: "rgba(230,126,128,0.35)" }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addMenuItem}
              className="mt-4 px-4 py-2 rounded-md border transition-all duration-200 flex items-center gap-2 shadow-efsoft"
              style={{ backgroundColor: "rgba(131,192,146,0.22)", borderColor: "rgba(131,192,146,0.35)" }}
            >
              <Plus size={18} />
              Add Menu Item
            </button>

            <div className="mt-4 p-4 rounded-lg border shadow-efsoft" style={{ backgroundColor: "rgba(219,188,127,0.18)", borderColor: "rgba(219,188,127,0.35)" }}>
              <p className="text-sm" style={{ color: "#D3C6AA" }}>
                <strong>Note:</strong> For custom icons, browse free Font Awesome icons at{" "}
                <a
                  href="https://fontawesome.com/search?f=classic&s=solid&ic=free&o=r"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: "#DBBC7F" }}
                >
                  fontawesome.com/search
                </a>. Use the full class name (e.g., "fa-solid fa-house" or "fa-brands fa-github").
              </p>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <button
              onClick={generateHtml}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-efsoft backdrop-blur-sm transform hover:scale-105 border"
              style={{
                backgroundColor: "rgba(131,192,146,0.85)", // ef.aqua/green-ish
                color: "#1E2326", // ef.bg0
                borderColor: "rgba(131,192,146,0.35)"
              }}
              onMouseEnter={(e) => {
                const t = e.currentTarget;
                t.style.backgroundColor = "rgba(131,192,146,0.95)";
                t.style.boxShadow = "0 10px 30px rgba(211,198,170,0.12)";
              }}
              onMouseLeave={(e) => {
                const t = e.currentTarget;
                t.style.backgroundColor = "rgba(131,192,146,0.85)";
                t.style.boxShadow = "";
              }}
            >
              <FileCode size={20} />
              Generate HTML
            </button>
          </div>

          {/* Generated HTML Output */}
          {generatedHtml && (
            <div className="backdrop-blur-xl bg-gradient-to-br from-ef-bg1/70 to-ef-bg2/50 rounded-xl p-6 border border-ef-bg4 shadow-efsoft">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold" style={{ color: "#7FBBB3" }}>Generated HTML</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedHtml)}
                    className="px-4 py-2 rounded-md border transition-all duration-200 flex items-center gap-2 shadow-efsoft"
                    style={{ backgroundColor: "rgba(127,187,179,0.22)", borderColor: "rgba(127,187,179,0.35)" }}
                  >
                    <Copy size={18} />
                    Copy
                  </button>
                  <button
                    onClick={() => setEditingHtml(!editingHtml)}
                    className="px-4 py-2 rounded-md border transition-all duration-200 flex items-center gap-2 shadow-efsoft"
                    style={{ backgroundColor: "rgba(214,153,182,0.22)", borderColor: "rgba(214,153,182,0.35)" }}
                  >
                    {editingHtml ? <X size={18} /> : <Edit3 size={18} />}
                    {editingHtml ? "Cancel" : "Edit"}
                  </button>
                  <button
                    onClick={downloadHtml}
                    className="px-4 py-2 rounded-md border transition-all duration-200 flex items-center gap-2 shadow-efsoft"
                    style={{ backgroundColor: "rgba(131,192,146,0.22)", borderColor: "rgba(131,192,146,0.35)" }}
                  >
                    <Download size={18} />
                    Download
                  </button>
                </div>
              </div>

              {editingHtml ? (
                <div>
                  <textarea
                    value={editableHtml}
                    onChange={(e) => setEditableHtml(e.target.value)}
                    className="w-full h-96 px-4 py-3 rounded-lg bg-ef-bg0/80 backdrop-blur-md border border-ef-bg4 focus:border-ef-g3 outline-none font-mono text-sm"
                    style={{ color: "#D3C6AA" }}
                  />
                  <button
                    onClick={saveEditedHtml}
                    className="mt-3 px-4 py-2 rounded-md border transition-all duration-200 flex items-center gap-2 shadow-efsoft"
                    style={{ backgroundColor: "rgba(131,192,146,0.22)", borderColor: "rgba(131,192,146,0.35)" }}
                  >
                    <Check size={18} />
                    Save Changes
                  </button>
                </div>
              ) : (
                <pre className="overflow-x-auto p-4 rounded-lg bg-ef-bg0/70 backdrop-blur-md border border-ef-bg4">
                  <code className="text-sm" style={{ color: "#D3C6AA" }}>{generatedHtml}</code>
                </pre>
              )}
            </div>
          )}

          {/* Item Summary */}
          {generatedHtml && menuItems.filter((item) => item.uuid).length > 0 && (
            <div className="backdrop-blur-xl bg-gradient-to-br from-ef-bg1/70 to-ef-bg2/50 rounded-xl p-6 border border-ef-bg4 shadow-efsoft">
              <h2 className="text-xl font-semibold mb-4" style={{ color: "#7FBBB3" }}>Menu Items Summary</h2>
              <div className="space-y-2">
                {menuItems.filter((item) => item.uuid).map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg backdrop-blur-md border border-ef-bg4 shadow-efsoft" style={{ backgroundColor: "rgba(30,35,38,0.7)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-efsoft" style={{ backgroundColor: item.color }}>
                        <span className="text-ef-bg0 text-lg font-semibold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: "#D3C6AA" }}>{item.name || `Item ${index + 1}`}</p>
                        <p className="text-sm" style={{ color: "#859289" }}>Icon: {item.iconType === "custom" ? item.customIcon : item.icon}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs px-2 py-1 rounded bg-ef-bg0/70 backdrop-blur-sm border border-ef-bg4" style={{ color: "#D3C6AA" }}>
                        {item.uuid}
                      </code>
                      <button
                        onClick={() => copyToClipboard(item.uuid, item.id)}
                        className="p-1 rounded transition-all duration-200 hover:bg-ef-bg1"
                      >
                        {copiedId === item.id ? <Check size={16} className="text-ef-aqua" /> : <Copy size={16} />}
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
  );
};

export default RadialMenuGenerator;
