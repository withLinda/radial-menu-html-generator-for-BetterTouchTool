import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const faRoot = path.join(repoRoot, "node_modules", "@fortawesome", "fontawesome-free");
const faPackageJsonPath = path.join(faRoot, "package.json");
const metadataPath = path.join(faRoot, "metadata", "icon-families.json");
const outPath = path.join(repoRoot, "components", "fontawesomeFreeIconClasses.ts");

const STYLE_TO_PREFIX = {
  solid: "fa-solid",
  regular: "fa-regular",
  brands: "fa-brands",
};

const [faPackageJsonRaw, iconFamiliesRaw] = await Promise.all([
  fs.readFile(faPackageJsonPath, "utf8"),
  fs.readFile(metadataPath, "utf8"),
]);

const faPackageJson = JSON.parse(faPackageJsonRaw);
const iconFamilies = JSON.parse(iconFamiliesRaw);

const classes = new Set();

for (const [iconName, meta] of Object.entries(iconFamilies)) {
  const free = meta?.familyStylesByLicense?.free ?? [];
  for (const entry of free) {
    if (entry.family !== "classic") continue;

    const prefix = STYLE_TO_PREFIX[entry.style];
    if (!prefix) continue;

    classes.add(`${prefix} fa-${iconName}`);
  }
}

const sorted = Array.from(classes).sort((a, b) => a.localeCompare(b));

const contents = `export const FONT_AWESOME_FREE_VERSION = ${JSON.stringify(faPackageJson.version)};\n\nexport const fontawesomeFreeIconClasses: readonly string[] = ${JSON.stringify(
  sorted,
  null,
  2
)};\n`;

await fs.writeFile(outPath, contents);

console.log(`Wrote ${sorted.length} icon classes to ${path.relative(repoRoot, outPath)}`);
