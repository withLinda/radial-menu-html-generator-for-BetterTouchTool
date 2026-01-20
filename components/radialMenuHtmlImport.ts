export type ImportedRadialMenuItem = {
  uuid: string;
  iconClass: string;
  colorHex: string;
  source: {
    uuid: "uuids-array" | "href" | "missing";
    icon: "icons-array" | "i-class" | "default";
    color: "class" | "style" | "default";
  };
};

export type ImportRadialMenuResult = {
  items: ImportedRadialMenuItem[];
  warnings: string[];
  isComplete: boolean;
};

const PRESET_CLASS_TO_HEX: Record<string, string> = {
  yellow: "#DBBC7F",
  red: "#E67E80",
  aqua: "#83C092",
  cyan: "#7FBBB3",
  orange: "#E69875",
  pink: "#D699B6",
  purple: "#D699B6",
  green: "#83C092",
  blue: "#7FBBB3",
};

function parseConstJsonArray(source: string, constName: string): string[] | null {
  const match = source.match(new RegExp(`\\bconst\\s+${constName}\\s*=\\s*(\\[[\\s\\S]*?\\])\\s*;`));
  if (!match) return null;
  const raw = match[1];
  try {
    const value = JSON.parse(raw);
    if (Array.isArray(value) && value.every((v) => typeof v === "string")) return value;
  } catch {
    // ignore
  }
  return null;
}

function unescapeJsStringLiteral(raw: string): string {
  return raw
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

function parseConstKeyedObject(source: string, constName: string, keyPrefix: string): string[] | null {
  const match = source.match(new RegExp(`\\bconst\\s+${constName}\\s*=\\s*\\{([\\s\\S]*?)\\}\\s*;`));
  if (!match) return null;

  const body = match[1];
  const entryRe = new RegExp(`\\b${keyPrefix}(\\d+)\\s*:\\s*(['\"])([\\s\\S]*?)\\2`, "g");
  const byIndex = new Map<number, string>();

  for (const m of body.matchAll(entryRe)) {
    const index = Number(m[1]);
    if (!Number.isFinite(index) || index <= 0) continue;
    byIndex.set(index, unescapeJsStringLiteral(m[3] ?? ""));
  }

  if (byIndex.size === 0) return null;
  const maxIndex = Math.max(...byIndex.keys());
  return Array.from({ length: maxIndex }, (_, i) => byIndex.get(i + 1) ?? "");
}

function extractUuidFromHref(href: string): string {
  const idx = href.indexOf("uuid=");
  if (idx === -1) return "";

  const after = href.slice(idx + "uuid=".length);
  const end = after.search(/[&#]/);
  const raw = end === -1 ? after : after.slice(0, end);
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw.trim();
  }
}

function extractColorFromStyle(style: string): string {
  const match = style.match(/background-color\s*:\s*([^;]+)\s*;?/i);
  return match?.[1]?.trim() ?? "";
}

export function parseRadialMenuHtml(html: string): ImportRadialMenuResult {
  const warnings: string[] = [];

  if (typeof DOMParser === "undefined") {
    return {
      items: [],
      warnings: ["HTML import requires a browser environment."],
      isComplete: false,
    };
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  const anchors = Array.from(doc.querySelectorAll<HTMLAnchorElement>("a.menu-item"));
  if (anchors.length === 0) {
    return {
      items: [],
      warnings: ["No .menu-item links found in pasted HTML."],
      isComplete: false,
    };
  }

  const uuidsArray = parseConstJsonArray(html, "UUIDS") ?? parseConstKeyedObject(html, "UUIDS", "UUID");
  const iconsArray = parseConstJsonArray(html, "ICONS") ?? parseConstKeyedObject(html, "ICONS", "ICON");
  if (uuidsArray && uuidsArray.length !== anchors.length) warnings.push("UUIDS array length does not match number of menu items.");
  if (iconsArray && iconsArray.length !== anchors.length) warnings.push("ICONS array length does not match number of menu items.");

  let missingIconCount = 0;
  let missingUuidCount = 0;
  const items: ImportedRadialMenuItem[] = anchors.map((a, index) => {
    const href = a.getAttribute("href") ?? "";
    const uuidFromArray = uuidsArray?.[index] ?? "";
    const uuidFromHref = extractUuidFromHref(href);

    const uuid = (uuidFromArray || uuidFromHref || "").trim();
    const uuidSource: ImportedRadialMenuItem["source"]["uuid"] = uuidFromArray
      ? "uuids-array"
      : uuidFromHref
        ? "href"
        : "missing";
    if (!uuidFromArray && !uuidFromHref) missingUuidCount += 1;

    const iconFromArray = iconsArray?.[index] ?? "";
    const iconFromI = (a.querySelector("i")?.getAttribute("class") ?? "").trim();
    const iconClass = (iconFromArray || iconFromI || "fa-solid fa-star").trim();
    const iconSource: ImportedRadialMenuItem["source"]["icon"] = iconFromArray
      ? "icons-array"
      : iconFromI
        ? "i-class"
        : "default";
    if (!iconFromArray && !iconFromI) missingIconCount += 1;

    const classList = Array.from(a.classList);
    const matchedPresetClass = classList.find((c) => PRESET_CLASS_TO_HEX[c]);
    const styleAttr = a.getAttribute("style") ?? "";
    const styleColor = extractColorFromStyle(styleAttr);
    const colorHex = (matchedPresetClass ? PRESET_CLASS_TO_HEX[matchedPresetClass] : styleColor || "#DBBC7F").trim();
    const colorSource: ImportedRadialMenuItem["source"]["color"] = matchedPresetClass
      ? "class"
      : styleColor
        ? "style"
        : "default";

    return {
      uuid,
      iconClass,
      colorHex,
      source: {
        uuid: uuidSource,
        icon: iconSource,
        color: colorSource,
      },
    };
  });

  if (missingUuidCount > 0) warnings.push(`${missingUuidCount} menu item(s) were missing UUID info; those items won't trigger anything until you add UUIDs.`);
  if (missingIconCount > 0) warnings.push(`${missingIconCount} menu item(s) were missing icon info; default icons were applied.`);

  const hasStrongArrays = !!uuidsArray && !!iconsArray && uuidsArray.length === anchors.length && iconsArray.length === anchors.length;
  const hasInlineIconsForAll = items.every((i) => i.source.icon !== "default");
  const isComplete = hasStrongArrays || hasInlineIconsForAll;

  return { items, warnings, isComplete };
}
